import { ImageResponse } from 'next/og';
import { JSX } from 'react';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    const description = searchParams.get('description');

    if (!title || !description) {
      return new Response('Missing required parameters', { status: 400 });
    }

    const element: JSX.Element = (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '40px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: 'black',
              marginBottom: '20px',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '30px',
              color: 'gray',
            }}
          >
            {description}
          </p>
        </div>
      </div>
    );

    return new ImageResponse(element, {
      width: 1200,
      height: 630,
    });
  } catch (e) {
    console.error('Error generating OG image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
} 