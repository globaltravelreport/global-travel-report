import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Generate a simple OG image for social media sharing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get title and destination from query params
    const title = searchParams.get('title') || 'Global Travel Report';
    const destination = searchParams.get('destination') || 'Global';

    // Truncate title if too long
    const truncatedTitle = title.length > 60
      ? title.substring(0, 60) + '...'
      : title;

    // Generate a branded, high-contrast image for social previews.
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #101827 0%, #153b54 48%, #b7791f 100%)',
            padding: '58px',
            color: 'white',
            fontFamily: 'sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 78% 24%, rgba(255, 213, 128, 0.34) 0, rgba(255, 213, 128, 0.12) 24%, transparent 44%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              width: '100%',
              height: 122,
              background: 'linear-gradient(90deg, #0f766e 0%, #2563eb 44%, #c084fc 100%)',
              opacity: 0.75,
            }}
          />
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxWidth: '1020px',
            }}
          >
            <div
              style={{
                color: '#fbbf24',
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: 3,
                textTransform: 'uppercase',
                marginBottom: 28,
              }}
            >
              Global Travel Report
            </div>
            <div
              style={{
                fontSize: 70,
                fontWeight: 900,
                lineHeight: 0.98,
                maxWidth: 940,
              }}
            >
              {truncatedTitle}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: 34,
                fontSize: 30,
                color: '#e2e8f0',
              }}
            >
              {destination}
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              fontSize: '16px',
              opacity: 0.7,
            }}
          >
            www.globaltravelreport.com
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (_error) {
    console.error(_error);

    // Return a fallback image response
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
