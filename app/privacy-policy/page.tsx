export const metadata = {
  title: 'Privacy Policy - Global Travel Report',
  description: 'Our commitment to protecting your privacy and personal information at Global Travel Report.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-16 md:py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/texture-pattern.svg')] bg-repeat"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy <span className="text-brand-gold">Policy</span>
            </h1>
            <p className="text-xl text-gray-300">
              Our commitment to protecting your privacy
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

              <p className="mb-6">
                At Global Travel Report, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">1. Introduction</h2>
              <p>
                Global Travel Report ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you visit our website.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">2. Information We Collect</h2>

              <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">2.1 Personal Information</h3>
              <p className="mb-4">
                We may collect personal information that you voluntarily provide, including:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Name and email address when subscribing to our newsletter</li>
                <li>Contact information when using our contact form</li>
                <li>Comments and feedback you provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">2.2 Automatically Collected Information</h3>
              <p className="mb-4">
                When you visit our website, we automatically collect certain information, including:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>IP address and browser type</li>
                <li>Pages you view and links you click</li>
                <li>Device information</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">
                We use the collected information for various purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Providing and maintaining our website</li>
                <li>Sending newsletters and updates</li>
                <li>Responding to your inquiries</li>
                <li>Improving our website and user experience</li>
                <li>Analyzing usage patterns and trends</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">4. Information Sharing</h2>
              <p className="mb-6">
                We do not sell, trade, or otherwise transfer your personal information to third parties
                without your consent, except as described in this Privacy Policy.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">5. Cookies and Tracking Technologies</h2>
              <p className="mb-6">
                We use cookies and similar tracking technologies to track activity on our website and
                store certain information. You can instruct your browser to refuse all cookies or to
                indicate when a cookie is being sent.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">6. Data Security</h2>
              <p className="mb-6">
                We implement appropriate security measures to protect your personal information. However,
                no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">7. Your Rights</h2>
              <p className="mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 mb-6">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to our processing of your information</li>
                <li>Withdraw consent</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-4">8. Contact Us</h2>
              <p className="mb-6">
                If you have questions about this Privacy Policy, please contact us through our contact form
                or by email at <a href="mailto:editorial@globaltravelreport.com" className="text-brand-gold hover:text-brand-lightGold">editorial@globaltravelreport.com</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}