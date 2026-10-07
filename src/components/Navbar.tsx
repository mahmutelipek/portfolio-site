import { Link, useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';
import type { MouseEvent } from 'react';
import './Frame.css';

export function Navbar() {
  const lenis = useLenis();
  const { pathname } = useLocation();

  // On the homepage scroll in place; elsewhere let the router go to "/#projects".
  const goToProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/') return;
    const el = document.getElementById('projects');
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el);
    else el.scrollIntoView({ behavior: 'smooth' });
  };

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
        .nav-link { opacity: 0.8; transition: opacity 0.2s ease; }
        .nav-link:hover { opacity: 1; }
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

          <Link to="/#projects" className="nav-link" onClick={goToProjects}>
            Projects
          </Link>
        </div>
      </div>
      <div className="hatch" />
    </header>
  );
}
