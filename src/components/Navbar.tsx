import { Link } from 'react-router-dom';
import './Frame.css';

export function Navbar() {
  return (
    <header
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 10,
      }}
    >
      <style>{`
        .nav-inner {
          height: 56px;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
        }
        .nav-links { display: flex; align-items: center; gap: 1.25rem; }
        .nav-link { opacity: 0.8; transition: opacity 0.2s ease; }
        .nav-link:hover { opacity: 1; }
        .nav-cta {
          padding: 0.35rem 0.9rem;
          border: 1px solid var(--line);
          border-radius: 999px;
          transition: background-color 0.2s ease;
        }
        .nav-cta:hover { background: rgba(255, 255, 255, 0.08); }
      `}</style>

      <div className="frame">
        <div className="nav-inner">
          <Link
            to="/"
            style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            [me.]
          </Link>

          <nav className="nav-links">
            <Link to="/#projects" className="nav-link">Projects</Link>
            <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-link">
              Shots
            </a>
            <a href="mailto:mahmutelipk@gmail.com" className="nav-cta">Get in Touch</a>
          </nav>
        </div>
      </div>
      <div className="hatch" />
    </header>
  );
}
