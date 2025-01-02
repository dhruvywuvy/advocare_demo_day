'use client'
import React from "react";
import Results from "../../components/Results";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-8">
      <Results />
      <div className="flex justify-center">
      <button
          onClick={() => router.push('/success')}
          className="mb-20 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Join Waitlist
        </button>
        {/*<button
          onClick={() => router.push('/marketplace')}
          className="mb-20 bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Connect with an Advocate
        </button>*/}
      </div>
    </div>
  );
}