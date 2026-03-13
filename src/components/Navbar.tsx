import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ShinyText from './ShinyText';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger when user scrolls past the Hero section (100vh)
      setScrolled(window.scrollY > window.innerHeight - 50);
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
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        color: 'var(--text-primary)'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '1280px',
        padding: '1rem 5rem',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center'
      }}>
        {/* Left: Branding */}
        <div style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase', position: 'relative', height: '18px' }}>
          <AnimatePresence mode="wait">
            {!scrolled ? (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute' }}
              >
                Portfolio V2.0 // 2026
              </motion.div>
            ) : (
              <motion.div
                key="name"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'absolute' }}
              >
                Mahmut Elİpek
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Navigation */}
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/" className="nav-item" style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            Home
          </Link>
        </nav>

        {/* Right: Contact */}
        <div style={{ textAlign: 'right' }}>
          <a 
            href="mailto:mahmutelipk@gmail.com"
            className="nav-item contact-btn"
            style={{ 
              display: 'inline-block',
              fontSize: '12px', 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              textDecoration: 'none'
            }}
          >
            <ShinyText text="Contact" speed={3} color="#000000" shineColor="#FFFFFF" />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
