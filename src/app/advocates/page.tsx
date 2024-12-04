'use client'
import React from "react";
import AdvocateCards from "../../components/AdvocateCards";

export default function AdvocatesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Medical Billing Advocate</h1>
      <AdvocateCards />
    </div>
  );
} 