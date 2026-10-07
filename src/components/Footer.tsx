import './Frame.css';

const links = [
  { label: 'X', href: 'https://x.com/mahmutelipk' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahmutelipek' },
  { label: 'Shots', href: 'https://layers.to/mahmutelipek' },
];

export function Footer() {
  return (
    <footer style={{ marginTop: 'auto' }}>
      <div className="hatch" />
      <div className="frame" style={{ padding: '4rem 1.5rem 2rem' }}>
        <a
          href="mailto:mahmutelipk@gmail.com"
          style={{ display: 'inline-block', fontSize: 'clamp(2.5rem, 9vw, 4.5rem)', fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1 }}
        >
          Say hello.
        </a>

        <div
          style={{
            marginTop: '3rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>© {new Date().getFullYear()} Mahmut Elipek</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {links.map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{ transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = '')}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
