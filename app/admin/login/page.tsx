'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormValidation } from '@/src/hooks/useFormValidation';
import { adminLoginSchema } from '@/src/utils/validation-schemas';
import { useCsrfToken } from '@/src/hooks/useCsrfToken';


export default function AdminLoginPage() {
  const { values, errors, loading, handleChange, handleSubmit } = useFormValidation(adminLoginSchema, { username: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();
  const { csrfToken } = useCsrfToken();

  const onSubmit = async (data: any) => {
    setError('');
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ ...data, csrfToken }),
    });
    await response.json();
    if (response.ok) {
      router.push('/admin/story-upload');
      router.refresh();
    } else if (response.status === 429) {
      setError('Too many login attempts. Please try again later.');
    } else {
      setError('Invalid credentials or login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Global Travel Report</h1>
          <p className="mt-2 text-gray-600">Admin Portal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the story upload system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(onSubmit); }} className="space-y-4" autoComplete="off">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={values.username}
                  onChange={e => handleChange('username', e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter username"
                  aria-invalid={!!errors.username}
                  aria-describedby="username-error"
                />
                {errors.username && <div id="username-error" className="text-red-600 text-sm">{errors.username}</div>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={values.password}
                  onChange={e => handleChange('password', e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter password"
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error"
                />
                {errors.password && <div id="password-error" className="text-red-600 text-sm">{errors.password}</div>}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
