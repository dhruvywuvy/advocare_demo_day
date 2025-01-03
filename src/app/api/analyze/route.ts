// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const AnalysisSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  files: z.array(z.instanceof(File))
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    /*const validatedData = AnalysisSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dateOfBirth: formData.get('dateOfBirth'),
      files: formData.getAll('files')
    });*/

    // Forward the request to FastAPI backend
    const response = await fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.detail }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }
}