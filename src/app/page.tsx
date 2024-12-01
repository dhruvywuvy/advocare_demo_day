'use client'
import React from "react";

import Index from "../components/Index";
import Support from "../components/Support";
import AboutUs from "../components/AboutUs";
import UploadInfo from "../components/UploadInfo";
import WaitlistForm from "../components/WaitlistForm";
import Navbar from "../components/Navbar";
import Results from "../components/Results";
import { AnalysisProvider } from '../lib/context/AnalysisContext'

export default function Page() {
  return (

    <main>
      <Index />
    </main>
  );
}


