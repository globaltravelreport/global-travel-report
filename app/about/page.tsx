
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Global Travel Report',
  description: 'Learn about Global Travel Report - your trusted source for travel insights, destination guides, and inspiring stories from around the world. Meet our team of passionate travel writers and experts.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/about`,
  },
  openGraph: {
    title: 'About Us - Global Travel Report',
    description: 'Learn about Global Travel Report - your trusted source for travel insights, destination guides, and inspiring stories from around the world. Meet our team of passionate travel writers and experts.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/about`,
    siteName: 'Global Travel Report',
    images: [
      {
        url: '/og/home-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'About Global Travel Report - Your Travel Companion',
      },
    ],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@globaltravelreport',
    creator: '@globaltravelreport',
    title: 'About Us - Global Travel Report',
    description: 'Learn about Global Travel Report - your trusted source for travel insights, destination guides, and inspiring stories from around the world.',
    images: ['/og/home-1200x630.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'travel',
  keywords: ['about global travel report', 'travel team', 'travel writers', 'travel experts', 'travel company'],
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">About Global Travel Report</h1>
      <div className="max-w-3xl mx-auto">
        <p className="text-lg mb-4">
          Global Travel Report is your trusted source for travel insights, destination guides, and inspiring stories from around the world.
        </p>
        <p className="text-lg mb-4">
          Our mission is to provide travelers with accurate, engaging, and useful information to help them plan their next adventure.
        </p>
        <p className="text-lg mb-4">
          Founded by a team of passionate travelers and writers, Global Travel Report aims to showcase the beauty and diversity of our world.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Our Team</h2>
        <p className="text-lg mb-4">
          Our editorial team consists of experienced travel writers, photographers, and industry experts who are dedicated to bringing you the best travel content.
        </p>
        <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
        <p className="text-lg mb-4">
          Have questions or suggestions? We'd love to hear from you! Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> to get in touch.
        </p>
      </div>
    </div>
  );
}