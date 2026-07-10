import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Authentication must not make unrelated public pages unavailable when an
  // environment variable is missing or the Auth service is temporarily down.
  // Protected pages independently verify claims before serving user data.
  if (!supabaseUrl || !supabasePublishableKey) return response;

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // This validates/refreshes the token. Do not replace with getSession().
  try {
    await supabase.auth.getClaims();
  } catch (error) {
    console.error('Unable to refresh the Supabase session in proxy', error);
  }

  return response;
}
