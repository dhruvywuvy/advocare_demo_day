'use client'
import React from 'react';
import AdvocateCards from './AdvocateCards';

const Marketplace = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b">
        <div className="px-8 py-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold ">Find the Best Advocate for you.</h1>
            {/* <div className="space-x-4">
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact Us</a>
              <a href="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</a>
              <a href="/logout" className="text-gray-600 hover:text-gray-900">Logout</a>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <AdvocateCards />
        </div>
      </div>
    </div>
  );
};

export default Marketplace;

