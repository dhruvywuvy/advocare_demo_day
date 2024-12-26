# ocr.py
import base64
from anthropic import Client
import os
from dotenv import load_dotenv
import json
import io
from PyPDF2 import PdfReader
import asyncio


load_dotenv()
client = Client(api_key=os.getenv('ANTHROPIC_API_KEY'))

async def extract_text_from_document(file_content: bytes, file_type: str) -> dict:
    """
    Extract text from PDF or image files using Claude's vision capabilities.
    Returns structured data from the medical bill.
    """
    encoded_content = base64.b64encode(file_content).decode('utf-8')

    messages = [
        {
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
                    "text": """Extract all text from this medical bill and organize it into a structured JSON format as shown here:. Strictly use the same names for the keysas the example below.
                    {
                        "patient_info": {
                            "name": "",
                            "ssn": "",
                            "dob": "",
                            "address": "",
                            "insurance_policy": ""
                        },
                        "visit_info": {
                            "date_of_visit": "",
                            "provider_info": "",
                            "doctor": "",
                            "location": ""
                        },
                        "billing_details": {
                            "charges": 0,
                            "procedure_codes": [
                                {
                                    "code": "",
                                    "description": "",
                                    "quantity": 0,
                                    "cost": 0
                                }
                            ],
                            "total_cost": 0,
                            "insurance_coverage": 0,
                            "amount_due": 0
                        },
                        "diagnoses": [
                            {
                                "code": "",
                                "description": "",
                                "severity": ""
                            }
                        ],
                        "notes": ""
                    }
                    
                    Include all visible text, numbers, codes, and details."""
                }
            ]
        }
    ]

    try:
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=4096,
            messages=messages
        )
        
        extracted_text = response.content[0].text
        extracted_text = json.loads(extracted_text)
        return {
            "success": True,
            "extracted_text": extracted_text,
            "file_type": file_type
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "file_type": file_type
        }

