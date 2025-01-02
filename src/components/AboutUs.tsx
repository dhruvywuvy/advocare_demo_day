import React from 'react';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#f8fafa]">
      {/* Hero Section */}
      <div className="bg-[#008080] text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              Making Healthcare Affordable for Everyone
            </h1>
            <p className="text-lg md:text-2xl text-teal-50">
              No one should ever overpay for medical care. We're on a mission to make that a reality.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-2">
            <svg className="w-12 h-12 mx-auto text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-3xl md:text-4xl font-bold text-[#008080]">80%</h3>
            <p className="text-gray-600">of medical bills contain errors according to NBC</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-2">
            <svg className="w-12 h-12 mx-auto text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-3xl md:text-4xl font-bold text-[#008080]">12</h3>
            <p className="text-gray-600">patients helped with their medical bills</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-2">
            <svg className="w-12 h-12 mx-auto text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-3xl md:text-4xl font-bold text-[#008080]">40%</h3>
            <p className="text-gray-600">average reduction in medical bills</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-2">
            <svg className="w-12 h-12 mx-auto text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-3xl md:text-4xl font-bold text-[#008080]">50+</h3>
            <p className="text-gray-600">expert healthcare advocates</p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#008080]">Our Mission</h2>
              <p className="text-gray-600 text-base md:text-lg">
                As students, we've witnessed firsthand the devastating impact of overcharged medical bills on everyday people. That's why we started Advocare – to ensure no one has to choose between their health and their financial stability.
              </p>
              <p className="text-gray-600 text-base md:text-lg">
                We combine expert healthcare advocates with cutting-edge technology to identify billing errors, negotiate costs, and fight for fair pricing. Our mission is simple: to make healthcare truly affordable for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-[#008080]">
              What We Stand For
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#008080]">Transparency</h3>
                <p className="text-gray-600">
                  We believe in complete transparency in healthcare pricing and our services.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#008080]">Advocacy</h3>
                <p className="text-gray-600">
                  We fight tirelessly for our patients' rights to fair medical billing.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-[#008080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#008080]">Community</h3>
                <p className="text-gray-600">
                  We're building a community of advocates and patients fighting for change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}