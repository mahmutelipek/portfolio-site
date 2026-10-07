import { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../lib/types';
import { globalStore } from '../lib/store';
import '../components/Frame.css';
import { FitImage, FitVideo } from '../components/FitMedia';

import { useLenis } from 'lenis/react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from '../components/CountUp';
import { glassOverlayStyle } from '../lib/glass';

const SplashLottie = lazy(() => import('../components/SplashLottie'));

function splitList(value?: string): string[] {
  return (value ?? '').split(',').map(v => v.trim()).filter(Boolean);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const MEDIA_SIZES = '(max-width: 720px) 100vw, 672px';

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const isCached = slug ? !!globalStore.projectDetails[slug] : false;
  const [project, setProject] = useState<Project | null>(slug ? globalStore.projectDetails[slug] || null : null);
  const [loading, setLoading] = useState(!isCached);
  const [showSplash, setShowSplash] = useState(!isCached);
  const [prevProject, setPrevProject] = useState<{title: string, slug: string} | null>(null);
  const [nextProject, setNextProject] = useState<{title: string, slug: string} | null>(null);
  const lenis = useLenis();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    if (showSplash) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      lenis?.start();
      document.body.style.overflow = '';
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = '';
    };
  }, [showSplash, lenis]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    const cached = !!globalStore.projectDetails[slug];
    setLoading(!cached);
    setShowSplash(!cached);
    if (cached) {
      setProject(globalStore.projectDetails[slug]);
    }
  }, [slug]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function initNavigation() {
      if (!slug) return;
      let list = globalStore.projectsList;

      if (!list || list.length === 0) {
        const { data } = await supabase
          .from('projects')
          .select('title, slug, sort_order')
          .neq('is_visible', false)
          .order('sort_order', { ascending: true });

        if (data) {
          list = data as any;
          globalStore.projectsList = data as any;
        }
      }

      if (list && list.length > 0) {
        const currentIndex = list.findIndex(p => p.slug === slug);
        if (currentIndex !== -1) {
          setPrevProject(currentIndex > 0 ? list[currentIndex - 1] : null);
          setNextProject(currentIndex < list.length - 1 ? list[currentIndex + 1] : null);
        } else {
          setPrevProject(null);
          setNextProject(null);
        }
      }
    }
    initNavigation();
  }, [slug]);

  useEffect(() => {
    async function fetchProject() {
      if (!slug || globalStore.projectDetails[slug]) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .neq('is_visible', false)
        .single();
        
      if (error) {
        console.error('Error fetching project:', error);
      }
      
      if (data) {
        setProject(data as Project);
        globalStore.projectDetails[slug] = data as Project;
      } else {
        // Fallback dummy data if nothing found
        const dummyProjects: Project[] = [
          {
            id: 'dummy-1',
            title: 'Modern Coffee App',
            slug: 'modern-coffee-app',
            date: '2025-01-10',
            cover_image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2787&auto=format&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2670&auto=format&fit=crop'
            ],
            content_body: '### Overview\nA complete redesign of the mobile ordering experience for specialty coffee lovers.\n\n### Challenge\nThe previous app suffered from low conversion rates due to a confusing, multi-step checkout process and low-quality imagery.\n\n### Solution\nFocused on extreme minimalism, prioritizing high-resolution product imagery and seamless one-touch ordering mechanics. We utilized a strict monochromatic palette to let the coffee photography stand out.\n\n### Results\nIncreased mobile organic orders by 32% and reduced average checkout time from 45 seconds to just 12 seconds.',
            roles: ['Product Design', 'UX Research', 'Prototyping']
          },
          {
            id: 'dummy-2',
            title: 'Banking Dashboard',
            slug: 'banking-dashboard',
            date: '2024-10-22',
            cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'
            ],
            content_body: '### Overview\nDesigning a clear, high-contrast dashboard for complex and high-frequency financial data.\n\n### Challenge\nInstitutional traders were overwhelmed by cluttered interfaces that lacked visual hierarchy, leading to slower decision-making and increased cognitive load during peak hours.\n\n### Solution\nUtilized strict 8pt grid systems, modular card layouts, and monospaced typography to drastically enhance data legibility. We implemented dynamic color coding for instantaneous trend recognition.\n\n### Results\nImproved user workflow efficiency scores by 40% in beta testing, with traders reporting a significantly lower fatigue rate over standard 8-hour sessions.',
            roles: ['UI/UX Design', 'Design Systems']
          }
        ];
        const foundDummy = dummyProjects.find(p => p.slug === slug);
        if (foundDummy) {
          setProject(foundDummy);
          globalStore.projectDetails[slug] = foundDummy;
        }
      }
      setLoading(false);
    }
    
    fetchProject();
  }, [slug]);

  const scope = splitList(project?.industries);

  if (loading && !showSplash) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading...</p>
      </div>
    );
  }

  if (!project && !loading && !showSplash) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project not found</h1>
        <Link to="/" style={{ textDecoration: 'underline' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={glassOverlayStyle}
          >
            <div style={{ 
              position: 'relative', 
              width: isMobile ? '220px' : '300px', 
              height: isMobile ? '220px' : '300px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              maxWidth: '95vw',
              maxHeight: '95vw'
            }}>
              <Suspense fallback={null}>
                <SplashLottie />
              </Suspense>
              <div style={{ 
                position: 'relative', 
                zIndex: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: isMobile ? '34px' : '48px', 
                fontWeight: 500, 
                color: '#fff', 
                letterSpacing: '-0.02em', 
                fontVariantNumeric: 'tabular-nums' 
              }}>
                <CountUp to={100} duration={0.6} onEnd={() => { 
                  setTimeout(() => setShowSplash(false), 100); 
                }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(project && !loading) && (
        <motion.article
          className="rails"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ paddingTop: '66px', minHeight: '100vh', color: '#ffffff' }}
        >
          <style>{`
            .detail { font-size: 14px; line-height: 22px; letter-spacing: -0.09px; color: #d4d4d4; }
            .detail h1 { font-size: clamp(1.5rem, 5vw, 1.75rem); line-height: 1.15; font-weight: 500; letter-spacing: -0.02em; color: #fff; overflow-wrap: anywhere; }
            .detail h3 { font-size: 15px; line-height: 22px; font-weight: 600; color: #fff; margin-bottom: 0.5rem; overflow-wrap: anywhere; }
            .detail p { font-size: inherit; margin: 0; overflow-wrap: anywhere; }
            .detail p + p { margin-top: 0.75rem; }
            .detail .meta { margin-top: 0.5rem; }
            .detail strong { font-weight: 550; color: #fff; }
            .detail-media { width: 100%; background: #0a0a0a; overflow: hidden; border-radius: 12px; }
            .detail-pager { display: grid; grid-template-columns: 1fr 1fr; }
            .detail-pager a { display: block; padding: var(--pad); transition: background-color 0.2s ease; }
            .detail-pager a:hover { background: rgba(255, 255, 255, 0.04); }
            .detail-pager .next { text-align: right; border-left: 1px solid var(--line); }
            .detail-pager .pager-label { font-size: 12px; line-height: 16px; color: var(--text-secondary); margin-bottom: 4px; }
            .detail-pager .pager-title { font-size: 15px; font-weight: 500; color: #fff; overflow-wrap: anywhere; }
          `}</style>

          {/* Title & meta */}
          <div className="frame detail">
            <div style={{ padding: 'var(--pad)' }}>
              <h1>{project.title}</h1>
              <p className="meta">
                {scope.length > 0 && (
                  <>
                    A <strong>{joinList(scope)}</strong> project.{' '}
                  </>
                )}
                {(project.roles?.length > 0 || project.date) &&
                  (project.roles?.length > 0 ? (
                    <>
                      I worked on it as <strong>{joinList(project.roles)}</strong>
                      {project.date && (
                        <>
                          {' '}in <strong>{project.date}</strong>
                        </>
                      )}
                      .{' '}
                    </>
                  ) : (
                    <>
                      Completed in <strong>{project.date}</strong>.{' '}
                    </>
                  ))}
                {project.link && (
                  <>
                    See it live at{' '}
                    <a
                      className="ulink"
                      href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <strong>{project.link.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')}</strong>
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="hatch" />

          {/* Content blocks */}
          <div className="frame detail">
            <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--pad)' }}>
              {project.content_blocks && project.content_blocks.length > 0 ? (
                project.content_blocks.map((block) => (
                  <div key={block.id}>
                    {block.type === 'text' ? (
                      <div>
                        {block.title && <h3>{block.title}</h3>}
                        {block.value.split('\n').filter(l => l.trim().length > 0).map((line, j) => (
                          <p key={j}>{line}</p>
                        ))}
                      </div>
                    ) : block.type === 'image' ? (
                      <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <FitImage className="detail-media" src={block.value} alt="Project visual" sizes={MEDIA_SIZES} />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <FitVideo className="detail-media" src={block.value} />
                      </motion.div>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback for projects that don't have blocks yet (using old fields if available) */
                <>
                  {project.content_body && (
                    <div>
                      {project.content_body.split('\n').filter(l => l.trim().length > 0).map((line, j) => {
                        const isTitle = line.startsWith('#');
                        const cleanText = line.replace(/^#+\s*/, '');
                        return isTitle ? (
                          <h3 key={j} style={{ marginTop: j === 0 ? 0 : '1.5rem' }}>{cleanText}</h3>
                        ) : (
                          <p key={j}>{cleanText}</p>
                        );
                      })}
                    </div>
                  )}
                  {project.cover_image_url && (
                    <FitImage className="detail-media" src={project.cover_image_url} alt={project.title} sizes={MEDIA_SIZES} />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hatch" />

          {/* Previous / next */}
          <div className="frame detail">
            <div className="detail-pager">
              {prevProject ? (
                <Link to={`/works/${prevProject.slug}`}>
                  <div className="pager-label">Previous</div>
                  <div className="pager-title">{prevProject.title}</div>
                </Link>
              ) : (
                <div />
              )}
              {nextProject ? (
                <Link to={`/works/${nextProject.slug}`} className="next">
                  <div className="pager-label">Next</div>
                  <div className="pager-title">{nextProject.title}</div>
                </Link>
              ) : (
                <div className="next" />
              )}
            </div>
          </div>
        </motion.article>
      )}
    </>
  );
}
