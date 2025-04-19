export default function UnsplashDemo() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e"
            alt="Beautiful beach with turquoise water and white sand"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        <p style={{
          marginTop: '1rem',
          textAlign: 'center',
          color: '#4B5563'
        }}>
          Photo by{' '}
          <a
            href="https://unsplash.com/@oulashin"
            style={{
              color: '#2563EB',
              textDecoration: 'none'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sean Oulashin
          </a>
          {' '}on{' '}
          <a
            href="https://unsplash.com"
            style={{
              color: '#2563EB',
              textDecoration: 'none'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
} 