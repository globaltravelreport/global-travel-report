import { Metadata } from 'next'
import PageLayout from '../components/PageLayout'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Global Travel Report',
  description: 'Read our terms and conditions for using Global Travel Report. Last updated: 20 APR 2025.',
  openGraph: {
    title: 'Terms & Conditions | Global Travel Report',
    description: 'Read our terms and conditions for using Global Travel Report. Last updated: 20 APR 2025.',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <PageLayout
      title="Terms & Conditions"
      description="Last updated: 20 APR 2025"
      heroType="terms"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="lead">
            Welcome to Global Travel Report. By accessing or using our website (https://www.globaltravelreport.com), 
            you agree to be bound by the following terms and conditions. If you do not agree with any part of these terms, 
            please do not use our website.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">1. Use of the Website</h2>
          <p>
            Global Travel Report provides travel news, reviews, and insights for informational purposes only. 
            By using this website, you agree not to misuse the content or services offered.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Use the site for unlawful or harmful purposes</li>
            <li>Attempt to breach or interfere with site security</li>
            <li>Copy, distribute, or modify our content without permission</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property</h2>
          <p>
            All content on this site—including articles, images, logos, and branding—is the property of Global Travel Report 
            or its content suppliers, unless stated otherwise. Reproduction or distribution without written permission is prohibited.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Disclaimer</h2>
          <p>
            We strive to ensure that all information provided on this website is accurate and up to date. However, 
            we make no guarantees or warranties about the completeness, accuracy, reliability, or availability of content. 
            Any reliance you place on such information is at your own risk.
          </p>
          <p>We are not responsible for:</p>
          <ul>
            <li>Booking errors or financial loss due to reliance on articles</li>
            <li>Travel disruptions, changes in government regulations, or safety risks</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. External Links</h2>
          <p>
            Our site may contain links to third-party websites. These are provided for your convenience and do not imply endorsement. 
            We are not responsible for the content, policies, or practices of external sites.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. User-Generated Content</h2>
          <p>
            If you submit or share content with us (e.g., comments, feedback, or testimonials), you grant us a non-exclusive, 
            royalty-free, and worldwide license to use, display, and distribute this content.
          </p>
          <p>You agree not to post anything unlawful, abusive, defamatory, or spam-related.</p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Global Travel Report shall not be liable for any indirect, incidental, 
            or consequential loss or damage arising from your use of this site or reliance on its content.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes to These Terms</h2>
          <p>
            We may update these Terms & Conditions from time to time. The most current version will always be available on this page. 
            Continued use of our site after changes are posted constitutes acceptance of those changes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of New South Wales, Australia. Any disputes shall be subject to the exclusive 
            jurisdiction of the courts in that region.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
          <p>If you have questions or concerns about these terms, please contact us at:</p>
          <p>
            📧 <a href="mailto:editorial@globaltravelreport.com" className="text-blue-600 hover:text-blue-800">
              editorial@globaltravelreport.com
            </a>
            <br />
            🌏 <a href="https://www.globaltravelreport.com" className="text-blue-600 hover:text-blue-800">
              https://www.globaltravelreport.com
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  )
} 