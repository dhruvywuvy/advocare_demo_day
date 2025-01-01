from anthropic import Client
import os
from dotenv import load_dotenv
import json
# import app.services.ocr as ocr
import base64
import re
import asyncio
import time

# Load environment variables from .env
load_dotenv()

api_key = os.getenv('ANTHROPIC_API_KEY')

if api_key is None:
    print("Error: ANTHROPIC_API_KEY is not set.")
else:
    # Initialize the client with your API key
    client = Client(api_key=api_key)

# Currently not used but u can input text directly here. Use this to optimize code in the future- claude haiku
async def analyze_with_claude(input_text):
    """
    Analyze the input text using Claude AI and return the response.
    """
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=4096,
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

# Explanation handler
async def analyze_with_claude_haiku(input_text, max_retries=3):
    """
    Analyze the input text using Claude AI and return structured JSON response.
    """
    start_time = time.time()
    for attempt in range(max_retries):
        try:
            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2300,
                system="You're a text analyser that outputs only json array objects...",
                temperature=0,
                messages=[{"role": "user", "content": input_text}]
            )
            
            response_content = message.content[0].text
            
            try:
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    response_content = json_match.group()
                
                # Parse JSON
                parsed_json = json.loads(response_content)

                # Validate structure
                validated_json = {
                    "summary": parsed_json.get("summary", ""),
                    "code_validation": parsed_json.get("code_validation", {
                        "overcharge": "Unknown",
                        "amount": "0",
                        "details": []
                    }),
                    "ucr_validation": {
                        "procedure_analysis": [],
                        "overall_assessment": "",
                        "recommendations": [],
                        "references": []
                    },
                    "recommendations": []
                }
                # Copy UCR validation if exists
                if "ucr_validation" in parsed_json:
                    validated_json["ucr_validation"].update(parsed_json["ucr_validation"])
                    end_time = time.time()
                    print(f"Explanation Time taken: {end_time - start_time} seconds")
                return validated_json
                
            except json.JSONDecodeError as e:
                print(f"Attempt {attempt + 1}: JSON Parse Error: {e}")
                if attempt == max_retries - 1:  # Last attempt
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                continue
                
        except Exception as e:
            print(f"Attempt {attempt + 1}: API Error: {e}")
            if attempt == max_retries - 1:  # Last attempt
                return {
                    "summary": f"Analysis failed after {max_retries} attempts: {str(e)}",
                    "ucr_validation": {"procedure_analysis": []}
                }
            await asyncio.sleep(2 ** attempt)  # Exponential backoff

def save_response_to_file(response_data, filename='claude-response.json'):
    """
    Save the Claude AI response to a JSON file.
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(response_data, f, indent=2, ensure_ascii=False)
    print(f"Data saved to {filename}")