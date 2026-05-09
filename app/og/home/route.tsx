import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Global Travel Report social preview';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #06283d 0%, #0f766e 48%, #f97316 100%)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 125,
            top: 45,
            width: 175,
            height: 175,
            borderRadius: 999,
            background: '#ffd166',
            opacity: 0.9,
          }}
        />
        <div
          style={{
            width: 1020,
            height: 466,
            borderRadius: 34,
            background: 'rgba(255, 255, 255, 0.96)',
            boxShadow: '0 22px 44px rgba(3, 19, 31, 0.32)',
            display: 'flex',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 12,
              background: '#f97316',
            }}
          />
          <div
            style={{
              width: 720,
              padding: '54px 0 0 54px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                color: '#0f172a',
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: 3,
              }}
            >
              INDEPENDENT TRAVEL NEWS
            </div>
            <div
              style={{
                color: '#08111f',
                fontSize: 66,
                fontWeight: 900,
                marginTop: 56,
                lineHeight: 1,
              }}
            >
              Global Travel Report
            </div>
            <div
              style={{
                color: '#334155',
                fontSize: 32,
                lineHeight: 1.28,
                marginTop: 24,
                maxWidth: 650,
              }}
            >
              Travel news, cruise updates and airline stories for Australian travellers
            </div>
            <div
              style={{
                marginTop: 42,
                height: 52,
                padding: '0 28px',
                borderRadius: 999,
                background: '#0f766e',
                color: '#ffffff',
                fontSize: 26,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                width: 348,
              }}
            >
              globaltravelreport.com
            </div>
          </div>
          <div
            style={{
              flex: 1,
              paddingTop: 92,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 142,
                height: 96,
                borderRadius: 20,
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 36,
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              GTR
            </div>
            <div
              style={{
                marginTop: 36,
                color: '#0f172a',
                opacity: 0.78,
                fontSize: 25,
                fontWeight: 800,
                lineHeight: 1.65,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span>Cruises</span>
              <span>Airlines</span>
              <span>Destinations</span>
              <span>Travel Advice</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
