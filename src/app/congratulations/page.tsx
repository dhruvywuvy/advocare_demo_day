'use client'
import React from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from 'next/font/google'

export default function CongratulationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8 border border-teal-400 ">
          <div className="text-center space-y-6 mb-8">
            <h1 className="text-3xl font-bold text-teal-600 font-montserrat">
              You have joined the waitlist!
            </h1>
            {/* <p className="text-xl text-gray-700 font-montserrat">
              Thank you for trusting Advocare with your healthcare journey
            </p> */}
          </div>

          <div className="bg-white-50 border border-teal-500 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-teal-600 mb-4 ">Next Steps:</h2>
            <ul className="space-y-3 text-black-600 font-montserrat">
              <li>• Great job on taking the first step to resolving your medical bill!</li>
              <li>• We'll connect you with an advocate in a week</li>
              <li>• You'll receive an email with everything you need to know</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/')}
              className="mb-4 bg-[#268E8E] text-white px-6 py-3 rounded-2xl hover:bg-teal-600 transition-colors"
            >
              Back to Home
            </button>
            {/* <p className="text-gray-600">
              Questions? Email us at{' '}
              <a href="mailto:support@advocare.com" className="text-teal-600 hover:underline">
                support@advocare.com
              </a>
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}

