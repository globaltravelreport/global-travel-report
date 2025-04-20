import { Metadata } from 'next'
import PageLayout from '../components/PageLayout'

export const metadata: Metadata = {
  title: 'Privacy Policy | Global Travel Report',
  description: 'Learn how Global Travel Report collects, uses, and protects your data in accordance with Australian privacy standards.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <PageLayout 
      title="Privacy Policy"
      description="Our commitment to your privacy"
    >
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-base leading-relaxed text-gray-800">
        <section>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We collect personal information you voluntarily provide to us, such as your name, email address, and preferences, when you sign up for newsletters, submit inquiries, or interact with our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside ml-4">
            <li>To provide and personalise our services</li>
            <li>To send newsletters or promotional emails (with opt-out available)</li>
            <li>To improve website performance and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. Data Protection</h2>
          <p>
            We implement appropriate technical and organisational security measures to protect your data from unauthorised access, misuse, or loss.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Cookies & Tracking</h2>
          <p>
            Our website uses cookies for analytics and functionality. You may disable cookies through your browser settings, but this may affect your experience.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
          <p>
            We may use services like Google Analytics or reCAPTCHA. These third parties have their own privacy policies which govern how they handle your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Your Rights</h2>
          <p>
            Under Australian privacy laws, you have the right to request access to or correction of your personal data. Contact us at editorial@globaltravelreport.com for any such requests.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Updates to This Policy</h2>
          <p>
            We may update this policy from time to time. Any changes will be posted on this page with a revised date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">8. Contact Us</h2>
          <p>
            For privacy-related inquiries, please email us at <a href="mailto:editorial@globaltravelreport.com" className="text-blue-600 underline">editorial@globaltravelreport.com</a>.
          </p>
        </section>
      </div>
    </PageLayout>
  );
} 