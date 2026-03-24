import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Logo } from '../lib/types';
import DomeGallery from './DomeGallery';
import SplitText from './SplitText';
import './Footer.css';

export function Footer() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [logos, setLogos] = useState<Logo[]>([]);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchLogos() {
      const { data, error } = await supabase
        .from('logos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setLogos(data);
      } else {
        setLogos([
          { id: 'l1', url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", name: 'Amazon', website_url: 'https://amazon.com' },
          { id: 'l2', url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", name: 'Google', website_url: 'https://google.com' },
          { id: 'l3', url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", name: 'Microsoft', website_url: 'https://microsoft.com' },
          { id: 'l4', url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", name: 'Meta', website_url: 'https://meta.com' },
          { id: 'l5', url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", name: 'Apple', website_url: 'https://apple.com' },
          { id: 'l6', url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", name: 'Netflix', website_url: 'https://netflix.com' }
        ]);
      }
    }
    fetchLogos();
  }, []);

  return (
    <div className="monumental-footer-wrapper">
      <footer className="monumental-footer">
        
        {/* Sphere Animation Background */}
        <div className="footer-sphere-wrapper" style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 0, 
          opacity: isMobile ? 0.3 : 0.25, 
          pointerEvents: 'none' 
        }}>
          {logos.length > 0 && (
            <DomeGallery 
              images={logos.map(l => ({ src: l.url, alt: l.name }))} 
              fit={isMobile ? 1.0 : 0.6}
              segments={isMobile ? 22 : 35}
              overlayBlurColor="#000000"
              disableInteraction={true}
            />
          )}
        </div>

        {/* Hero Area */}
        <div className="footer-hero" style={{ pointerEvents: 'none' }}>
            <div className="title-container" style={{ pointerEvents: 'auto' }}>
                <a href="mailto:mahmutelipk@gmail.com" className="huge-title">
                  <SplitText 
                    text="Say hello." 
                    splitType="words, chars"
                    delay={40}
                    duration={1.2}
                    ease="back.out(1.5)"
                    from={{ opacity: 0, y: 70, scale: 0.9, rotationX: -15 }}
                    to={{ opacity: 1, y: 0, scale: 1, rotationX: 0 }}
                    tag="span"
                  />
                </a>
            </div>
        </div>

        {/* Meta Info */}
        <div className="footer-meta" style={{ pointerEvents: 'none' }}>
            <div className="meta-left" style={{ pointerEvents: 'auto' }}>
                <span>© {new Date().getFullYear()} ME. All rights reserved.</span>
            </div>

            <div className="meta-right" style={{ pointerEvents: 'auto' }}>
                <a href="https://x.com/mahmutelipk" className="meta-link" target="_blank" rel="noopener noreferrer">X</a>
                <a href="https://www.linkedin.com/in/mahmutelipek" className="meta-link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://layers.to/mahmutelipek" className="meta-link" target="_blank" rel="noopener noreferrer">Shots</a>
            </div>
        </div>
      </footer>
    </div>
  );
}
