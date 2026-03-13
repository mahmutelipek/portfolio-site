import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import ShinyText from './ShinyText';

export function Navbar() {
  const location = useLocation();
  const isProjectPage = location.pathname.startsWith('/works/');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 100,
        color: 'white',
        mixBlendMode: 'difference',
        pointerEvents: 'none'
      }}
    >
      <style>{`
        .nav-container {
          width: 100%;
          display: flex;
          align-items: baseline;
          padding: 2rem;
          box-sizing: border-box;
          pointer-events: auto;
        }
        .nav-col-logo { width: calc(28% - 2rem); display: flex; align-items: baseline; gap: 1rem; }
        .nav-col-disciplines { width: calc(55% - 28%); }
        .nav-col-navigation { width: auto; flex-grow: 1; }
        .nav-col-contact { width: auto; text-align: right; }

        .social-links {
          display: flex;
          gap: 0.75rem;
          font-size: 13px;
          font-weight: 500;
          color: white;
        }
        .nav-link {
          transition: opacity 0.2s ease;
          opacity: 1;
          text-decoration: none;
          color: white;
        }
        .nav-link:hover {
          opacity: 0.6;
        }

        @media (max-width: 1024px) {
          .nav-container { padding: 1.5rem; flex-wrap: nowrap; gap: 1rem; align-items: center; justify-content: space-between; }
          .nav-col-logo { width: auto; order: 1; margin-bottom: 0px; flex-shrink: 0; display: flex; align-items: center; }
          .nav-col-navigation { width: auto; order: 2; display: flex; justify-content: center; flex-grow: 1; align-items: center; }
          .nav-col-contact { width: auto; order: 3; margin-left: 0; flex-shrink: 0; display: flex; align-items: center; }
          .nav-col-disciplines { display: none; }
        }

        @media (max-width: 640px) {
          .nav-container { padding: 1rem; flex-wrap: nowrap; align-items: center; }
          .nav-col-disciplines { display: none; }
          .nav-col-logo { flex-direction: row; align-items: center; gap: 0.25rem; }
          .nav-col-navigation { display: flex; justify-content: center; align-items: center; }
          .nav-col-contact { display: flex; align-items: center; }
        }
      `}</style>

      <div className="nav-container">
        {/* Logo */}
        <div className="nav-col-logo">
          <Link to="/" className="nav-link" style={{ pointerEvents: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, letterSpacing: '0.025em', lineHeight: 1 }}>
              me.
            </div>
          </Link>
        </div>

        {/* Disciplines */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div 
              className="nav-col-disciplines" 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.3
              }}
            >
              {isProjectPage ? (
                "Product & Experience Designer"
              ) : (
                <>
                  Product & Experience Designer<br />
                  Design Systems · UX<br />
                  3D · Motion · WebGL
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Links (replacing Opportunities) */}
        <AnimatePresence>
          {!scrolled && (
            <motion.div 
              className="nav-col-navigation" 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.3
              }}
            >
              <div className="social-links">
                <a href="https://x.com/mahmutelipk" target="_blank" rel="noopener noreferrer" className="nav-link">X</a>
                <span style={{ color: 'white', margin: '0 0.5rem' }}> </span>
                <a href="https://linkedin.com/in/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-link">LinkedIn</a>
                <span style={{ color: 'white', margin: '0 0.5rem' }}> </span>
                <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-link">Layers</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Action */}
        <div className="nav-col-contact" style={{ marginLeft: 'auto' }}>
          <a
            href="mailto:mahmutelipk@gmail.com"
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'white',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
              lineHeight: 1.3
            }}
          >
            <ShinyText text="Get in Touch" speed={3} color="white" shineColor="rgba(255,255,255,0.5)" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
