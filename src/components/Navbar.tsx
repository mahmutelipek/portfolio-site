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
        </div>
      </div>
      <div className="hatch" />
    </header>
  );
}
