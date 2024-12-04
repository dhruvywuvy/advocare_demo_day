'use client';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "../lib/context/AnalysisContext";
import "./UploadInfo.css"

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

    const fileInput = document.getElementById("bill-input") as HTMLInputElement;
    const files = fileInput.files;

    if (!files) {
      setError("Please select files to upload.");
      return;
    }

    if (files.length > 10) {
      setError("You can only upload up to 10 files.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set demo result and redirect
      setAnalysisResult(DEMO_RESULT);
      router.push("/results");
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="pt-32 flex flex-col items-center min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
      <div id="form-container">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Tell us about your case!
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md flex flex-col gap-4"
        >
        <div className={formSwitch ? "hidden" : ""}>
          <div>
            <label>
              Purpose of the visit
            </label>
            <input
              type="text"
              name="visit-purpose"
              id="visit-purpose"
              className="w-full border border-gray-300 p-2 rounded"
              required
            />
          </div>
          <div>
            <label>
              Date of visit
            </label>
            <input
              type="date"
              name="visit-date"
              id="visit-date"
              required
            />
          </div>
          <div>
            <label>
              Facility Name
            </label>
            <input
              type="text"
              name="facility-name"
              id="facility-name"
              required
            />
          </div>
          <div>
            <label>
              Are there any charges on your bill that did not happen?
            </label>
            <input
              type="text"
              name="wrong-charges"
              id="wrong-charges"
            />
          </div>
          <div className="flex items-baseline">
            <label className="mr-[1rem]">Do You Have Insurance?</label>
            <input
              type="checkbox"
              onChange={handleInsuranceChange}
            />
          </div>
          {insuranceChecked ? (
            <div>
              <label>
                Insurance Name
              </label>
              <input type="text"/>
            </div>
          ) :
            (null)
          }
          <button
            className="bg-teal-500 text-white p-3 rounded text-lg font-semibold hover:bg-teal-600 w-[100%]"
            onClick={handleSwitchForm}
          >
            Next
          </button>
        </div>
        <div className={formSwitch ? "" : "hidden"}>
          <div>
              <label htmlFor="first-name" className="block mb-2 text-lg font-medium">
                First Name
              </label>
              <input
                type="text"
                name="first-name"
                id="first-name"
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="last-name" className="block mb-2 text-lg font-medium">
                Last Name
              </label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="date-of-birth" className="block mb-2 text-lg font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                id="date-of-birth"
                className="w-full border border-gray-300 p-2 rounded"
                required
              />
            </div>
            <div>
              <label htmlFor="bill-input" className="block mb-2 text-lg font-medium">
                Upload Your Medical Bill
              </label>
              <input
                type="file"
                id="bill-input"
                className="w-full border border-gray-300 p-2 rounded"
                required
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            <button
              type="submit"
              className="bg-teal-500 text-white p-3 rounded text-lg font-semibold hover:bg-teal-600 disabled:bg-gray-400 w-[100%]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-black">
                  <span>Analyzing</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
        </form>
      </div>
      <img id="loading-anim" className={`absolute m-[auto] ${loading ? "" : "form-hide"}`} src="loading.svg" />
    </div>
  );
}
