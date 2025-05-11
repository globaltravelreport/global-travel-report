import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from 'react';
import { SafeSearchParamsProvider } from '@/src/components/ui/SearchParamsProvider';

export const metadata: Metadata = {
  title: "Global Travel Report - Travel Stories from Around the World",
  description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
  openGraph: {
    title: "Global Travel Report - Travel Stories from Around the World",
    description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Travel Report - Travel Stories from Around the World",
    description: "Discover amazing travel stories and share your own adventures with travelers worldwide.",
  },
};

export const revalidate = 3600; // Revalidate every hour

// This is a simple server component that doesn't rely on complex data fetching
function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-24 bg-gradient-to-br from-blue-50 to-blue-100">
      <h1 className="text-5xl font-bold text-blue-700 mb-6 drop-shadow">Welcome to Global Travel Report</h1>
      <p className="text-xl text-blue-900 mb-8 max-w-2xl">
        Your destination for inspiring travel stories, tips, and guides from around the world. <br />
        We're working hard to bring you amazing content. Stay tuned!
      </p>
      <span className="inline-block bg-blue-200 text-blue-800 px-6 py-2 rounded-full font-semibold text-lg mb-8 animate-pulse">
        Coming Soon
      </span>
      <Link href="/about" className="text-blue-600 underline hover:text-blue-800 font-medium">Learn more about us</Link>
    </div>
  );
}

// Export a client component that wraps the server component in a Suspense boundary
export default function Home() {
  return (
    <SafeSearchParamsProvider>
      <HomePage />
    </SafeSearchParamsProvider>
  );
}