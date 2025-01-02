from openai import OpenAI
import os
from dotenv import load_dotenv
import time
import json
import asyncio
import re
import tiktoken
from app.services.cache import CacheService

load_dotenv()

api_key = os.getenv("PERPLEXITY_API_KEY")

"""
This module provides the search_ucr_rates function through a PerplexityService instance (at the bottom of the file).
The service handles caching and rate lookups for medical procedures.
"""

# Initialize the OpenAI client with Perplexity's base URL
client = OpenAI(api_key=api_key, base_url="https://api.perplexity.ai")

# # remember to add location into input text. Functional search function
# async def search_ucr_rates(input_text, max_retries=3):
#     start_time = time.time()
    
#     for attempt in range(max_retries):
#         try:
#             messages = [
#                 {
#                     "role": "system",
#                     "content": "You are a medical rate analyzer. Output ONLY valid JSON, no explanations or text outside JSON structure."
#                 },
#                 {
#                     "role": "user",
#                     "content": f'''Analyze rates for: {input_text}

#                     Return ONLY this JSON structure:
#                     {{
#                         "ucr_validation": {{
#                             "procedure_analysis": [
#                                 {{
#                                     "code": "exact code from input",
#                                     "description": "exact description from input",
#                                     "billed_cost": number (2 decimal places),
#                                     "standardized_rate": number (2 decimal places),
#                                     "sources": ["source used"]
#                                 }}
#                             ]
#                         }}
#                     }}

#                     STRICT RULES:
#                     1. ONLY output valid JSON
#                     2. NO text outside JSON structure
#                     3. Search Standardized / Usual Customary & Reasonable (UCR) Rates in this order: Medicare RVU → NC Medicaid → BetterCare → FAIR Health → Regional etc
#                     4. Location: Los Angeles, CA
#                     5. Codes are either of type CPT (5 digits) or HCPCS (first character is a letter, followed by 4 digits)
#                     6. ALL costs must be numbers
#                     7. For each procedure in the input:
#                        - Include ALL sources used in the sources array
#                        - If standardized_rate is None, 0 or 0.0, do not include the code, description, billed_cost, standardized_rate or sources for that procedure
#                     8. The procedure_analysis array should ONLY contain procedures with valid averaged rates from multiple sources
#                     9. CRITICAL: Do not make up any data
#                     '''
#                 }
#             ]

#             response = client.chat.completions.create(
#                 model="llama-3.1-sonar-large-128k-online",
#                 temperature=0.0,
#                 messages=messages,
#             )
            
#             # Calculate tokens before making the API call
#             token_count = count_tokens(messages)
#             print(f"Token count for this request: {token_count}")

#             result = response.choices[0].message.content
#             print(f"Perplexity result: {result}")
            
#             # Clean the response to get only JSON
#             try:
#                 # Remove markdown code blocks if present
#                 result = re.sub(r'```json\s*|\s*```', '', result)
                
#                 # Remove any "Note:" or other text after the JSON
#                 result = re.sub(r'\n*Note:.*$', '', result, flags=re.DOTALL)
                
#                 # Remove comments (// Based on Medicare rates...)
#                 result = re.sub(r'//.*$', '', result, flags=re.MULTILINE)
                
#                 # Extract just the JSON object
#                 json_match = re.search(r'\{.*\}', result, re.DOTALL)
#                 if json_match:
#                     result = json_match.group()
                
#                 # Clean up any trailing commas
#                 result = re.sub(r',\s*([}\]])', r'\1', result)
#                 print("im way 2 sexy")
#                 # Validate it's proper JSON
#                 parsed = json.loads(result)
#                 print(f"Parsed JSON: {parsed}")
                
#                 # Filter out procedures with invalid standardized_rates
#                 if "ucr_validation" in parsed and "procedure_analysis" in parsed["ucr_validation"]:
#                     valid_procedures = [
#                         proc for proc in parsed["ucr_validation"]["procedure_analysis"]
#                         if proc.get("standardized_rate") and proc["standardized_rate"] > 0
#                     ]
                    
#                     # Update the array with only valid procedures
#                     parsed["ucr_validation"]["procedure_analysis"] = valid_procedures
                
#                 if parsed.get("ucr_validation", {}).get("procedure_analysis", []):
#                     end_time = time.time()
#                     print(f"Success! Found {len(valid_procedures)} valid procedures")
#                     print(f"Parsed JSON: {parsed}")
#                     return json.dumps(parsed)
#                 else:
#                     print(f"Attempt {attempt + 1}: No UCR rates found, retrying...")
#                     if attempt < max_retries - 1:
#                         await asyncio.sleep(2 ** attempt)  # Exponential backoff
#                         continue
#             except json.JSONDecodeError:
#                 if attempt < max_retries - 1:
#                     await asyncio.sleep(2 ** attempt)
#                     continue
                
#         except Exception as e:
#             print(f"Attempt {attempt + 1}: Error: {str(e)}")
#             if attempt < max_retries - 1:
#                 await asyncio.sleep(2 ** attempt)
#                 continue
    
#     # If all retries failed
#     return json.dumps({
#         "ucr_validation": {
#             "procedure_analysis": []
#         }
#     })

def count_tokens(messages):
    encoding = tiktoken.get_encoding("cl100k_base")
    num_tokens = 0
    
    for message in messages:
        # Add tokens for message role and content
        num_tokens += 4  # Every message follows <im_start>{role/name}\n{content}<im_end>\n
        for key, value in message.items():
            num_tokens += len(encoding.encode(str(value)))
    
    return num_tokens

class PerplexityService:
    def __init__(self):
        # Initialize cache service when PerplexityService is created
        self.cache_service = CacheService()

    def extract_codes(self, input_text: str) -> list[str]:
        """Extract CPT/HCPCS codes from Claude's output"""
        try:
            input_text = json.loads(input_text)
            codes = []
            
            # Navigate through Claude's response structure
            for result in input_text:
                if result.get('success'):
                    procedure_codes = result.get('extracted_text', {}).get('billing_details', {}).get('procedure_codes', [])
                    
                    for procedure in procedure_codes:
                        if code := procedure.get('code'):
                            # Only add if it looks like a valid CPT/HCPCS code
                            if (len(code) == 5 and code.isdigit()) or \
                               (len(code) == 5 and code[0].isalpha() and code[1:].isdigit()):
                                codes.append(code)
            
            print(f"Extracted codes: {codes}")
            return codes
            
        except Exception as e:
            print(f"Error extracting codes: {str(e)}")
            return []

    async def search_ucr_rates(self, input_text, max_retries=3):
        start_time = time.time()
        location = "Los Angeles, CA"
        
        # 1. Try cache first, but continue if it fails
        try:
            codes = self.extract_codes(input_text)
            if codes is None or len(codes) == 0:
                print("No codes to check in cache, proceeding with API call")
                cached_rates = {}
                codes_to_search = []
            else:
                cached_rates = await self.cache_service.bulk_get_cached_rates(codes, location)
                codes_to_search = [code for code in codes if code not in cached_rates]
                
                if cached_rates and not codes_to_search:
                    print("All rates found in cache!")
                    return json.dumps({
                        "ucr_validation": {
                            "procedure_analysis": list(cached_rates.values())
                        }
                    })
        except Exception as e:
            print(f"Cache error: {str(e)}, proceeding with API call")
            cached_rates = {}  # Reset to empty if cache fails
            codes_to_search = codes  # Search all codes if cache fails
        
        messages = [
                {
                    "role": "system",
                    "content": "You are a medical rate analyzer. Output ONLY valid JSON, no explanations or text outside JSON structure."
                },
                {
                    "role": "user",
                    "content": f'''Analyze rates for: {input_text}

                        Return ONLY this JSON structure:
                        {{
                            "ucr_validation": {{
                                "procedure_analysis": [
                                    {{
                                        "code": "exact code from input",
                                        "description": "exact description from input",
                                        "billed_cost": number (2 decimal places),
                                        "standardized_rate": number (2 decimal places),
                                        "sources": ["source used"]
                                    }}
                                ]
                            }}
                        }}

                        STRICT RULES:
                        1. ONLY output valid JSON
                        2. NO text outside JSON structure
                        3. Search Standardized / Usual Customary & Reasonable (UCR) Rates in this order: Medicare RVU → NC Medicaid → BetterCare → FAIR Health → Regional etc
                        4. Location: Los Angeles, CA
                        5. Codes are either of type CPT (5 digits) or HCPCS (first character is a letter, followed by 4 digits)
                        6. ALL costs must be numbers
                        7. For each procedure in the input:
                           - Include ALL sources used in the sources array
                           - If standardized_rate is None, 0 or 0.0, do not include the code, description, billed_cost, standardized_rate or sources for that procedure
                        8. The procedure_analysis array should ONLY contain procedures with valid averaged rates from multiple sources
                        9. CRITICAL: Do not make up any data
                        '''
                    }
                ]

        
        # 4. If some codes aren't cached, search them with Perplexity
        for attempt in range(max_retries):
            try:
                # Your existing messages and API call here
                 # Calculate tokens before making the API call
                token_count = count_tokens(messages)
                print(f"Token count for this request: {token_count}")
                response = client.chat.completions.create(
                    model="llama-3.1-sonar-large-128k-online",
                    temperature=0.0,
                    messages=messages,
                )

                result = response.choices[0].message.content
                print(f"Perplexity result: {result}")
                
                # Clean the response to get only JSON
                try:
                    # Remove markdown code blocks if present
                    result = re.sub(r'```json\s*|\s*```', '', result)
                    result = re.sub(r'\n*Note:.*$', '', result, flags=re.DOTALL)
                    result = re.sub(r'//.*$', '', result, flags=re.MULTILINE)
                    
                    # Extract just the JSON object
                    json_match = re.search(r'\{.*\}', result, re.DOTALL)
                    if json_match:
                        result = json_match.group()
                    
                    # Clean up any trailing commas
                    result = re.sub(r',\s*([}\]])', r'\1', result)
                    
                    # Validate it's proper JSON
                    parsed = json.loads(result)
                    print(f"Parsed JSON: {parsed}")
                    
                    # Filter out procedures with invalid standardized_rates
                    if "ucr_validation" in parsed and "procedure_analysis" in parsed["ucr_validation"]:
                        valid_procedures = [
                            proc for proc in parsed["ucr_validation"]["procedure_analysis"]
                            if proc.get("standardized_rate") and proc["standardized_rate"] > 0
                        ]
                        
                        # Try to cache, but continue if it fails
                        try:
                            for proc in valid_procedures:
                                await self.cache_service.cache_rate(
                                    proc["code"],
                                    location,
                                    proc
                                )
                        except Exception as e:
                            print(f"Failed to cache results: {str(e)}")
                        
                        # Continue with the API results even if caching failed
                        all_procedures = list(cached_rates.values()) + valid_procedures
                        parsed["ucr_validation"]["procedure_analysis"] = all_procedures
                    
                    if parsed.get("ucr_validation", {}).get("procedure_analysis", []):
                        end_time = time.time()
                        print(f"Success! Found {len(all_procedures)} total procedures")
                        return json.dumps(parsed)
                    else:
                        print(f"Attempt {attempt + 1}: No UCR rates found, retrying...")
                        if attempt < max_retries - 1:
                            await asyncio.sleep(2 ** attempt)
                            continue
                            
                except json.JSONDecodeError:
                    if attempt < max_retries - 1:
                        await asyncio.sleep(2 ** attempt)
                        continue
                    
            except Exception as e:
                print(f"Attempt {attempt + 1}: Error: {str(e)}")
                if attempt < max_retries - 1:
                    await asyncio.sleep(2 ** attempt)
                    continue
        
        # If all retries failed but we have cached results, return those
        if cached_rates:
            return json.dumps({
                "ucr_validation": {
                    "procedure_analysis": list(cached_rates.values())
                }
            })
        
        # If everything failed, return empty array
        return json.dumps({
            "ucr_validation": {
                "procedure_analysis": []
            }
        })

# Create service instance and expose search_ucr_rates function
perplexity_service = PerplexityService()
search_ucr_rates = perplexity_service.search_ucr_rates