'use client'
import React from "react";
import { useRouter } from "next/navigation";  // Import from next/navigation

function Index() {
  const router = useRouter();  // Use Next.js router instead of navigate

  return (
    <div id="start-container" className="pt-52 pl-8 md:pl-16">
      <div id="start-screen-txt">
        <h1 className="text-5xl font-bold mb-4 text-black text-left">
          Stop overpaying<br />
          on medical bills.
        </h1>
        <p className="text-base mb-6 font-thin text-black">
          Let us uncover billing errors and negotiate savings on your behalf.
          Save money and fight unfair charges today.
        </p>
        <div className="button-group">
          <button
            className="cta"
            onClick={() => router.push("/form")}  // Use router.push instead of navigate
          >
            Get Started
          </button>
          <button
            className="waitlist-button"
            onClick={() => router.push("/waitlist")}  // Use router.push instead of navigate
          >
            Join Waitlist
          </button>
        </div>
      </div>
    </div>
  );
}

export default Index;