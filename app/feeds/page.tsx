import Link from 'next/link';
import { Metadata } from 'next';
import { CATEGORIES } from '@/src/config/categories';
import { RssIcon } from 'lucide-react';
import { SafeSearchParamsProvider } from '@/src/components/ui/SearchParamsProvider';

export const metadata: Metadata = {
  title: 'RSS Feeds - Global Travel Report',
  description: 'Subscribe to our RSS feeds to stay updated with the latest travel stories and news.',
};

function FeedsPageContent() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  // Get all categories that should have feeds
  const categoryFeeds = CATEGORIES.filter(cat => !cat.parent); // Only main categories

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">RSS Feeds</h1>

      <div className="prose max-w-none mb-12">
        <p className="text-lg">
          Stay updated with the latest travel stories and news from Global Travel Report by subscribing to our RSS feeds.
          You can use these feeds with any RSS reader or news aggregator to automatically receive updates when new content is published.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Main Feed</h2>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">All Stories</h3>
              <p className="text-gray-600 mb-4">
                Get all the latest stories from Global Travel Report in one feed.
              </p>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono break-all">
                {`${baseUrl}/api/feed/rss`}
              </code>
            </div>
            <Link
              href="/api/feed/rss"
              target="_blank"
              className="flex items-center gap-2 bg-[#19273A] text-[#C9A14A] px-4 py-2 rounded-md hover:bg-[#2a3b52] transition-colors"
            >
              <RssIcon size={18} />
              <span>Subscribe</span>
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Category Feeds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryFeeds.map(category => (
            <div key={category.slug} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                </div>
                <p className="text-gray-600 mb-4 flex-grow">
                  {category.description}
                </p>
                <div className="mt-auto">
                  <code className="block bg-gray-100 px-3 py-1 rounded text-sm font-mono mb-4 break-all">
                    {`${baseUrl}/api/feed/rss?category=${category.slug}`}
                  </code>
                  <Link
                    href={`/api/feed/rss?category=${category.slug}`}
                    target="_blank"
                    className="flex items-center gap-2 bg-[#19273A] text-[#C9A14A] px-4 py-2 rounded-md hover:bg-[#2a3b52] transition-colors w-fit"
                  >
                    <RssIcon size={18} />
                    <span>Subscribe</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">How to Use RSS Feeds</h2>
        <div className="prose max-w-none">
          <p>
            RSS (Really Simple Syndication) is a web feed format that allows you to subscribe to websites and receive updates automatically.
            To use our RSS feeds:
          </p>
          <ol>
            <li>Choose a feed reader or news aggregator (like Feedly, Inoreader, or NewsBlur)</li>
            <li>Copy the feed URL you want to subscribe to</li>
            <li>Add the URL to your feed reader</li>
            <li>You'll now receive updates whenever new content is published</li>
          </ol>
          <p>
            Many browsers and email clients also support RSS feeds directly. You can also use these feeds to automatically share our content on your website or social media platforms.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FeedsPage() {
  return (
    <SafeSearchParamsProvider>
      {() => <FeedsPageContent />}
    </SafeSearchParamsProvider>
  );
}
