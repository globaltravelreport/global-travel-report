import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Global Travel Report",
  description: "Read our terms of service to understand the rules and guidelines for using Global Travel Report.",
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-600 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Global Travel Report, you accept and agree to be bound by the terms and 
          conditions of this agreement. If you do not agree to abide by the above, please do not use this site.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">2. Use License</h2>
        <p>
          Permission is granted to temporarily access the materials (information or software) on Global Travel 
          Report's website for personal, non-commercial transitory viewing only. This is the grant of a license, 
          not a transfer of title, and under this license you may not:
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose</li>
          <li>Attempt to decompile or reverse engineer any software contained on the website</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
          <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4 mt-8">3. User Content</h2>
        <p>
          By submitting content to our website, you grant Global Travel Report a worldwide, non-exclusive, 
          royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your 
          content in any existing or future media formats.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">4. Disclaimer</h2>
        <p>
          The materials on Global Travel Report's website are provided on an 'as is' basis. Global Travel 
          Report makes no warranties, expressed or implied, and hereby disclaims and negates all other 
          warranties including, without limitation, implied warranties or conditions of merchantability, 
          fitness for a particular purpose, or non-infringement of intellectual property or other 
          violation of rights.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">5. Limitations</h2>
        <p>
          In no event shall Global Travel Report or its suppliers be liable for any damages (including, 
          without limitation, damages for loss of data or profit, or due to business interruption) arising 
          out of the use or inability to use the materials on Global Travel Report's website.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">6. Accuracy of Materials</h2>
        <p>
          The materials appearing on Global Travel Report's website could include technical, typographical, 
          or photographic errors. Global Travel Report does not warrant that any of the materials on its 
          website are accurate, complete, or current. Global Travel Report may make changes to the materials 
          contained on its website at any time without notice.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">7. Links</h2>
        <p>
          Global Travel Report has not reviewed all of the sites linked to its website and is not responsible 
          for the contents of any such linked site. The inclusion of any link does not imply endorsement by 
          Global Travel Report of the site. Use of any such linked website is at the user's own risk.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">8. Modifications</h2>
        <p>
          Global Travel Report may revise these terms of service for its website at any time without notice. 
          By using this website, you are agreeing to be bound by the then current version of these terms of service.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">9. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Australia 
          and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
        </p>

        <h2 className="text-2xl font-semibold mb-4 mt-8">10. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at{' '}
          <a href="mailto:terms@globaltravelreport.com" className="text-primary hover:underline">
            terms@globaltravelreport.com
          </a>
          .
        </p>
      </div>
    </div>
  );
} 