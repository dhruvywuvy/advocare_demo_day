from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import uvicorn
import sys
from pydantic import BaseModel
from datetime import date
import os
from dotenv import load_dotenv
from app.services.bill_analyzer import analyze_medical_bill
from app.services.claude import analyze_bill_with_claude
from app.services.ocr import extract_text_from_document
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
# from app.services.claude import analyze_with_claude
# from app.services.perplexity import search_ucr_rates
# Load environment variables
load_dotenv()

app = FastAPI(title="Medical Bill Analyzer API") #different
MAX_CONTENT_SIZE = 1024 * 1024  # 1MB limit for text files

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel): #entire class doesn't exist different
    first_name: str
    last_name: str
    date_of_birth: date

# Receive info from ffrontend
@app.post("/api/analyze")
async def analyze_bill(
    files: List[UploadFile] = File(...),
    firstName: str = Form(...),
    lastName: str = Form(...),
    dateOfBirth: str = Form(...)
):

    try:
        print(f"Processing request for {firstName} {lastName}", file=sys.stdout)
        
        # Get Claude's analysis first
        claude_results = []
        for file in files:
            content = await file.read()
            
            if not file.content_type.startswith(('application/pdf', 'image/')):
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
            # OCR time
            claude_analysis = await extract_text_from_document(content, file.content_type)
            claude_results.append(claude_analysis)
        
        # Pass Claude's results to analyze_medical_bill for additional processing
        print(f"Claude's results: {claude_results}")
        analysis_result = await analyze_medical_bill({
            "patient_info": {
                "first_name": firstName,
                "last_name": lastName,
                "date_of_birth": dateOfBirth
            },
            "claude_analyses": claude_results
        })
        
        return {"analysis": analysis_result}

    except Exception as e:
        print(f"Error processing request: {str(e)}", file=sys.stderr)
        # raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)