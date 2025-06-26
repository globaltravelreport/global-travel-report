import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Travel Report - Fallback Page',
  description: 'Fallback page for Global Travel Report',
};

export default function FallbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Global Travel Report
        </h1>
        
        <div className="mb-8 text-center">
          <p className="text-gray-600 mb-4">
            Welcome to our fallback page. Our main site is currently experiencing technical difficulties.
          </p>
          <p className="text-gray-600">
            Please try again later or use one of the links below to access specific sections of our site.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link 
            href="/categories-main"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Categories</h2>
            <p className="text-blue-600">Browse travel stories by category</p>
          </Link>
          
          <Link 
            href="/destinations"
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold text-green-800 mb-2">Destinations</h2>
            <p className="text-green-600">Explore travel destinations around the world</p>
          </Link>
          
          <Link 
            href="/contact"
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Contact Us</h2>
            <p className="text-purple-600">Get in touch with our team</p>
          </Link>
          
          <Link 
            href="/api/health"
            className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Site Status</h2>
            <p className="text-gray-600">Check the current status of our website</p>
          </Link>
        </div>
        
        <div className="text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Global Travel Report. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
