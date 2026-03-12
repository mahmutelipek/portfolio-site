import { useState, useEffect } from 'react';

export function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer style={{ 
      padding: isMobile ? '3rem 1.5rem' : '4rem 5rem', 
      textAlign: 'center', 
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column-reverse' : 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: isMobile ? '1.5rem' : '0'
      }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          © {new Date().getFullYear()} ME. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center' }}>
          <a href="https://x.com/mahmutelipk" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', color: 'var(--text-secondary)' }}>X</a>
          <a href="https://www.linkedin.com/in/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', color: 'var(--text-secondary)' }}>LinkedIn</a>
          <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-item" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', textDecoration: 'none', color: 'var(--text-secondary)' }}>Layers</a>
        </div>
      </div>
    </footer>
  );
}
