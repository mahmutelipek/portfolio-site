import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../lib/types';
import { motion } from 'framer-motion';

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchProject() {
      if (!slug) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (error) {
        console.error('Error fetching project:', error);
      }
      
      if (data) {
        setProject(data);
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
        }
      }
      setLoading(false);
    }
    
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Project not found</h1>
        <Link to="/" style={{ textDecoration: 'underline' }}>Return Home</Link>
      </div>
    );
  }


  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ paddingTop: '120px', minHeight: '100vh', paddingBottom: '8rem', color: '#ffffff' }}
    >
      {/* Title & Meta Info */}
      <section style={{ padding: isMobile ? '0 1rem 4rem' : '0 5rem 4rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 8vw, 6rem)', 
            fontWeight: 500, 
            letterSpacing: '-0.04em', 
            lineHeight: 1, 
            marginBottom: '4rem',
            marginTop: isMobile ? 0 : '4rem',
            color: '#ffffff',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word'
          }}>
            {project.title}
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '2rem' : '3rem', borderTop: '1px solid #333', paddingTop: '2.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Scope</h4>
              <p style={{ fontSize: '1rem', color: '#ffffff' }}>{project.industries || '—'}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Role</h4>
              <p style={{ fontSize: '1rem', color: '#ffffff' }}>{project.roles?.join(', ') || '—'}</p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Date</h4>
              <p style={{ fontSize: '1rem', color: '#ffffff' }}>{project.date || '—'}</p>
            </div>
            {project.link && (
            <div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Website</h4>
              <motion.a 
                href={project.link.startsWith('http') ? project.link : `https://${project.link}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                whileHover={{ opacity: 0.5 }}
                style={{ fontSize: '1rem', color: '#ffffff', textDecoration: 'none', display: 'inline-block' }}
              >
                {project.link.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')}
              </motion.a>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area: Fully Flexible Block-based Layout */}
      <section style={{ padding: isMobile ? '0 1rem' : '0 5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {project.content_blocks && project.content_blocks.length > 0 ? (
            project.content_blocks.map((block) => (
              <div key={block.id}>
                {block.type === 'text' ? (
                  <div style={{ textAlign: 'left', maxWidth: '1280px' }}>
                    {block.title && (
                      <h3 style={{ 
                        fontSize: '24px', 
                        fontWeight: 500, 
                        letterSpacing: '-0.02em', 
                        color: 'white', 
                        marginBottom: '1.25rem',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                      }}>
                        {block.title}
                      </h3>
                    )}
                    {block.value.split('\n').filter(l => l.trim().length > 0).map((line, j) => (
                      <p key={j} style={{ 
                        fontSize: '16px', 
                        lineHeight: 1.6, 
                        color: 'white', 
                        marginBottom: '1rem', 
                        fontWeight: 400, 
                        opacity: 1,
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                      }}>
                        {line}
                      </p>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ width: '100%', aspectRatio: '1280 / 768', backgroundColor: '#0a0a0a', overflow: 'hidden', borderRadius: '4px' }}
                  >
                    <img 
                      src={block.value} 
                      alt="Project visual"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </motion.div>
                )}
              </div>
            ))
          ) : (
            /* Fallback for projects that don't have blocks yet (using old fields if available) */
            <>
              {project.content_body && (
                <div style={{ textAlign: 'left', maxWidth: '1280px' }}>
                  {project.content_body.split('\n').filter(l => l.trim().length > 0).map((line, j) => {
                    const isTitle = line.startsWith('#');
                    const cleanText = line.replace(/^#+\s*/, '');
                    if (isTitle) {
                      return (
                        <h3 key={j} style={{ fontSize: '24px', fontWeight: 500, color: 'white', margin: '2.5rem 0 1.25rem 0', letterSpacing: '-0.02em' }}>
                          {cleanText}
                        </h3>
                      );
                    }
                    return (
                      <p key={j} style={{ 
                        fontSize: '16px', 
                        lineHeight: 1.6, 
                        color: 'white', 
                        opacity: 1, 
                        marginBottom: '1rem',
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word'
                      }}>
                        {cleanText}
                      </p>
                    );
                  })}
                </div>
              )}
              {project.cover_image_url && (
                <div style={{ width: '100%', aspectRatio: '1280 / 768', backgroundColor: '#0a0a0a', overflow: 'hidden', borderRadius: '4px' }}>
                  <img src={project.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </>
          )}
        </div>
        </div>
      </section>

    </motion.article>
  );
}
