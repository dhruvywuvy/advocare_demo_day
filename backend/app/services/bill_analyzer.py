# services/bill_analyzer.py
from typing import Dict, List, Any
import json
import requests
from .claude import analyze_with_claude, analyze_bill_with_claude
from .perplexity import search_ucr_rates
from .database import load_cpt_database, load_medicare_database  
import sys
from PyPDF2 import PdfReader
from PIL import Image
import io
import math


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
        # bills = user_input['bills']
        # results = []

        # for bill in bills:
        #     content = bill['content']  # This is binary data (PDF/image)
        #     content_type = bill['content_type']

        #     # Validate file type
        #     if not content_type.startswith(('application/pdf', 'image/')):
        #         raise Exception(f"Unsupported file type: {content_type}. Please upload PDF or image files only.")

        #     # Check if content is empty
        #     if not content:
        #         raise Exception("File content is empty")

        #     print(f"File size before processing: {len(content)} bytes", file=sys.stdout)
        #     # Get file size in MB
        #     file_size = len(content) / (1024 * 1024)  # Convert to MB
        #     if file_size > 25:  # If file is larger than 25MB
        #         raise Exception(f"File too large ({file_size:.1f}MB). Maximum size is 25MB.")

        #     # Add debug print to see content before Claude
        #     print(f"Content type: {content_type}, First 100 bytes: {content[:100]}", file=sys.stdout)

        #     # Process the bill with Claude (which handles OCR and text conversion)
        #     structured_bill = await analyze_bill_with_claude(content, content_type)

        #     if structured_bill is None:
        #         raise Exception("Failed to analyze the bill")
        results = []
        claude_results = user_input['claude_analyses'][0]['extracted_text'] 
        # Run the analyses using the structured bill
        code_result = await code_validation(claude_results)
        results.append(code_result)

        ucr_result = await ucr_validation(claude_results)
        results.append(ucr_result)
        
        # Generate final report
        # final_report = await explanation_handler(results)
        # print(f"check and cheese : {final_report}", file=sys.stdout)
        # # Add patient info to final report
        # final_report["patient_info"] = {
        #     "name": f"{user_input['patient_info']['first_name']} {user_input['patient_info']['last_name']}",
        #     "date_of_birth": user_input['patient_info']['date_of_birth']
        # }

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

async def code_validation(bill):
    icd_api = 'https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search'
    hcpcs_api = 'https://clinicaltables.nlm.nih.gov/api/hcpcs/v3/search'
    
    cpt_codes = await load_cpt_database()
    
    invalid_codes = []
    valid_codes = []

    # Process the codes from the demo bill
    for procedure in bill["billing_details"]["procedure_codes"]:
        code = procedure["code"]
        response = requests.get(icd_api, params={"terms": code, "sf": "code", "df": "code,name"})
        if response.status_code == 200:
            data = response.json()
            if data[1]:  # Valid ICD-10 code
                valid_codes.append({"code": code, "description": data[3][0][1], "type": "ICD-10"})
            else:  # Try HCPCS
                response = requests.get(hcpcs_api, params={"terms": code, "sf": "code", "df": "code,display"})
                if response.status_code == 200:
                    data = response.json()
                    if data[1]:  # Valid HCPCS code
                        valid_codes.append({"code": code, "description": data[3][0][1], "type": "HCPCS"})
                    else:
                        if code in cpt_codes:  # Check CPT
                            valid_codes.append({"code": code, "description": cpt_codes[code], "type": "CPT"})
                        else:
                            invalid_codes.append(code)

    prompt = (
        f"Analyze the following procedure codes and check for any discrepancies:\n\n"
        f"Valid Codes:\n{valid_codes}\n"
        f"Invalid Codes:\n{invalid_codes}\n\n"
        "Provide your analysis in the following JSON format:\n"
        "{\n"
        '  "code_validation": {\n'
        '    "valid_codes": [{"code": "...", "description": "...", "type": "..."}],\n'
        '    "invalid_codes": ["..."],\n'
        '    "discrepancies": ["..."],\n'
        '    "upcoding_risks": ["..."],\n'
        '    "errors": ["..."]\n'
        "  }\n"
        "}\n\n"
    )

    result = await analyze_with_claude(prompt)
    return {"code_validation": result}

async def chunk_and_analyze(content: bytes, content_type: str, chunk_size: int = 8000) -> list:
    """Split content into manageable chunks and analyze each separately"""
    chunks = []
    
    print(f"Processing file of type: {content_type}", file=sys.stdout)
    
    if content_type.startswith('application/pdf'):
        # Handle PDF
        pdf_file = io.BytesIO(content)
        pdf_reader = PdfReader(pdf_file)
        
        print(f"PDF has {len(pdf_reader.pages)} pages", file=sys.stdout)
        
        # Process one page at a time
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            print(f"Page {page_num + 1} extracted text length: {len(text)}", file=sys.stdout)
            chunks.append(text)
            
    elif content_type.startswith('image/'):
        # Handle Image
        image = Image.open(io.BytesIO(content))
        # Convert to RGB if necessary
        if image.mode not in ('RGB', 'L'):
            image = image.convert('RGB')
            
        # Split image into smaller sections if too large
        width, height = image.size
        max_dimension = 2000  # Maximum dimension for each chunk
        
        if width > max_dimension or height > max_dimension:
            # Calculate number of sections needed
            sections_x = math.ceil(width / max_dimension)
            sections_y = math.ceil(height / max_dimension)
            
            print(f"Splitting image into {sections_x}x{sections_y} sections", file=sys.stdout)
            
            for i in range(sections_x):
                for j in range(sections_y):
                    left = i * max_dimension
                    top = j * max_dimension
                    right = min((i + 1) * max_dimension, width)
                    bottom = min((j + 1) * max_dimension, height)
                    
                    section = image.crop((left, top, right, bottom))
                    # Convert section to bytes
                    section_bytes = io.BytesIO()
                    section.save(section_bytes, format='JPEG', quality=85)
                    chunks.append(section_bytes.getvalue())
        else:
            # Image is small enough to process as is
            chunks.append(content)

    # Process chunks with Claude
    results = []
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1} of {len(chunks)}", file=sys.stdout)
        try:
            result = await analyze_bill_with_claude(chunk, content_type)
            if result:
                results.append(result)
        except Exception as e:
            print(f"Error processing chunk {i+1}: {str(e)}", file=sys.stderr)
            continue

    return results
