import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'RSS Feed Management - Global Travel Report Admin',
  description: 'Manage RSS feeds and content automation pipeline',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRSSPage() {
  redirect('/admin/story-drafts');
}
