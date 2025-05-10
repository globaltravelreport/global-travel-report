import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Travel Report - Maintenance Mode",
  description: "We're currently performing maintenance on our website. Please check back soon.",
};

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-3xl font-bold">Global Travel Report</h1>
          <p className="text-blue-100 mt-2">Your trusted source for travel news and insights</p>
        </div>

        <div className="p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">We're Making Improvements</h2>

          <p className="text-gray-600 mb-6">
            Our website is currently undergoing scheduled maintenance to improve your experience.
            We apologize for any inconvenience and appreciate your patience.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 font-medium">
              We'll be back online shortly with new travel stories and features.
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Global Travel Report. All rights reserved.</p>
            <p className="mt-1">Based in Sydney, Australia</p>
          </div>
        </div>
      </div>
    </div>
  );
}