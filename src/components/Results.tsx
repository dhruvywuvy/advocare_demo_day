'use client'
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
// import { BeatLoader } from 'react-spinners';
import { useAnalysis } from "../lib/context/AnalysisContext"; 
// import { useContext } from "react";  // Add this import
import { LoadingMessages } from './LoadingMessages';  // Add this import

// // Demo data stays the same...
// const DEMO_DATA = {
//   analysis: {
//     summary: "Significant overcharging detected for both procedures, with invalid code usage (B002) and charges exceeding UCR rates by substantial margins",
//     recommendations: "Contact provider to dispute charges and request itemized bill",
//     details: {
//       ucr_validation: {
//         procedure_analysis: [
//           {
//             description: "Cell enumeration & id",
//             billed_cost: 300,
//             ucr_rate: 150,
//             difference: 150,
//             percentage_difference: 100,
//             is_reasonable: false,
//             comments: "Billed amount significantly higher than estimated UCR rate"
//           },
//           {
//             description: "X-ray",
//             billed_cost: 450,
//             ucr_rate: 87.50,
//             difference: 362.50,
//             percentage_difference: 514,
//             is_reasonable: false,
//             comments: "Billed amount exceeds UCR rate by over 500%"
//           }
//         ],
//         overall_assessment: "Multiple procedures show significant overcharging patterns",
//         recommendations: [
//           "Contest the X-ray charge as it exceeds normal rates by over 500%",
//           "Request detailed itemization for cell enumeration procedure",
//           "Consider filing a complaint with insurance provider"
//         ],
//         references: [
//           "Medicare Fee Schedule 2024",
//           "Regional UCR Database Q1 2024"
//         ]
//       }
//     }
//   }
// };

interface Procedure {
  description: string;
  billed_cost: number;
  standardized_rate: number;
  difference: number;
  comments: string;
}

function Results() {
  const router = useRouter();
  const { analysisResult } = useAnalysis();
  // console.log("Raw analysis result:", analysisResult);

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null) return '-';
    return `$${value.toLocaleString()}`;
  };
  // Debug the entire analysisResult first
  console.log("Full analysisResult:", analysisResult);
  
  // Debug the path to procedures
  console.log("UCR Validation:", analysisResult?.ucr_validation);
  console.log("Procedure Analysis:", analysisResult?.ucr_validation?.procedure_analysis);
  
  const procedures = analysisResult?.ucr_validation?.procedure_analysis || [];
  console.log("Final procedures array:", procedures);

  // const procedures = analysisResult?.ucr_validation?.procedure_analysis || [];
  const recommendations = analysisResult?.recommendations || [];
  const references = analysisResult?.ucr_validation?.references || [];
  // Debug logging
  console.log("Procedures:", procedures);
  // const summary = analysisResult?.summary || '';

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-screen ">
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
    <div className="bg-white flex justify-center">
      <div className="max-w-4xl w-full px-4">
        <div className="bg-white-[#F8F8F8] p-6 border-teal-400 border rounded-xl shadow-lg shadow-teal-90 ">
          <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>

          {/* Summary Section */}
          <section className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <div className="border border-teal-500 p-2 rounded-xl">
              <p className="text-lg text-teal-600">{analysisResult?.summary}</p>
            </div>
          </section>

          {/* UCR Validation Section */}
          <section className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Charges Compared to Standardized Rates</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 border">Procedure</th>
                    <th className="px-4 py-2 border">Description</th>
                    <th className="px-4 py-2 border">Billed Cost</th>
                    <th className="px-4 py-2 border">Standard Rate</th>
                    <th className="px-4 py-2 border">Difference</th>
                    {/* <th className="px-4 py-2 border">Comments</th> */}
                  </tr>
                </thead>
                <tbody>
                  {procedures.map((procedure: Procedure, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border">{index + 1}</td>
                      <td className="px-4 py-2 border">{procedure.description || '-'}</td>
                      <td className="px-4 py-2 border text-right">{formatCurrency(procedure.billed_cost)}</td>
                      <td className="px-4 py-2 border text-right">{formatCurrency(procedure.standardized_rate)}</td>
                      <td className="px-4 py-2 border text-right">{formatCurrency(procedure.difference)}</td>
                      {/* <td className="px-4 py-2 border">{procedure.comments || '-'}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="list-disc pl-5">
                  {recommendations.map((recommendation:string, index: string) => (
                    <li key={index} className="mb-1">{recommendation}</li>
                  ))}
                </ul>
              </div>
            )}

            {references.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Sources Used:</h4>
                <ul className="list-disc pl-5">
                  {references.map((reference: string, index: string) => (
                    <li key={index} className="mb-1">{reference}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Results;