import { Metadata } from 'next';
import { SubmissionsManagementClient } from './SubmissionsManagementClient';

export const metadata: Metadata = {
  title: 'Manage Story Submissions - Global Travel Report Admin',
  description: 'Review and moderate user-submitted travel stories',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSubmissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Story Submissions</h1>
          <p className="text-gray-600">
            Review and moderate user-submitted travel stories before publishing.
          </p>
        </div>

        <SubmissionsManagementClient />
      </div>
    </div>
  );
}