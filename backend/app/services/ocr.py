# ocr.py
import base64
from anthropic import Client
import os
from dotenv import load_dotenv
import json
import io
from PyPDF2 import PdfReader
import asyncio
import re
import time
from functools import lru_cache


load_dotenv()
client = Client(api_key=os.getenv('ANTHROPIC_API_KEY'))

async def extract_text_from_document(file_content: bytes, file_type: str, max_retries=3) -> dict:
    """
    Extract text from PDF or image files using Claude's vision capabilities.
    Returns structured data from the medical bill.
    """
    start_time = time.time()
    
    if file_type == "application/pdf":
        # Handle multi-page PDFs
        pdf = PdfReader(io.BytesIO(file_content))
        # Convert first page to image or use directly if Claude supports PDF
        file_content = pdf.pages[0].extract_bytes()  # Or implement PDF->image conversion
    
    for attempt in range(max_retries):
        try:
            encoded_content = base64.b64encode(file_content).decode('utf-8')
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1500,
                system="You're a text analyser that outputs only json array objects...",
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": file_type,
                                "data": encoded_content
                            }
                        },
                        {
                            "type": "text",
                            "text": """Extract medical bill text into this JSON structure:
                            {
                                "billing_details": {
                                    "procedure_codes": [
                                        {
                                            "code": "",
                                            "description": "",
                                            "quantity": 0,
                                            "cost": 0,
                                            "is_subtotal": false
                                        }
                                    ],
                                    "total_cost": 0
                                }
                            }

                            Rules:
                            1. Include all visible text, numbers, codes, and details relevant to this JSON format.
                            2. "code" is the procedure code (CPT or HCPCS).
                                -CPT codes (HCPCS Level I):
                                    a. Consist of 5 numeric digits
                                    b. Some may have a 5th alpha character (F, T, or U)
                                -HCPCS codes (HCPCS Level I):
                                    a. Consist of 1 letter followed by 4 numeric digits
                                    b. Always begin with a single alphabetical character (A-V)
                            3. "description" is the name or description of the procedure
                            4. "quantity" is the number of units of the procedure
                            5. "cost" is the cost of the procedure
                            6. For calculating total_cost:
                               ONLY include costs that meet these criteria:
                               - Has a specific procedure code (CPT/HCPCS)
                               - Is an individual line item, not a category total
                               - Is the most detailed level of cost (lowest in the hierarchy)
                               
                               IGNORE these costs:
                               - Category headers (like "Medical/Surgical Supplies Total: $382.25")
                               - Subtotals or running totals
                               - Any cost that is a sum of other itemized costs below it
                               
                               Example:
                               ❌ Medical/Surgical Supplies: $382.25
                                  ✅ Epidural Kit (C1755): $235.60
                                  ✅ IV Supplies (A4223): $146.65
                               
                               In this case, only add $235.60 + $146.65 to total_cost, NOT the $382.25
                               
                               7. For each procedure, set is_subtotal=true if it's a category total or header
                            """
                        }
                    ]
                }]
            )
            
            extracted_text = response.content[0].text
            
            try:
                # Clean and validate the response
                extracted_text = re.search(r'\{.*\}', extracted_text, re.DOTALL)
                if extracted_text:
                    extracted_text = extracted_text.group()
                
                parsed_json = json.loads(extracted_text)
                
                # Check if we got valid procedure codes
                if parsed_json.get("billing_details", {}).get("procedure_codes", []):
                    end_time = time.time()
                    print(f"OCR Time taken: {end_time - start_time} seconds")
                    return {
                        "success": True,
                        "extracted_text": parsed_json,
                        "file_type": file_type
                    }
                else:
                    print(f"Attempt {attempt + 1}: No procedure codes found, retrying...")
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)  # Exponential backoff
                        continue
                        
            except json.JSONDecodeError as e:
                print(f"Attempt {attempt + 1}: JSON Parse Error: {e}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
                    
        except Exception as e:
            print(f"Attempt {attempt + 1}: API Error: {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)
                continue
    
    # If all retries failed
    return {
        "success": False,
        "error": "Failed to extract text after multiple attempts",
        "file_type": file_type
    }

