import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Global Travel Report",
  description: "Learn about Global Travel Report's mission to share authentic travel stories and connect travelers worldwide.",
  openGraph: {
    title: "About Us - Global Travel Report",
    description: "Learn about Global Travel Report's mission to share authentic travel stories and connect travelers worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About Global Travel Report</h1>
        <p className="text-xl text-gray-600">
          Sharing authentic travel stories from around the world
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p>
            At Global Travel Report, we believe that travel has the power to transform lives
            and connect people across cultures. Our mission is to create a platform where
            travelers can share their authentic experiences, insights, and discoveries with
            a global community of like-minded adventurers.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
          <p>
            We curate and publish travel stories that go beyond the typical tourist
            experience. Our content focuses on:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Authentic cultural experiences</li>
            <li>Hidden gems and local secrets</li>
            <li>Sustainable travel practices</li>
            <li>Personal growth through travel</li>
            <li>Community-driven storytelling</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Editorial Policy</h2>
          <p>
            We maintain high standards for all content published on our platform:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>All stories are authentic and based on real experiences</li>
            <li>We fact-check all information before publication</li>
            <li>We respect cultural sensitivities and local customs</li>
            <li>We promote responsible and sustainable travel</li>
            <li>We maintain editorial independence</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p>
            Whether you're a seasoned traveler or just starting your journey, we invite
            you to:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Share your travel stories</li>
            <li>Connect with fellow travelers</li>
            <li>Discover new destinations</li>
            <li>Learn from others' experiences</li>
            <li>Contribute to our growing community</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p>
            Have questions or want to get involved? We'd love to hear from you. Reach out
            to us at{" "}
            <a
              href="mailto:editorial@globaltravelreport.com"
              className="text-blue-600 hover:text-blue-800"
            >
              editorial@globaltravelreport.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
} 