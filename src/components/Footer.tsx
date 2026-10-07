import { Clock } from './Clock';
import './Frame.css';

export function Footer() {
  return (
    <footer className="rails" style={{ marginTop: 'auto' }}>
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
          <Clock />
          <span>© {new Date().getFullYear()} Mahmut Elipek</span>
        </div>
      </div>
    </footer>
  );
}
