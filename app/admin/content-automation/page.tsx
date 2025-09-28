import { Metadata } from 'next';
import ContentAutomationDashboard from '@/src/components/admin/ContentAutomationDashboard';

export const metadata: Metadata = {
  title: 'Content Automation - Admin Dashboard',
  description: 'Manage automated content ingestion, featured stories, and content quality.',
};

export default function ContentAutomationPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ContentAutomationDashboard />
    </div>
  );
}