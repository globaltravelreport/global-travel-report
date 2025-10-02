import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SecureAuth } from '../../src/lib/secureAuth';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side authentication check
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('auth_session');

  if (!sessionCookie?.value) {
    redirect('/admin/login');
  }

  // Validate session
  const auth = SecureAuth.getInstance();
  const session = auth.getSessionFromRequest({
    cookies: {
      get: (name: string) => name === 'auth_session' ? { value: sessionCookie.value } : undefined
    }
  } as any);

  if (!auth.isAuthenticated(session) || session?.role !== 'admin') {
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
              <span className="text-sm text-gray-700">Welcome, {session.username}</span>
              <form action="/api/admin/logout" method="POST" className="inline">
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </form>
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
