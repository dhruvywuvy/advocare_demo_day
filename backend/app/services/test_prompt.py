import asyncio
import json
import base64
from app.services.ocr import extract_text_from_document
from app.services.bill_analyzer import code_validation, ucr_validation
import time

async def test_ocr_and_save():
    # Load your test PDF/image
    with open("/Users/dhruvywuvy/Documents/GitHub/advocare_demo_day/backend/databases/MedicalBill.jpeg", "rb") as f:
        file_content = f.read()
    
    # Time the extraction
    start_time = time.time()
    
    result = await extract_text_from_document(file_content, "image/jpeg" )
    
    end_time = time.time()
    print(f"Processing time: {end_time - start_time} seconds")
    
    # Save result to file
    with open("saved_ocr_result.json", "w") as f:
        json.dump(result, f, indent=2)
     # Print result for debugging
    print("OCR Result:", json.dumps(result, indent=2))

async def load_saved_and_test_validation():
    # Load saved OCR result
    with open("saved_ocr_result.json", "r") as f:
        ocr_result = json.load(f)
    
    # Test specific validation
    start_time = time.time()
    
    # validation_result = await code_validation(ocr_result["extracted_text"])
    validation_result = await ucr_validation(ocr_result["extracted_text"])
    
    end_time = time.time()
    print(f"Validation time: {end_time - start_time} seconds")
    print("Result:", validation_result)

# Run tests
if __name__ == "__main__":
    # asyncio.run(test_ocr_and_save())
    # Or
    asyncio.run(load_saved_and_test_validation())
