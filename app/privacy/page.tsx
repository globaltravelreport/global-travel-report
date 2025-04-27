import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Global Travel Report",
  description: "Learn how Global Travel Report collects, uses, and protects your personal information.",
  openGraph: {
    title: "Privacy Policy - Global Travel Report",
    description: "Learn how Global Travel Report collects, uses, and protects your personal information.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-600">
          Last updated: March 20, 2024
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Travel stories and content</li>
            <li>Communications with us</li>
            <li>Newsletter preferences</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Provide and maintain our services</li>
            <li>Process and publish your travel stories</li>
            <li>Send you newsletters and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our website and services</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may
            share your information with:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Service providers who assist in our operations</li>
            <li>Legal authorities when required by law</li>
            <li>Other users (with your consent)</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Remember your preferences</li>
            <li>Analyze website traffic</li>
            <li>Improve user experience</li>
            <li>Provide personalized content</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
          <p>
            Our services are not intended for children under 13. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of
            any changes by posting the new policy on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a
              href="mailto:privacy@globaltravelreport.com"
              className="text-blue-600 hover:text-blue-800"
            >
              privacy@globaltravelreport.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
} 