'use client'
import React, { useState, useEffect } from 'react';

const messages = [
  "This will take roughly 20 seconds",
  "We refer you to advocates",
  "Advocates are expert negotiators in the healthcare industry",
  "80% of medical bills contain errors (according to NBC)",
  "Did you know you could negotiate your medical bill?",
  "Advocates bring down bills by 30% on average",
];

export function LoadingMessages() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === messages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Changes message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center text-teal-600 mt-4 animate-fade-in">
      {messages[currentMessageIndex]}
    </div>
  );
} 