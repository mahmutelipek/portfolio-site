export function Footer() {
  return (
    <footer style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center', 
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          © {new Date().getFullYear()} ME. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="https://x.com/mahmutelipk" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none' }}>X</a>
          <a href="https://www.linkedin.com/in/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none' }}>LinkedIn</a>
          <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none' }}>Layers</a>
        </div>
      </div>
    </footer>
  );
}
