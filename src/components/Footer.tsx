import { Clock } from './Clock';
import './Frame.css';

export function Footer() {
  return (
    <footer className="rails" style={{ marginTop: 'auto' }}>
      <div className="hatch" />
      <div className="frame" style={{ padding: 'var(--pad)' }}>
        <div
          style={{
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
