import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Project } from '../lib/types';
import { FitImage } from './FitMedia';
import './Frame.css';

interface SelectedWorksProps {
  projects: Project[];
}

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
  return originalFirstSentence;
};

export function SelectedWorks({ projects }: SelectedWorksProps) {
  return (
    <section id="projects">
      <style>{`
        .works-grid {
          display: flex;
          flex-direction: column;
        }
        .work-item { border-bottom: 1px solid var(--line); }
        .work-item:last-child { border-bottom: none; }
        .work-card {
          display: block;
          padding: var(--pad);
          transition: background-color 0.3s ease;
        }
        .work-card:hover { background: rgba(255, 255, 255, 0.03); }
        .work-card .cover {
          overflow: hidden;
          border-radius: 12px;
          background: #111;
        }
        .work-card .cover img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .work-card:hover .cover img { transform: scale(1.03); }
        .work-arrow {
          flex-shrink: 0;
          opacity: 0;
          transform: translate(-4px, 4px);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .work-card:hover .work-arrow,
        .work-card:focus-visible .work-arrow {
          opacity: 0.8;
          transform: translate(0, 0);
        }
      `}</style>

      <div className="frame">
        <h2 className="section-title">Projects</h2>
        <div style={{ position: 'relative' }} className="rule-top">
          <div className="works-grid">
            {projects.map((project, index) => {
              const cover = project.cover_image_url || project.content_blocks?.find(b => b.type === 'image')?.value || '';
              const firstSentence = project.content_blocks?.find(b => b.type === 'text')?.value?.split('.')[0] + '.' || project.roles?.join(', ') || '';
              return (
                <motion.div
                  key={project.id}
                  className="work-item"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.5, delay: index === 0 ? 0 : 0.05 }}
                >
                  <Link to={`/works/${project.slug}`} className="work-card">
                    {cover ? (
                      <FitImage
                        className="cover"
                        src={cover}
                        alt={project.title}
                        sizes="(max-width: 720px) 100vw, 672px"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="cover" style={{ aspectRatio: '1280 / 768' }} />
                    )}
                    <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>{project.title}</h3>
                        <ArrowUpRight size={16} className="work-arrow" />
                      </div>
                      <p
                        style={{
                          fontSize: '14px',
                          lineHeight: 1.45,
                          color: 'var(--text-secondary)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {getCustomSummary(project.title, firstSentence)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
