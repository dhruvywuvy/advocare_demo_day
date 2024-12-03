'use client'
import React from "react";
import { useRouter } from "next/navigation"; // Replace react-router-dom
import { useAnalysis } from "../lib/context/AnalysisContext"; // Update import path
import { BeatLoader } from 'react-spinners';
import AdvocateCards from "./AdvocateCards";

interface Procedure {
  description: string;
  billed_cost: number;
  ucr_rate: number;
  difference: number;
  percentage_difference: number;
  is_reasonable: boolean;
  comments: string;
}

interface AnalysisResult {
  analysis: {
    summary: string;
    recommendations: string;
    details: {
      ucr_validation: {
        procedure_analysis: Procedure[];
        overall_assessment: string;
        recommendations: string[];
        references: string[];
      };
      fraud_detection: {
        potential_fraud: boolean;
        details?: string[];
      };
    };
  };
}

function Results() {
  const router = useRouter(); // Replace useNavigate
  const { analysisResult } = useAnalysis();
  console.log('Analysis Result:', analysisResult);

  const renderMiniBox = (title: string, content: string | number | boolean) => (
    <div key={title} className="bg-gray-100 p-4 rounded mb-4 shadow">
      <h4 className="font-medium">{title}</h4>
      <p>{content.toString()}</p>
    </div>
  );

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
        <p className="text-xl mb-4">No analysis results available.</p>
        <button
          onClick={() => router.push("/")}
          className="bg-teal-500 text-white p-3 rounded text-lg"
        >
          Return to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8 ">
      <div className="container mx-auto px-4">
        <div className="flex flex-row gap-6">
          {/* Left Column - Analysis Results */}
          <div className="w-2/5">
            <div className="bg-white p-6 rounded shadow-md">
              <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>

              {/* Summary Section */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                {analysisResult.analysis.summary &&
                  renderMiniBox("Overview", analysisResult.analysis.summary)}
              </section>

              {/* UCR Validation Section */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Charges Compared to Standardized Rates
                </h3>
                {analysisResult.analysis.ucr_validation && (
                  <div>
                    {analysisResult.analysis.ucr_validation.procedure_analysis.map(
                      (procedure:Procedure, index:number) => (
                        <div key={index} className="mb-4">
                          <h4 className="font-medium">Procedure {index + 1}</h4>
                          {renderMiniBox("Item", procedure.description)}
                          {renderMiniBox(
                            "You were Billed",
                            `$${procedure.billed_cost}`
                          )}
                          {renderMiniBox("Standard Rate", `$${procedure.ucr_rate}`)}
                          {renderMiniBox("Difference", `$${procedure.difference}`)}
                          {renderMiniBox(
                            "Percentage Difference",
                            `${procedure.percentage_difference}%`
                          )}
                          {renderMiniBox(
                            "Is Reasonable",
                            procedure.is_reasonable ? "Yes" : "No"
                          )}
                          {renderMiniBox("Comments", procedure.comments)}
                        </div>
                      )
                    )}

                    <h4 className="font-medium mt-4">Overall Assessment</h4>
                    {renderMiniBox(
                      "Assessment",
                      analysisResult.analysis.ucr_validation
                        .overall_assessment
                    )}

                    <h4 className="font-medium mt-4">Recommendations</h4>
                    {analysisResult.analysis.ucr_validation.recommendations.map(
                      (recommendation:string, index:number) =>
                        renderMiniBox(`Recommendation ${index + 1}`, recommendation)
                    )}

                    <h4 className="font-medium mt-4">References</h4>
                    {analysisResult.analysis.ucr_validation.references.map(
                      (reference:string, index:number) =>
                        renderMiniBox(`Reference ${index + 1}`, reference)
                    )}
                  </div>
                )}
              </section>

              {/* Fraud Detection Section */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">
                  Potential Fraud Indicators
                </h3>
                {analysisResult.analysis.fraud_detection && (
                  <div>
                    <p>
                      <strong>Potential Fraud Detected:</strong>{" "}
                      {analysisResult.analysis.fraud_detection.potential_fraud
                        ? "Yes"
                        : "No"}
                    </p>
                    {analysisResult.analysis.fraud_detection.details
                      .potential_fraud && (
                      <>
                        <h4 className="font-medium mt-2">Details:</h4>
                        {analysisResult.analysis.fraud_detection.details?.map(
                          (detail:string, index:number) =>
                            renderMiniBox(`Fraud Indicator ${index + 1}`, detail)
                        )}
                      </>
                    )}
                  </div>
                )}
              </section>

              {/* Recommendations Section */}
              <section className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Summary</h3>
                {analysisResult.analysis.recommendations &&
                  renderMiniBox("Overview", analysisResult.analysis.recommendations)}
              </section>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-3/5">
            <div className="bg-white p-6 rounded shadow-md h-full">
              {/* Add your content for the right column here */}
              <h2 className="text-2xl font-bold mb-4">Professional advocates best suited for your case:</h2>

              <AdvocateCards/>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

export default Results;