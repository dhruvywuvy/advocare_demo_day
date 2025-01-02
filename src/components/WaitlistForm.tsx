// WaitlistForm.js
'use client'
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import React, { useState } from "react";

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log("Starting submission...");

    try {
      const { data, error } = await supabase.from("waitlist").insert([
        {
          email,
          created_at: new Date().toISOString(),
        },
      ]);

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Detailed error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      setEmail("");
      alert("Thanks for joining!");
    } catch (err: unknown) {
      console.error("Full error object:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto ">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-center text-[#008080]">
            Join our Waitlist
          </h2>
        </div>
        
        <div className="space-y-8 border border-teal-400 rounded-xl " >
          <form onSubmit={handleSubmit} className="bg-white space-y-6 rounded-xl border border-white-1 shadow-lg ">
            <div className="space-y-2">
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 bg-white-50 border border-teal-500 rounded-xl rounded-lg focus:border-[#008080] focus:ring-[#008080] outline-none
                  text-[#008080] placeholder-[#008080]"
                required
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <button 
              type="submit" 
              className="w-full bg-[#008080] hover:bg-[#006666] rounded-xl  text-white font-medium py-2.5 transition-colors"
            >
              Join Waitlist
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
export default WaitlistForm;