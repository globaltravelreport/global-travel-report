
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, FileText, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminHeader() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <Home className="h-5 w-5" />
              <span className="font-semibold">Global Travel Report</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link 
                href="/admin/story-upload" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <FileText className="h-4 w-4" />
                <span>Story Upload</span>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Admin Portal</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
