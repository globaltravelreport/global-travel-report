import ContentRewriter from '../components/ContentRewriter';
import PageLayout from '../components/PageLayout';

export default function RewritePage() {
  return (
    <PageLayout
      title="Private Content Rewriter"
      description="Private tool for content adaptation across different platforms. Access restricted to authorized users only."
      heroImage="/images/hero-rewrite.jpg"
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This is a private tool. Please do not share the URL or credentials with unauthorized users.
                </p>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 mb-4">
            Our AI-powered content rewriter helps you adapt your content for different platforms while maintaining your message's core meaning. Simply paste your text, select the target platform, and let our AI do the rest.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Blog: Professional, detailed, and SEO-friendly content</li>
            <li>Facebook: Conversational and engaging posts</li>
            <li>Instagram: Concise, visual-friendly content with hashtags</li>
          </ul>
        </div>
        <ContentRewriter />
      </div>
    </PageLayout>
  );
} 