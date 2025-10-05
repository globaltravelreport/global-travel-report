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

    // Generate the image with a simpler design
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to bottom, #0c4a6e, #0ea5e9)',
            padding: '40px',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '900px',
              padding: '20px',
              borderRadius: '15px',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 'normal',
                marginBottom: '10px',
                opacity: 0.9,
              }}
            >
              Global Travel Report
            </div>
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '20px',
                lineHeight: 1.2,
              }}
            >
              {truncatedTitle}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                opacity: 0.8,
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
    console.error('Error generating OG image:', error);

    // Return a fallback image response
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
