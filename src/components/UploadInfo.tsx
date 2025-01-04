'use client';
import './UploadInfo.css';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "../lib/context/AnalysisContext";
import "./UploadInfo.css"
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { CustomSelect } from '@/src/components/ui/custom-select'
import type { InsuranceProvider } from '@/src/types'
import { supabase } from "../lib/supabase";

const insuranceProviders: { value: InsuranceProvider; label: string }[] = [
  { value: 'Cigna', label: 'Cigna' },
  { value: 'Aetna', label: 'Aetna' },
  { value: 'Blue Cross', label: 'Blue Cross' },
  { value: 'UnitedHealth', label: 'UnitedHealth' },
  { value: 'Other', label: 'Other' }
]
// Demo data that matches the results page
const DEMO_RESULT = {
  analysis: {
    summary: "Significant overcharging detected for both procedures, with invalid code usage (B002) and charges exceeding UCR rates by substantial margins",
    recommendations: "Contact provider to dispute charges and request itemized bill",
    details: {
      ucr_validation: {
        procedure_analysis: [
          {
            description: "Cell enumeration & id",
            billed_cost: 300,
            ucr_rate: 150,
            difference: 150,
            percentage_difference: 100,
            is_reasonable: false,
            comments: "Billed amount significantly higher than estimated UCR rate"
          },
          {
            description: "X-ray",
            billed_cost: 450,
            ucr_rate: 87.50,
            difference: 362.50,
            percentage_difference: 514,
            is_reasonable: false,
            comments: "Billed amount exceeds UCR rate by over 500%"
          }
        ],
        overall_assessment: "Multiple procedures show significant overcharging patterns",
        recommendations: [
          "Contest the X-ray charge as it exceeds normal rates by over 500%",
          "Request detailed itemization for cell enumeration procedure",
          "Consider filing a complaint with insurance provider"
        ],
        references: [
          "Medicare Fee Schedule 2024",
          "Regional UCR Database Q1 2024"
        ]
      }
    }
  }
};

export default function UploadInfo() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setAnalysisResult } = useAnalysis();
  const [otherChecked, setOtherChecked] = useState(false);
  const [insuranceChecked, setInsuranceChecked] = useState(false);
  const [formSwitch, switchForm] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let container = document.getElementById("form-container");
    if (container) {
      if (loading) {
        container.classList.add("form-hide");
      } else {
        container.classList.remove("form-hide");
      }
    }
  }, [loading]);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherChecked(e.target.checked);
  }

  const handleInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInsuranceChecked(e.target.checked);
  }

  const handleSwitchForm = () => {
    switchForm(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const fileInput = document.getElementById("bill-input") as HTMLInputElement;
    const files = fileInput.files;

    if (!files) {
      setError("Please select files to upload.");
      return;
    }

    // Add file size validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit per file
    const TOTAL_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB total limit
    let totalSize = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_FILE_SIZE) {
        setError(`File ${files[i].name} is too large. Maximum size is 5MB per file.`);
        return;
      }
      totalSize += files[i].size;
    }

    if (totalSize > TOTAL_SIZE_LIMIT) {
      setError("Total file size is too large. Maximum combined size is 20MB.");
      return;
    }

    Array.from(files).forEach((file) => formData.append("files", file));
    formData.append("firstName", (document.getElementById("first-name") as HTMLInputElement).value);
    formData.append("lastName", (document.getElementById("last-name") as HTMLInputElement).value);
    formData.append("dateOfBirth", (document.getElementById("date-of-birth") as HTMLInputElement).value);
    formData.append("email", email);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log("response:", response);
      // Add detailed logging
      const responseText = await response.text();
      console.log("Raw response:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
        console.log("Parsed result:", result);
        console.log("Result type:", typeof result);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        throw new Error("Failed to parse API response");
      }

      if (!result || typeof result !== 'object') {
        console.error("Invalid result format:", result);
        throw new Error("API response is not an object");
      }

      if (!result.analysis) {
        console.error("Missing analysis in result:", result);
        throw new Error("Invalid response format - missing analysis data");
      }

      setAnalysisResult(result.analysis);
      console.log("Analysis set, navigating to results...");
      router.push("/results");

      // Store analysis results in temp_analysis_results
      const { error: insertError } = await supabase
        .from('temp_analysis_results')
        .insert([
          {
            analysis_result: result.analysis,
          }
        ]);
      if (insertError) {
        console.error("Error inserting analysis result:", insertError);
      }

      // Insert email into waitlist
      const { data, error } = await supabase.from("waitlist").insert([
        {
          email,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error("Error inserting data:", error);
      } else {
        console.log("Data inserted successfully:", data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Log file information
      console.log('File type:', selectedFile.type);
      console.log('File name:', selectedFile.name);
      console.log('File size:', selectedFile.size, 'bytes');
      console.log('Full file object:', selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 relative" >
      {!loading ? (
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-[#FFFFFF] shadow-xl rounded-2xl border shadow-teal-50 border-teal-400">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center text-[#008080]">Upload Your Medical Bill</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6 border-2 border-teal" >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-[#008080] font-bold">First Name</Label>
                    <Input id="first-name" name="first-name" required className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-[#008080] font-bold">Last Name</Label>
                    <Input id="last-name" name="last-name" required className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#008080] font-bold">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      required 
                      className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" 
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-of-birth" className="text-[#008080] font-bold">Date of Birth</Label>
                    <Input 
                      id="date-of-birth" 
                      name="date-of-birth" 
                      type="date" 
                      required 
                      className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[#008080] font-bold">City</Label>
                    <Input id="city" name="city" required className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-[#008080] font-bold">State</Label>
                    <Input id="state" name="state" required className="border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e]" />
                  </div>
                  <div className="md:col-span-2">
                    <CustomSelect
                      id="insurance"
                      name="insurance"
                      options={insuranceProviders}
                      label="Insurance Provider"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bill-input" className="text-[#008080] font-bold">Upload Medical Bill</Label>
                  <Input
                    id="bill-input"
                    name="medicalBill"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e0f7f4] file:text-[#008080] hover:file:bg-[#c5f0ea] border-[#ddd] focus:border-[#28a29e] focus:ring-[#28a29e] py-1.5 h-[48px]"
                    required
                    onChange={handleFileChange}
                  />
                  <p className="text-sm text-gray-500">Accepted formats: PDF, JPG, PNG</p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#28a29e] hover:bg-[#1d7d7a] text-white font-bold py-3 px-4 rounded-full transition duration-300 ease-in-out"
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <img id="loading-anim" src="loading.svg" alt="Loading" className="w-64 h-64" />
        </div>
      )}
    </div>

  );
}
