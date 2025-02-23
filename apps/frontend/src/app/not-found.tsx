export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        The page you are looking for does not exist.
      </p>
      <a
        href="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007AFF',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          transition: 'background-color 0.2s'
        }}
      >
        Go Back Home
      </a>
    </div>
  );
} 