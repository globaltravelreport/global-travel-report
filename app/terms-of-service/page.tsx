export const metadata = {
  title: 'Terms of Service - Global Travel Report',
  description: 'Read our terms of service to understand the rules and guidelines for using our website.',
};

export default function TermsOfServicePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Terms of <span className="text-brand-gold">Service</span>
            </h1>
            <p className="text-xl text-gray-300">
              Guidelines for using our website
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="mb-12">
              <p className="text-gray-600 mb-6">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">1. Agreement to Terms</h2>
              <p className="mb-6">
                By accessing and using Global Travel Report ("website"), you agree to be bound by these
                Terms of Service and all applicable laws and regulations. If you do not agree with any
                of these terms, you are prohibited from using or accessing this website.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">2. Use License</h2>
              <p className="mb-4">Permission is granted to temporarily access the materials on Global Travel Report's website for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">3. User Content</h2>
              <p className="mb-6">
                By posting, uploading, or submitting content to our website, you grant us a non-exclusive,
                worldwide, royalty-free license to use, modify, publicly perform, publicly display,
                reproduce, and distribute such content.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">4. Disclaimer</h2>
              <p className="mb-6">
                The materials on Global Travel Report's website are provided on an 'as is' basis.
                We make no warranties, expressed or implied, and hereby disclaim and negate all other
                warranties including, without limitation, implied warranties or conditions of merchantability,
                fitness for a particular purpose, or non-infringement of intellectual property or other
                violation of rights.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">5. Limitations</h2>
              <p className="mb-6">
                In no event shall Global Travel Report or its suppliers be liable for any damages
                (including, without limitation, damages for loss of data or profit, or due to business
                interruption) arising out of the use or inability to use the materials on our website.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">6. Links</h2>
              <p className="mb-6">
                Global Travel Report has not reviewed all of the sites linked to its website and is not
                responsible for the contents of any such linked site. The inclusion of any link does not
                imply endorsement by Global Travel Report of the site. Use of any such linked website is
                at the user's own risk.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">7. Modifications</h2>
              <p className="mb-6">
                Global Travel Report may revise these terms of service at any time without notice. By using
                this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">8. Governing Law</h2>
              <p className="mb-6">
                These terms and conditions are governed by and construed in accordance with the laws of
                Australia and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">9. Contact Information</h2>
              <p className="mb-6">
                If you have any questions about these Terms of Service, please contact us through our
                contact form or by email at <a href="mailto:editorial@globaltravelreport.com" className="text-brand-gold hover:text-brand-lightGold">editorial@globaltravelreport.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}