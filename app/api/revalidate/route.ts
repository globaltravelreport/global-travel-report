import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * API route to revalidate specific paths
 * This is used to update the static pages when new content is added
 */
export async function GET(request: NextRequest) {
  try {
    // Check for API key if this is a public endpoint
    const apiKey = request.headers.get('x-api-key');
    const secretKey = process.env.CRON_SECRET_KEY;

    if (secretKey && apiKey !== secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized'
        },
        { status: 401 }
      );
    }

    // Get the path to revalidate from query parameters
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '/';

    // Revalidate the path
    revalidatePath(path);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Revalidated path: ${path}`,
      revalidated: true,
      now: Date.now()
    });
  } catch (_error) {
    console.error(_error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error revalidating path',
        error: _error instanceof Error ? _error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
