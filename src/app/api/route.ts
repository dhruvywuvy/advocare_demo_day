// app/api/analyze/route.ts
import { NextResponse } from 'next/server';
//import { Configuration, OpenAIApi } from 'openai';
import Configuration from 'openai';
import OpenAIApi from 'openai';
import  AnthropicClient from '@anthropic-ai/sdk'
import Anthropic from '@ai-sdk/anthropic';
//import { GoogleCloudVisionClient } from '@google-cloud/vision';

// Types
interface ProcedureCode {
  code: string;
  description: string;
  quantity: number;
  cost: number;
}

interface MedicalBill {
  billing_details: {
    procedure_codes: ProcedureCode[];
    charges: number;
    total_cost: number;
    insurance_coverage: number;
    amount_due: number;
  };
  visit_info: {
    location: string;
    provider_info: string;
  };
}

// Initialize clients
const perplexityClient = new OpenAIApi(new Configuration({
  apiKey: process.env.PERPLEXITY_API_KEY,
  basePath: 'https://api.perplexity.ai',
}));

const anthropicClient = new AnthropicClient(process.env.ANTHROPIC_API_KEY);
//const visionClient = new GoogleCloudVisionClient();

// Utility functions
const loadCptDatabase = async () => {
  // Load CPT codes from your database or external service
  // This would replace your text file reading
  return {};
};

const loadMedicareDatabase = async () => {
  // Load Medicare rates from your database or external service
  // This would replace your CSV file reading
  return {};
};

// Main analysis functions
async function codeValidation(bill: MedicalBill) {
  const cptCodes = await loadCptDatabase();
  const validCodes = [];
  const invalidCodes = [];

  for (const procedure of bill.billing_details.procedure_codes) {
    // Implement code validation logic
    // Make API calls to validate codes
  }

  const prompt = `Analyze the following procedure codes...`; // Your existing prompt
  const result = await analyzeWithClaude(prompt);
  
  return { code_validation: result };
}

async function ucrValidation(bill: MedicalBill) {
  const medicareRates = await loadMedicareDatabase();
  const discrepancies = [];

  for (const procedure of bill.billing_details.procedure_codes) {
    // Implement UCR validation logic
  }

  const ucrResult = await searchUcrRates(bill);
  const prompt = `Analyze the following medical bill information...`; // Your existing prompt
  const result = await analyzeWithClaude(prompt);

  return { ucr_validation: result };
}

async function fraudDetection(bill: MedicalBill) {
  const prompt = `Detect any potential fraud indicators...`; // Your existing prompt
  const result = await analyzeWithClaude(prompt);
  
  return { fraud_detection: result };
}

async function explanationHandler(results: any[]) {
  const report = "Explanation Summary:\n" + results.map(r => 
    Object.entries(r).map(([k, v]) => `${k}: ${v}`).join('\n')
  ).join('\n');

  const prompt = `Please analyze the following report...`; // Your existing prompt
  return await analyzeWithClaude(prompt);
}

// Helper functions
async function analyzeWithClaude(input: string) {
  const message = await anthropicClient.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: input
      }
    ]
  });

  return message.content[0].text;
}

async function searchUcrRates(input: any) {
  const response = await perplexityClient.createChatCompletion({
    model: "llama-3.1-sonar-small-128k-online",
    messages: [
      {
        role: "system",
        content: "You are a skilled AI researcher that provides information about UCR rates for medical procedures in the United States of America."
      },
      {
        role: "user",
        content: `What are the standardized UCR rates for the procedure...` // Your existing prompt
      }
    ]
  });

  return response.data.choices[0].message.content;
}

// Main API route handler
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const [result] = await visionClient.textDetection(Buffer.from(buffer));
      const detections = result.textAnnotations;
      const textString = detections.map(text => text.description).join(' ');
      results.push(textString);
    }

    const bill = await parseBillData(results.join('\n'));
    const analysisResults = await Promise.all([
      codeValidation(bill),
      ucrValidation(bill),
      fraudDetection(bill)
    ]);

    const finalReport = await explanationHandler(analysisResults);
    
    return NextResponse.json({ analysis: finalReport });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to parse OCR text into structured bill data
async function parseBillData(text: string): Promise<MedicalBill> {
  // Implement logic to parse OCR text into structured data
  // You might want to use Claude or another AI model to help with this
  return {
    billing_details: {
      procedure_codes: [],
      charges: 0,
      total_cost: 0,
      insurance_coverage: 0,
      amount_due: 0
    },
    visit_info: {
      location: '',
      provider_info: ''
    }
  };
}