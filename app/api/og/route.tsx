import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get title and destination from query params
    const title = searchParams.get('title') || 'Global Travel Report';
    const destination = searchParams.get('destination') || 'Global';
    
    // Truncate title if too long
    const truncatedTitle = title.length > 70 
      ? title.substring(0, 70) + '...' 
      : title;
    
    // Define font data
    const interBold = await fetch(
      new URL('../../../public/fonts/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());
    
    const interRegular = await fetch(
      new URL('../../../public/fonts/Inter-Regular.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());
    
    // Generate the image
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
            fontFamily: 'Inter',
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '15px',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: '8px' }}
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                    fill="white"
                  />
                </svg>
                {destination}
              </div>
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
        fonts: [
          {
            name: 'Inter',
            data: interBold,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interRegular,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
