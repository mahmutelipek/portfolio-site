import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Project } from '../lib/types';

interface SelectedWorksProps {
  projects: Project[];
}

export function SelectedWorks({ projects }: SelectedWorksProps) {
  return (
    <section id="works" className="section" style={{ padding: '8rem 2rem 4rem 2rem' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <h2 style={{
          marginBottom: '40px',
          fontSize: '22px',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#121212',
          textAlign: 'center'
        }}>
          Selected Works
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
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
                    aspectRatio: '3 / 2',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '1.5rem',
                    borderRadius: '4px'
                  }}
                >
                  <motion.img
                    src={project.cover_image_url}
                    alt={project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <h3 style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  marginBottom: '0.5rem'
                }}>
                  {project.title}
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {(project.roles || ['Product Design', 'Motion', '3D']).map((role, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        color: '#999'
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
