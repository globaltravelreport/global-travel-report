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
          background: '#07111f',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.95) 0%, rgba(7, 17, 31, 0.88) 42%, rgba(249, 115, 22, 0.76) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: -70,
            top: 30,
            width: 430,
            height: 430,
            borderRadius: 999,
            background: 'rgba(255, 209, 102, 0.88)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 170,
            background: 'linear-gradient(90deg, #0f766e 0%, #0284c7 38%, #f97316 100%)',
            opacity: 0.9,
          }}
        />
        <div
          style={{
            width: 1030,
            height: 470,
            display: 'flex',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: 670,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                color: '#fbbf24',
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}
            >
              Independent Travel News
            </div>
            <div
              style={{
                color: '#ffffff',
                fontSize: 78,
                fontWeight: 900,
                marginTop: 34,
                lineHeight: 0.96,
                letterSpacing: -2,
              }}
            >
              Global Travel Report
            </div>
            <div
              style={{
                color: '#e2e8f0',
                fontSize: 33,
                lineHeight: 1.22,
                marginTop: 24,
                maxWidth: 620,
              }}
            >
              Cruises, airlines, hotels, destinations and travel deals in one newsroom.
            </div>
            <div
              style={{
                marginTop: 38,
                height: 52,
                padding: '0 28px',
                borderRadius: 999,
                background: '#ffffff',
                color: '#0f172a',
                fontSize: 26,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                width: 350,
              }}
            >
              globaltravelreport.com
            </div>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 18,
            }}
          >
            {['Cruise', 'Airlines', 'Hotels', 'Destinations'].map((label) => (
              <div
                key={label}
                style={{
                  width: 285,
                  height: 66,
                  borderRadius: 18,
                  background: 'rgba(255, 255, 255, 0.94)',
                  color: '#0f172a',
                  fontSize: 28,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 28,
                  boxShadow: '0 14px 30px rgba(2, 6, 23, 0.26)',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
