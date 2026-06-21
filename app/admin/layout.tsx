import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getAuthorizedUser } from '@/lib/admin-auth';
import { AdminLogoutButton } from './AdminLogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getAuthorizedUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Global Travel Report Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.email ?? 'Administrator'}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
