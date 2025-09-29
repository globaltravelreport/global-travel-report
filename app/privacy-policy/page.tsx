import type { Metadata } from 'next';
import { ClientSuspense } from '@/components/ui/ClientSuspense';

export const metadata: Metadata = {
  title: 'Privacy Policy - Global Travel Report',
  description: 'Read our privacy policy to understand how we collect, use, and protect your personal information.',
};

function PrivacyPolicyContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Global Travel Report ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you visit our website.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
          <p>We may collect personal information that you voluntarily provide, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and email address when subscribing to our newsletter</li>
            <li>Contact information when using our contact form</li>
            <li>Comments and feedback you provide</li>
          </ul>

          <h3 className="text-xl font-medium mb-3">2.2 Automatically Collected Information</h3>
          <p>When you visit our website, we automatically collect certain information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>IP address and browser type</li>
            <li>Pages you view and links you click</li>
            <li>Device information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
          <p>We use the collected information for various purposes, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Providing and maintaining our website</li>
            <li>Sending newsletters and updates</li>
            <li>Responding to your inquiries</li>
            <li>Improving our website and user experience</li>
            <li>Analyzing usage patterns and trends</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties
            without your consent, except as described in this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and
            store certain information. You can instruct your browser to refuse all cookies or to
            indicate when a cookie is being sent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However,
            no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Object to our processing of your information</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through our contact form
            or by email at privacy@globaltravelreport.com.
          </p>
        </section>
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