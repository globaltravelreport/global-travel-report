'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(searchParams.get('error') ? 'Email confirmation failed. Please try again.' : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function authenticate(mode: 'signIn' | 'signUp') {
    setIsSubmitting(true);
    setMessage('');

    const supabase = createClient();
    const result = mode === 'signIn'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` },
        });

    setIsSubmitting(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === 'signUp' && !result.data.session) {
      setMessage('Check your email to confirm your account, then return here to sign in.');
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void authenticate('signIn');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form className="w-full space-y-5 rounded-lg border border-gray-200 bg-white p-8 shadow-sm" onSubmit={submit}>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-1 text-sm text-gray-600">Use your Global Travel Report account.</p>
        </div>
        <label className="block text-sm font-medium text-gray-700">
          Email
          <input className="mt-1 w-full rounded border border-gray-300 px-3 py-2" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Password
          <input className="mt-1 w-full rounded border border-gray-300 px-3 py-2" type="password" autoComplete="current-password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {message && <p className="rounded bg-gray-100 p-3 text-sm text-gray-700" role="status">{message}</p>}
        <div className="flex gap-3">
          <button className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isSubmitting} type="submit">Sign in</button>
          <button className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 disabled:opacity-60" disabled={isSubmitting} type="button" onClick={() => void authenticate('signUp')}>Create account</button>
        </div>
      </form>
    </main>
  );
}
