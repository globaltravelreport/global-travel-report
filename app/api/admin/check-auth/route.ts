import { NextResponse } from 'next/server';
import { getAuthorizedUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getAuthorizedUser();

    if (user?.role === 'admin') {
      return NextResponse.json({ authenticated: true, role: user.role });
    } else {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (_error) {
    console.error(_error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
