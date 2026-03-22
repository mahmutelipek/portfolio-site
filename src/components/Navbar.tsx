import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ShinyText from './ShinyText';

export function Navbar() {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
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
          justify-content: space-between;
          padding: 2rem;
          box-sizing: border-box;
          pointer-events: auto;
        }
        .nav-col-logo { flex: 1; display: flex; align-items: baseline; gap: 1rem; }
        .nav-col-disciplines { flex: 0 0 auto; margin-right: 16vw; text-align: left; }
        .nav-col-navigation { flex: 0 0 auto; }
        .nav-col-contact { flex: 1; display: flex; justify-content: flex-end; }

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
          .nav-col-logo { width: auto; flex: 1; order: 1; margin-bottom: 0px; display: flex; align-items: center; justify-content: flex-start; }
          .nav-col-navigation { width: auto; flex: 0 0 auto; order: 2; display: flex; justify-content: center; align-items: center; }
          .nav-col-contact { width: auto; flex: 1; order: 3; margin-left: 0; display: flex; align-items: center; justify-content: flex-end; }
          .nav-col-disciplines { display: none; margin-right: 0; }
          .social-links { gap: 0.25rem; }
        }

        @media (max-width: 640px) {
          .nav-container { padding: 1rem; flex-wrap: nowrap; align-items: center; justify-content: space-between; }
          .nav-col-logo { flex: 1; display: flex; align-items: center; gap: 0.25rem; justify-content: flex-start; }
          .nav-col-disciplines { display: none; }
          .nav-col-navigation { flex: 0 0 auto; display: flex; justify-content: center; align-items: center; }
          .nav-col-contact { flex: 1; display: flex; align-items: center; justify-content: flex-end; }
        }
      `}</style>

      <div className="nav-container">
        {/* Logo */}
        <div className="nav-col-logo">
          <Link 
            to="/" 
            className="nav-link" 
            style={{ textDecoration: 'none', color: '#ffffff', pointerEvents: 'auto' }}
            onClick={(e) => {
              if (window.location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                window.scrollTo(0, 0);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '-0.02em' }}
            >
              [me.]
            </motion.div>
          </Link>
        </div>

        {/* Disciplines */}
        <AnimatePresence>
          {visible && (
            <motion.div 
              className="nav-col-disciplines" 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                lineHeight: 1.3
              }}
            >
              Product & Experience Designer<br />
              <span style={{ opacity: 0.5 }}>
                Design Systems · UX<br />
                3D · Motion · WebGL
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social Links (replacing Opportunities) */}
        <AnimatePresence>
          {visible && (
            <motion.div 
              className="nav-col-navigation" 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                <a href="https://layers.to/mahmutelipek" target="_blank" rel="noopener noreferrer" className="nav-link">Shots</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Button */}
        <div className="nav-col-contact">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <a 
              href="#contact" 
              style={{ 
                textDecoration: 'none', 
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.025em',
                lineHeight: 1.3
              }}
            >
              <ShinyText text="Get in Touch" speed={3} color="white" shineColor="rgba(255,255,255,0.5)" />
            </a>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
