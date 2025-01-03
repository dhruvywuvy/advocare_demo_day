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
from PIL import Image
import cv2
import numpy as np
from io import BytesIO
from pdf2image import convert_from_bytes



load_dotenv()
client = Client(api_key=os.getenv('ANTHROPIC_API_KEY'))

async def extract_text_from_document(file_content: bytes, file_type: str, max_retries=3) -> dict:
    """
    Extract text from PDF or image files using Claude's vision capabilities.
    Returns structured data from the medical bill.
    """
    start_time = time.time()
    
    if file_type == "application/pdf":
        try:
            # Convert PDF to image
            images = convert_from_bytes(file_content)
            if not images:
                raise Exception("Could not convert PDF to image")
                
            # Just use the first page
            first_page = images[0]
            
            # Convert to PNG bytes
            img_byte_arr = io.BytesIO()
            first_page.save(img_byte_arr, format='PNG')
            file_content = img_byte_arr.getvalue()
            
            # Set correct media type for Claude
            media_type = "image/png"
        except Exception as e:
            print(f"PDF conversion error: {str(e)}")
            raise
    elif file_type.startswith('image/'):
        file_content = await preprocess_image(file_content)
        file_type = 'image/png'  # Use PNG for processed images
            
        
    
    for attempt in range(max_retries):
        try:
            encoded_content = base64.b64encode(file_content).decode('utf-8')
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                # model="claude-3-5-sonnet-20240620",
                max_tokens=2000,
                system="You're a text analyser that outputs only json array objects...",
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
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
                               - Sum of costs that meet these criteria:
                                - Has a specific procedure code (CPT/HCPCS)
                                - Is an individual line item, not a category total
                               
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
                        "file_type": media_type
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
        "file_type": media_type
    }

async def preprocess_image(file_content: bytes) -> bytes:
    """Preprocess image for better OCR performance"""
    # Convert bytes to PIL Image
    image = Image.open(BytesIO(file_content))
    
    # Convert to numpy array for OpenCV processing
    img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    
    # 1. Resize if image is too large (reduces tokens)
    max_dimension = 2000
    height, width = img.shape[:2]
    if max(height, width) > max_dimension:
        scale = max_dimension / max(height, width)
        img = cv2.resize(img, None, fx=scale, fy=scale)
    
    # 2. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 3. Apply thresholding to get black and white image
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 4. Denoise
    denoised = cv2.fastNlMeansDenoising(thresh)
    
    # 5. Increase contrast
    contrast = cv2.convertScaleAbs(denoised, alpha=1.5, beta=0)
    
    # Convert back to bytes
    is_success, buffer = cv2.imencode(".png", contrast)
    return buffer.tobytes() 