from anthropic import Client
import os
from dotenv import load_dotenv
import json
import base64

# Load environment variables from .env
load_dotenv()

api_key = os.getenv('ANTHROPIC_API_KEY')

if api_key is None:
    print("Error: ANTHROPIC_API_KEY is not set.")
else:
    # Initialize the client with your API key
    client = Client(api_key=api_key)

async def analyze_with_claude(input_text):
    """
    Analyze the input text using Claude AI and return the response.
    """
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": f'''

                    {input_text}
                '''
            }
        ]
    )
    # Extract response content from the Claude API
    response_content = message.content[0].text
    return response_content

def save_response_to_file(response_data, filename='claude-response.json'):
    """
    Save the Claude AI response to a JSON file.
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(response_data, f, indent=2, ensure_ascii=False)
    print(f"Data saved to {filename}")

async def analyze_bill_with_claude(file_content, file_type):
    """
    Analyze the uploaded bill file using Claude AI and convert it to structured JSON.
    """
    # Encode the file content to base64
    # encoded_content = base64.b64encode(file_content).decode('utf-8')

    prompt = f"""
    Analyze the following medical bill image using Optical Character Recognition (OCR). The image is here {file_content} and of type {file_type}.
    Extract all relevant information and structure it in the following JSON format:

    {{
        "patient_info": {{
            "name": "",
            "ssn": "",
            "dob": "",
            "address": "",
            "insurance_policy": ""
        }},
        "visit_info": {{
            "date_of_visit": "",
            "provider_info": "",
            "doctor": "",
            "location": ""
        }},
        "billing_details": {{
            "charges": 0,
            "procedure_codes": [
                {{
                    "code": "",
                    "description": "",
                    "quantity": 0,
                    "cost": 0
                }}
            ],
            "total_cost": 0,
            "insurance_coverage": 0,
            "amount_due": 0
        }},
        "diagnoses": [
            {{
                "code": "",
                "description": "",
                "severity": ""
            }}
        ],
        "notes": ""
    }}

    Ensure all fields are filled with the information from the bill. If a piece of information is not available, use an empty string or 0 for numeric fields.

    """

    response = await analyze_with_claude(prompt)
    
    try:
        # Parse the JSON response
        structured_bill = json.loads(response)
        return structured_bill
    except json.JSONDecodeError:
        print("Error: Unable to parse Claude's response as JSON")
        return None