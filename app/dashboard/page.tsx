import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) redirect('/login');

  const email = typeof data.claims.email === 'string' ? data.claims.email : data.claims.sub;

  async function signOut() {
    'use server';
    const client = await createClient();
    await client.auth.signOut();
    redirect('/login');
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-16">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Signed in as {email}.</p>
        </div>
        <form action={signOut}>
          <button className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800" type="submit">Sign out</button>
        </form>
      </div>
    </main>
  );
}
