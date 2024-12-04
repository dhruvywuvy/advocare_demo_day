"use client";
import React from "react";
import { Dot, CheckCircle, ChevronRight, FileText, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Task {
  title: string;
  description: string;
  completed: boolean;
  required?: boolean;
}

const CaseDashboard = () => {
  const progressSteps = [
    { label: "Gather info", duration: "Est. 30 days", active: true },
    { label: "Reviewing", duration: "Est. 2 days", active: false },
    { label: "Preparing", duration: "Est. 1 day", active: false },
    { label: "Negotiation", duration: "Est. 30 days", active: false },
    { label: "Results", duration: "", active: false },
  ];

  const tasks: Task[] = [
    {
      title: "Get your medical record",
      description:
        "Upload a document. You must complete this before we can begin your case or speak with the hospital.",
      completed: false,
      required: true,
    },
    {
      title: "Authorize Advocare",
      description: "You authorized Advocare to speak with the hospital.",
      completed: false,
      required: true,
    },
    {
      title: "Get your billing records",
      description: "You authorized us to get your records from the hospital.",
      completed: false,
      required: true,
    },
    {
      title: "Get your explanation of benefits",
      description: "Upload your explanation of benefits document.",
      completed: false,
      required: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="text-sm text-gray-500 mb-2">
          <Link href="/bills" className="hover:underline">
            Bills
          </Link>{" "}
          / <span>$5,000.00 - LA General Medicine</span>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-1">Your emergency room bill</h2>
          <div className="text-gray-600">December 1, 2024</div>
          <div className="text-gray-600">LA General Medicine</div>
          <div className="text-gray-500">1001 Providence Drive</div>
          <div className="text-gray-500">Los Angeles, CA 90007</div>

          <div className="mt-4">
            <div className="text-lg font-bold">YOUR BALANCE</div>
            <div className="text-2xl font-bold">$5,000.00</div>
            <div className="text-sm text-gray-500">
              with Cigna as your insurer
            </div>
          </div>

          <div className="mt-4 bg-green-100 text-green-800 px-3 py-2 rounded-md text-sm inline-flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Est. no collections risk as of Feb. 1. Verify →
          </div>
        </div>
      </div>

      {/* progress bar */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Progress</h3>
        <div className="relative flex justify-between">
          {progressSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="mb-2">
                {step.active ? (
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="text-sm font-medium">{step.label}</div>
              <div className="text-xs text-gray-500">{step.duration}</div>
            </div>
          ))}
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        </div>
      </div>

      {/*tasks */}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Tasks</h3>
          <span className="text-sm text-gray-500">2 of 5 done</span>
        </div>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 flex items-start bg-white"
            >
              {task.completed ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-1 mr-3 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-blue-600 hover:underline cursor-pointer">
                    {task.title} <ChevronRight className="inline w-4 h-4" />
                  </h4>
                  {task.required && (
                    <span className="text-xs text-white bg-red-500 px-2 py-1 rounded ml-2">
                      REQUIRED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* need help? section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Pending Advocate Review</h3>
        <div className="flex items-center mb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden">
            <Image
              src="/profile_pictures/iodolka.jpg" 
              alt="Io Dolka"
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
          <div className="ml-3">
            <Link href="/email" className="text-blue-600 hover:underline">
              Email Io Dolka <ChevronRight className="inline w-4 h-4" />
            </Link>
            <div className="text-sm text-gray-500">
              Your Potential Professional Advocate
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {/* <FileText className="w-5 h-5 mr-3 text-blue-600" /> */}
          {/* <Link href="/learn" className="text-blue-600 hover:underline">
            Learn more <ChevronRight className="inline w-4 h-4" />
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default CaseDashboard;
