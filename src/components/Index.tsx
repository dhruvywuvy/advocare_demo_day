'use client'
import React from "react";
import { useRouter } from "next/navigation";
import "./get-started.css";

function Index() {
  const router = useRouter();

  return (
    <>
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
              onClick={() => router.push("/form")}
            >
              Get Started
            </button>
            <button
              className="waitlist-button"
              onClick={() => router.push("/waitlist")}
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>

      {/* Added Features Section */}
      <div className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon shield"></div>
            <h2>AI-Powered Analysis</h2>
            <p>Our advanced AI technology scans your medical bills to identify errors and overcharges automatically.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon dollar"></div>
            <h2>Save Money</h2>
            <p>On average, our users save 30% on their medical bills through our error detection and negotiation services.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon doc"></div>
            <h2>Expert Support</h2>
            <p>Our team of healthcare billing experts reviews each case and negotiates with providers on your behalf.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Index;