import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Global Travel Report',
  description: 'Learn about Rodney & Nuch, the team behind Global Travel Report, and our mission to share travel stories and inspiration.',
  openGraph: {
    title: 'About Us - Global Travel Report',
    description: 'Learn about Rodney & Nuch, the team behind Global Travel Report, and our mission to bring you the best travel stories from around the world.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Global Travel Report',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          Welcome to Global Travel Report, your trusted source for travel stories, tips, and inspiration from around the world.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
        <p>
          Founded by Rodney & Nuch, Global Travel Report was born from our shared passion for travel and storytelling. 
          We believe that every journey has a story worth sharing, and we're dedicated to bringing you authentic, 
          engaging travel content that inspires your next adventure.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Mission</h2>
        <p>
          Our mission is to provide travelers with reliable, informative, and inspiring content that helps them 
          make the most of their travel experiences. We focus on delivering high-quality stories that cover:
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>Destination guides and travel tips</li>
          <li>Hotel and accommodation reviews</li>
          <li>Airline and transportation information</li>
          <li>Cultural insights and local experiences</li>
          <li>Food and dining recommendations</li>
          <li>Adventure and outdoor activities</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Rodney</h3>
            <p>
              With over a decade of experience in travel writing and photography, Rodney brings a wealth of 
              knowledge and expertise to our team. His passion for exploring new destinations and sharing 
              stories has taken him to over 50 countries across six continents.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Nuch</h3>
            <p>
              Nuch's background in hospitality and tourism management provides valuable insights into the 
              industry. Her attention to detail and commitment to quality ensures that our content meets 
              the highest standards of accuracy and usefulness.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Authenticity</h3>
            <p>
              We believe in sharing real, honest experiences and insights that help travelers make informed decisions.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Quality</h3>
            <p>
              We maintain high standards in our content, ensuring accuracy, relevance, and usefulness for our readers.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p>
              We foster a community of travelers who share our passion for exploration and discovery.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Get in Touch</h2>
        <p>
          We love hearing from our readers! Whether you have a story to share, a question to ask, or 
          feedback to provide, we'd be delighted to hear from you. Visit our{' '}
          <a href="/contact" className="text-primary hover:underline">
            Contact page
          </a>{' '}
          to get in touch.
        </p>
      </div>
    </div>
  );
} 