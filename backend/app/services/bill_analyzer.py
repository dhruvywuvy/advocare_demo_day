# services/bill_analyzer.py
from typing import Dict, List, Any
import json
import requests
from .claude import analyze_with_claude, analyze_bill_with_claude
from .perplexity import search_ucr_rates
from .database import load_cpt_database, load_medicare_database  
import sys
from PyPDF2 import PdfReader
# from PIL import Image
import io
import math
import asyncio
import aiohttp

# app/services/bill_analyzer.py

async def ucr_validation(bill):
    medicare_rates = await load_medicare_database()
    discrepancies = []

    for procedure in bill["billing_details"]["procedure_codes"]:
        code = procedure["code"]
        description = procedure["description"]
        billed_cost = procedure["cost"]

        if code in medicare_rates:
            medicare_info = medicare_rates[code]
            
            discrepancies.append({
                "code": code,
                "description": medicare_info['description'],
                "billed_cost": billed_cost,
                "medicare_rate": medicare_info.get('payment_rate', 0),
                "apc": medicare_info['apc'],
                "code_found": True
            })
        else:
            discrepancies.append({
                "code": code,
                "description": description,
                "billed_cost": billed_cost,
                "medicare_rate": "Not available in database",
                "code_found": False
            })

    ucr_result = await search_ucr_rates(bill)

    prompt = f"""
    Analyze the following medical bill information:

    Medicare Discrepancies:
    {json.dumps(discrepancies, indent=2)}

    UCR Information:
    {ucr_result}

    Provide your analysis in the following JSON format:
    {{
        "ucr_validation": {{
            "procedure_analysis": [
                {{
                    "code": "...",
                    "description": "...",
                    "billed_cost": 0,
                    "medicare_rate": 0,
                    "ucr_rate": 0,
                    "is_reasonable": true/false,
                    "comments": "...",
                    "sources": ["..."]
                }}
            ],
            "overall_assessment": "...",
            "recommendations": ["..."],
            "references": [
                "..."
            ]
        }}
    }}
    For each procedure:
    1. If Medicare rate is available, use it for comparison.
    2. Use the UCR rate from the Perplexity API result for comparison.
    3. Calculate differences and percentage differences using both Medicare (if available) and UCR rates.
    4. Determine if the billed amount is reasonable compared to Medicare and UCR rates.
    5. Provide comments on any significant discrepancies.
    6. Include the sources used for rates.

    In the "overall_assessment" field, summarize your findings and whether the overall bill appears reasonable.
    In the "recommendations" array, suggest next steps for the patient based on your analysis.
    In the "references" array, include any references or sources mentioned in the UCR info.

    Ensure the response is a valid JSON object. Include all relevant information from your analysis while maintaining the specified structure.
    """

    result = await analyze_with_claude(prompt)
    return {"ucr_validation": result}

async def explanation_handler(results):
    report = "Explanation Summary:\n"
    for result in results:
        for key, value in result.items():
            report += f"{key}: {value}\n"

    prompt = (
        f"Please analyze the following report and provide a structured response in JSON format:\n\n{report}\n\n"
        "Your response should be in the following JSON structure:\n"
        "{\n"
        '  "summary": "A brief overview of any major issues detected",\n'
        '  "code_validation": {\n'
        '    "overcharge": "Yes/No",\n'
        '    "amount": "Amount overcharged",\n'
        '    "details": ["Concise details about overcharge issues"]\n'
        '  },\n'
        '  "ucr_validation": {\n'
        '    "procedure_analysis": [\n'
        '      {\n'
        '        "code": "...",\n'
        '        "description": "...",\n'
        '        "billed_cost": 0,\n'
        '        "medicare_rate": 0,\n'
        '        "ucr_rate": 0,\n'
        '        "difference": 0,\n'
        '        "percentage_difference": 0,\n'
        '        "is_reasonable": true/false,\n'
        '        "comments": "...",\n'
        '        "sources": ["..."]\n'
        '      }\n'
        '    ],\n'
        '    "overall_assessment": "...",\n'
        '    "recommendations": ["..."],\n'
        '    "references": ["..."]\n'
        '  },\n'
        '  "fraud_detection": {\n'
        '    "potential_fraud": true/false,\n'
        '    "details": ["Concise details about potential fraud"]\n'
        '  },\n'
        '  "recommendations": ["Actionable recommendations based on findings"]\n'
        "}\n\n"
        "Ensure each section contains relevant information from the report. "
        "If a section has no relevant information OR no actionable items (in the situation there is no issue with the bill), set its value to null."
    )

    return await analyze_with_claude(prompt)

async def analyze_medical_bill(user_input):
    try:
       
        results = []
        claude_results = user_input['claude_analyses'][0]['extracted_text'] 

        # Filter only needed data for each validation
        # validation_data = {
        #     "procedure_codes": claude_results['billing_details']['procedure_codes'],
        #     "total_cost": claude_results['billing_details']['total_cost']
        # }

       

        # ucr_validation_data = {
        #     "procedure_codes": [
        #         {
        #             "code": code["code"],
        #             "cost": code["cost"]
        #         } 
        #         for code in claude_results['billing_details']['procedure_codes']
        #     ],
        #     "total_cost": claude_results['billing_details']['total_cost']
        # }
        # Run the analyses using the structured bill
        code_result, ucr_result = await asyncio.gather(
            code_validation(claude_results),
            ucr_validation(claude_results)
        )
        results.append(code_result)
        results.append(ucr_result)
        

        try:
            # Generate final report
            final_report = json.loads(await explanation_handler(results))
            # print(f"check and cheese : {final_report}", file=sys.stdout)
            # Add patient info to final report
            final_report["patient_info"] = {
                "name": f"{user_input['patient_info']['first_name']} {user_input['patient_info']['last_name']}",
                "date_of_birth": user_input['patient_info']['date_of_birth']
            }
            return final_report
        except json.JSONDecodeError:
            return {"summary": final_report}

    except Exception as e:
        print(f"Error in analyze_medical_bill: {str(e)}")
        raise Exception(f"Analysis failed: {str(e)}")

# # original code_validation
# async def code_validation(bill):
#     """Validate all procedure codes in parallel"""
#     icd_api = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search'
#     hcpcs_api = 'https://clinicaltables.nlm.nih.gov/api/hcpcs/v3/search'
    
#     cpt_codes = await load_cpt_database()
    
#     invalid_codes = []
#     valid_codes = []

#     # Process the codes from the demo bill
#     for procedure in bill["billing_details"]["procedure_codes"]:
#         code = procedure["code"]
#         response = requests.get(icd_api, params={"terms": code, "sf": "code", "df": "code,name"})
#         if response.status_code == 200:
#             data = response.json()
#             if data[1]:  # Valid ICD-10 code
#                 valid_codes.append({"code": code, "description": data[3][0][1], "type": "ICD-10"})
#             else:  # Try HCPCS
#                 response = requests.get(hcpcs_api, params={"terms": code, "sf": "code", "df": "code,display"})
#                 if response.status_code == 200:
#                     data = response.json()
#                     if data[1]:  # Valid HCPCS code
#                         valid_codes.append({"code": code, "description": data[3][0][1], "type": "HCPCS"})
#                     else:
#                         if code in cpt_codes:  # Check CPT
#                             valid_codes.append({"code": code, "description": cpt_codes[code], "type": "CPT"})
#                         else:
#                             invalid_codes.append(code)

#     prompt = (
#         f"Analyze the following procedure codes and check for any discrepancies:\n\n"
#         f"Valid Codes:\n{valid_codes}\n"
#         f"Invalid Codes:\n{invalid_codes}\n\n"
#         "Provide your analysis in the following JSON format:\n"
#         "{\n"
#         '  "code_validation": {\n'
#         '    "valid_codes": [{"code": "...", "description": "...", "type": "..."}],\n'
#         '    "invalid_codes": ["..."],\n'
#         '    "discrepancies": ["..."],\n'
#         '    "upcoding_risks": ["..."],\n'
#         '    "errors": ["..."]\n'
#         "  }\n"
#         "}\n\n"
#     )

#     result = await analyze_with_claude(prompt)
#     return {"code_validation": result}

#new code_validation
async def code_validation(bill):
    """Validate all procedure codes in parallel"""
    try:
        validation_tasks = []
        
        # Create tasks for each procedure code
        for procedure in bill["billing_details"]["procedure_codes"]:
            validation_tasks.append(validate_single_code(procedure))
        
        # Run all validations concurrently
        validation_results = await asyncio.gather(*validation_tasks)
        
        # Combine results
        return {
            "validation_results": validation_results,
            "summary": "Code validation completed",
            "total_codes_checked": len(validation_results)
        }
        
    except Exception as e:
        print(f"Error in code validation: {str(e)}")
        return {"error": str(e)}

async def validate_single_code(procedure):
    """Validate a single procedure code"""
    code = procedure["code"]
    cost = procedure["cost"]
    
    try:
        # Check both ICD and HCPCS APIs
        async with aiohttp.ClientSession() as session:
            # ICD API call
            icd_url = f"https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code&df=code,name&terms={code}"
            async with session.get(icd_url) as icd_response:
                icd_data = await icd_response.json()

            # HCPCS API call
            hcpcs_url = f"https://hcpcs.codes/api/v1/codes/{code}"
            async with session.get(hcpcs_url) as hcpcs_response:
                hcpcs_data = await hcpcs_response.json()

        # Process responses
        is_valid_icd = len(icd_data[3]) > 0 if isinstance(icd_data, list) and len(icd_data) > 3 else False
        is_valid_hcpcs = 'code' in hcpcs_data and hcpcs_data['code'] == code

        # Combine validation results
        return {
            "code": code,
            "cost": cost,
            "is_valid": is_valid_icd or is_valid_hcpcs,
            "icd_details": icd_data[3][0] if is_valid_icd else None,
            "hcpcs_details": hcpcs_data if is_valid_hcpcs else None,
            "validation_source": "ICD-10" if is_valid_icd else "HCPCS" if is_valid_hcpcs else "Unknown"
        }
        
    except Exception as e:
        return {
            "code": code,
            "cost": cost,
            "is_valid": False,
            "error": str(e)
        }
    
async def chunk_and_analyze(content: bytes, content_type: str, max_chunk_size: int = 8000) -> list:
    """Process large files in chunks"""
    try:
        print(f"Starting chunk analysis for {content_type}", file=sys.stdout)
        
        if content_type.startswith('application/pdf'):
            # Handle PDF
            pdf = PdfReader(io.BytesIO(content))
            chunks = []
            
            # Process each page as a chunk
            for page in pdf.pages:
                text = page.extract_text()
                if text.strip():  # Only add non-empty pages
                    chunks.append(text)
                    
        elif content_type.startswith('image/'):
            # For images, we'll process in one go since Claude can handle them
            chunks = [content]
        else:
            raise ValueError(f"Unsupported file type: {content_type}")

        # Process chunks concurrently
        tasks = [
            analyze_bill_with_claude(chunk, content_type)
            for chunk in chunks
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Combine results from all chunks
        combined_result = combine_chunk_results(results)
        
        return combined_result
        
    except Exception as e:
        print(f"Error in chunk_and_analyze: {str(e)}", file=sys.stderr)
        raise

def combine_chunk_results(results: list) -> dict:
    """Combine results from multiple chunks"""
    combined = {
        'extracted_text': {
            'billing_details': {
                'procedure_codes': [],
                'total_cost': 0
            }
        }
    }
    
    for result in results:
        if result and 'extracted_text' in result:
            # Combine procedure codes
            codes = result['extracted_text'].get('billing_details', {}).get('procedure_codes', [])
            combined['extracted_text']['billing_details']['procedure_codes'].extend(codes)
            
            # Add costs
            total = result['extracted_text'].get('billing_details', {}).get('total_cost', 0)
            combined['extracted_text']['billing_details']['total_cost'] += total
    
    return combined
