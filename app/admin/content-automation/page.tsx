import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Content Automation - Admin Dashboard',
  description: 'Manage automated content ingestion, featured stories, and content quality.',
};

export default function ContentAutomationPage() {
  redirect('/admin/story-drafts');
}
