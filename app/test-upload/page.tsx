'use client';

import ImageUpload from '../components/ImageUpload';

export default function TestUpload() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Image Upload</h1>
          <p className="mt-2 text-sm text-gray-600">
            Test the image upload functionality with drag-and-drop support and progress indicators
          </p>
        </div>
        <ImageUpload />
      </div>
    </div>
  );
} 