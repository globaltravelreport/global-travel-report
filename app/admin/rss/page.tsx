import { Metadata } from 'next';
import { RSSManagementClient } from './RSSManagementClient';

export const metadata: Metadata = {
  title: 'RSS Feed Management - Global Travel Report Admin',
  description: 'Manage RSS feeds and content automation pipeline',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRSSPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RSS Feed Management</h1>
          <p className="text-gray-600">
            Manage RSS feeds, monitor content pipeline, and control automated content ingestion.
          </p>
        </div>

        <RSSManagementClient />
      </div>
    </div>
  );
}