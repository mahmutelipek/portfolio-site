import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../lib/types';

interface SelectedWorksProps {
  projects: Project[];
}

export function SelectedWorks({ projects }: SelectedWorksProps) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const getPaddingBottom = () => {
    if (isMobile) return '16px';
    if (isTablet) return '32px';
    return '80px';
  };

  const getCustomSummary = (title: string, originalFirstSentence: string) => {
    const t = title.toLowerCase();
    if (t.includes('norm')) return 'Banking platform for freelancers and small businesses.';
    if (t.includes('hotpepper') || t.includes('hot pepper') || t.includes('hot')) return 'Creator subscription platform with gated content and payments.';
    if (t.includes('frink')) return 'Coffee subscription app for daily use across multiple locations.';
    if (t.includes('elva') || t.includes('face') || t.includes('yoga')) return 'AI-powered facial exercise app with personalized routines.';
    if (t.includes('loodos')) return 'Corporate website for a multi-vertical technology company.';
    if (t.includes('view') || t.includes('hospital')) return 'Healthcare website with a scalable CMS component system.';
    if (t.includes('humble')) return 'Corporate website for a digital services company.';
    if (t.includes('fire') || t.includes('crawl')) return 'Interactive WebGL launch campaign for a developer-focused platform.';
    return originalFirstSentence; // fallback
  };

  return (
    <section id="works" className="section" style={{ 
      paddingTop: isMobile ? '4rem' : '9rem',
      paddingLeft: isMobile ? '1rem' : '5rem',
      paddingRight: isMobile ? '1rem' : '5rem',
      paddingBottom: getPaddingBottom()
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{
          marginBottom: '56px',
          fontSize: isMobile ? '18px' : '22px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#ffffff',
          textAlign: 'center'
        }}>
          Selected Works
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '48px' : '6rem' }}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial="initial"
              whileInView="animate"
              whileHover="hover"
              viewport={{ once: true, margin: '-100px' }}
              variants={{
                initial: { opacity: 0, y: 50 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.8, delay: index * 0.1 } }
              }}
            >
              <Link to={`/works/${project.slug}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '1280 / 768',
                    overflow: 'hidden',
                    backgroundColor: '#111111',
                    marginBottom: '1.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <motion.img
                    src={project.cover_image_url || project.content_blocks?.find(b => b.type === 'image')?.value || ''}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    variants={{
                      initial: { scale: 1 },
                      animate: { scale: 1 },
                      hover: { scale: 1.03 }
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {project.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      opacity: 0.8,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {getCustomSummary(project.title, project.content_blocks?.find(b => b.type === 'text')?.value?.split('.')[0] + '.' || project.roles?.join(', ') || '')}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
