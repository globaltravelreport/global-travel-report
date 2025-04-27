import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Global Travel Report",
  description: "Read our terms of service and understand the rules and guidelines for using Global Travel Report.",
  openGraph: {
    title: "Terms of Service - Global Travel Report",
    description: "Read our terms of service and understand the rules and guidelines for using Global Travel Report.",
    type: "website",
    locale: "en_US",
    siteName: "Global Travel Report",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xl text-gray-600">
          Last updated: March 20, 2024
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Global Travel Report, you agree to be bound by these
            Terms of Service and all applicable laws and regulations. If you do not agree
            with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily access the materials on Global Travel
            Report for personal, non-commercial transitory viewing only. This is the grant
            of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mt-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to decompile or reverse engineer any software contained on the site</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">3. User Content</h2>
          <p>
            By submitting content to Global Travel Report, you grant us a worldwide,
            non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish,
            translate, and distribute your content in any existing or future media.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">4. Disclaimer</h2>
          <p>
            The materials on Global Travel Report are provided on an 'as is' basis. We make
            no warranties, expressed or implied, and hereby disclaim and negate all other
            warranties including, without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or non-infringement of
            intellectual property or other violation of rights.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">5. Limitations</h2>
          <p>
            In no event shall Global Travel Report or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or profit, or
            due to business interruption) arising out of the use or inability to use the
            materials on our website.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">6. Revisions and Errata</h2>
          <p>
            The materials appearing on Global Travel Report could include technical,
            typographical, or photographic errors. We do not warrant that any of the
            materials on our website are accurate, complete, or current.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">7. Links</h2>
          <p>
            We have not reviewed all of the sites linked to our website and are not
            responsible for the contents of any such linked site. The inclusion of any
            link does not imply endorsement by Global Travel Report of the site.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">8. Modifications</h2>
          <p>
            We may revise these terms of service at any time without notice. By using
            this website, you are agreeing to be bound by the then current version of
            these terms of service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at{" "}
            <a
              href="mailto:legal@globaltravelreport.com"
              className="text-blue-600 hover:text-blue-800"
            >
              legal@globaltravelreport.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
} 