export default function Header() {
  return (
    <header style={{ padding: '20px', backgroundColor: '#f8f8f8', textAlign: 'center' }}>
      <h1 style={{ margin: '0', fontSize: '2rem' }}>Global Travel Report</h1>
      <nav style={{ marginTop: '10px' }}>
        <a href="/" style={{ margin: '0 10px' }}>Home</a>
        <a href="/about" style={{ margin: '0 10px' }}>About</a>
        <a href="/contact" style={{ margin: '0 10px' }}>Contact</a>
      </nav>
    </header>
  );
}
