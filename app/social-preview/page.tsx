import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Social Media Preview Test - Global Travel Report',
  description: 'Test page for verifying Facebook Open Graph and Twitter Card metadata implementation.',
  openGraph: {
    title: 'Social Media Preview Test - Global Travel Report',
    description: 'Test page for verifying Facebook Open Graph and Twitter Card metadata implementation.',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Global Travel Report - Social Media Preview Test',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Media Preview Test - Global Travel Report',
    description: 'Test page for verifying Facebook Open Graph and Twitter Card metadata implementation.',
    images: ['/og/home-1200x630.jpg'],
  },
};

export default function SocialPreviewTestPage() {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://globaltravelreport.com/social-preview';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Social Media Preview Test</h1>

        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            This page is designed to test social media metadata implementation. When shared on Facebook or Twitter,
            it should display the proper preview image and metadata.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔍 Testing Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Copy this page URL: <code className="bg-white px-2 py-1 rounded text-sm">{currentUrl}</code></li>
              <li>Visit <a href="https://developers.facebook.com/tools/debug/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Sharing Debugger</a></li>
              <li>Paste the URL and click "Debug"</li>
              <li>Verify the preview image shows correctly (should be 1200×630 JPEG)</li>
              <li>Test on <a href="https://cards-dev.twitter.com/validator" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twitter Card Validator</a></li>
            </ol>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">📊 Expected Results</h2>
            <ul className="space-y-2 text-blue-800">
              <li>✅ <strong>Title:</strong> Social Media Preview Test - Global Travel Report</li>
              <li>✅ <strong>Description:</strong> Test page for verifying Facebook Open Graph and Twitter Card metadata implementation.</li>
              <li>✅ <strong>Image:</strong> /og/home-1200x630.jpg (1200×630 JPEG)</li>
              <li>✅ <strong>Facebook:</strong> Large image preview without grey square</li>
              <li>✅ <strong>Twitter:</strong> Summary card with large image</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">🎯 Metadata Configuration</h2>
            <div className="bg-white rounded p-4 font-mono text-sm text-gray-800 overflow-x-auto">
              <div><strong>Open Graph:</strong></div>
              <div className="ml-4">og:title: Social Media Preview Test - Global Travel Report</div>
              <div className="ml-4">og:description: Test page for verifying Facebook Open Graph...</div>
              <div className="ml-4">og:image: /og/home-1200x630.jpg</div>
              <div className="ml-4">og:image:width: 1200</div>
              <div className="ml-4">og:image:height: 630</div>
              <br />
              <div><strong>Twitter Card:</strong></div>
              <div className="ml-4">twitter:card: summary_large_image</div>
              <div className="ml-4">twitter:title: Social Media Preview Test - Global Travel Report</div>
              <div className="ml-4">twitter:image: /og/home-1200x630.jpg</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#C9A14A] hover:bg-[#B89038] focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 transition-colors"
            >
              ← Back to Homepage
            </Link>

            <a
              href="https://developers.facebook.com/tools/debug/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 transition-colors"
            >
              Test on Facebook →
            </a>

            <a
              href="https://cards-dev.twitter.com/validator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 transition-colors"
            >
              Test on Twitter →
            </a>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-medium text-yellow-800 mb-2">🔧 Troubleshooting</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If Facebook shows a grey square, try "Scrape Again" in the debugger</li>
              <li>• Ensure the image file exists at the specified path</li>
              <li>• Check that image dimensions are exactly 1200×630 pixels</li>
              <li>• Verify the image is in JPEG format (not WebP)</li>
              <li>• Wait 24-48 hours for Facebook's cache to refresh</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}