import type { Metadata } from "next";
import { ClientSuspense } from '@/components/ui/ClientSuspense';

export const metadata: Metadata = {
  title: "Privacy Policy - Global Travel Report",
  description: "Learn about how we collect, use, and protect your personal information at Global Travel Report.",
  openGraph: {
    title: "Privacy Policy - Global Travel Report",
    description: "Learn how Global Travel Report collects, uses, and protects your personal information.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
};

function PrivacyPolicyContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p>
          At Global Travel Report, we take your privacy seriously. This Privacy Policy explains how we collect,
          use, disclose, and safeguard your information when you visit our website. Please read this privacy
          policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc pl-6 mt-4">
          <li>Name and contact information when you subscribe to our newsletter</li>
          <li>Email address when you contact us</li>
          <li>Comments and feedback you provide on our articles</li>
          <li>Information you submit through our contact form</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-6 mt-4">
          <li>Send you newsletters and updates about our content</li>
          <li>Respond to your comments and questions</li>
          <li>Improve our website and services</li>
          <li>Protect against unauthorized access</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Cookies and Tracking</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our website and hold certain
          information. Cookies are files with a small amount of data that may include an anonymous unique
          identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is
          being sent.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Third-Party Services</h2>
        <p>
          We may use third-party services such as Google Analytics, reCAPTCHA, and social media platforms.
          These services may collect information about you. We encourage you to review the privacy policies
          of these third-party services.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, no method
          of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee
          absolute security.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 mt-4">
          <li>Access your personal information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Opt-out of marketing communications</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Children's Privacy</h2>
        <p>
          Our website is not intended for children under 13 years of age. We do not knowingly collect
          personal information from children under 13.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting
          the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{' '}
          <a href="mailto:privacy@globaltravelreport.com" className="text-primary hover:underline">
            privacy@globaltravelreport.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <ClientSuspense>
      <PrivacyPolicyContent />
    </ClientSuspense>
  );
}