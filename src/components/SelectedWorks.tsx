import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../lib/types';

interface SelectedWorksProps {
  projects: Project[];
}

export function SelectedWorks({ projects }: SelectedWorksProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="works" className="section" style={{ padding: isMobile ? '4rem 1.5rem' : '9rem 5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{
          marginBottom: '40px',
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
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
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
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.25rem',
                  color: 'var(--text-primary)'
                }}>
                  {project.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(project.roles || ['Product Design', 'Motion', '3D']).map((role, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {role}{i < (project.roles || ['Product Design', 'Motion', '3D']).length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
