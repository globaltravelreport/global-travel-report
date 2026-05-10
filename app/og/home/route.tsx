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
          background: '#0a1020',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #101827 0%, #153b54 44%, #b7791f 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 78% 24%, rgba(255, 213, 128, 0.34) 0, rgba(255, 213, 128, 0.16) 23%, transparent 45%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            height: 150,
            background: 'linear-gradient(90deg, #0f766e 0%, #2563eb 44%, #c084fc 100%)',
            opacity: 0.78,
          }}
        />
        <div
          style={{
            width: 1040,
            height: 470,
            display: 'flex',
            position: 'relative',
            gap: 56,
          }}
        >
          <div
            style={{
              width: 660,
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
                fontSize: 80,
                fontWeight: 900,
                marginTop: 34,
                lineHeight: 0.96,
              }}
            >
              Global Travel Report
            </div>
            <div
              style={{
                color: '#e2e8f0',
                fontSize: 31,
                lineHeight: 1.22,
                marginTop: 24,
                maxWidth: 620,
              }}
            >
              Air travel, cruise, accommodation, destinations, deals and safety in one newsroom.
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
              gap: 16,
            }}
          >
            {['Air Travel', 'Cruise', 'Accommodation', 'Travel Deals'].map((label) => (
              <div
                key={label}
                style={{
                  width: 310,
                  height: 64,
                  borderRadius: 18,
                  background: 'rgba(255, 255, 255, 0.94)',
                  color: '#0f172a',
                  fontSize: label.length > 12 ? 25 : 28,
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
