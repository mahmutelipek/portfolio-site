import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Mail, Layers } from 'lucide-react';
import { XLogo, LinkedInLogo } from '../components/BrandIcons';
import { SelectedWorks } from '../components/SelectedWorks';
import CountUp from '../components/CountUp';
import Lottie from 'lottie-react';
import loadingAnimation from '../../loading.json';
import type { Project } from '../lib/types';
import { supabase } from '../lib/supabase';
import { globalStore } from '../lib/store';
import '../components/Frame.css';

const LINKS = [
  { label: 'X', href: 'https://x.com/mahmutelipk', Icon: XLogo },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahmutelipek', Icon: LinkedInLogo },
  { label: 'Shots', href: 'https://layers.to/mahmutelipek', Icon: Layers },
];

export function Home() {
  const [projects, setProjects] = useState<Project[]>(globalStore.homeProjects);
  const [loading, setLoading] = useState(!globalStore.homeVisited);
  const [showSplash, setShowSplash] = useState(!globalStore.homeVisited);
  const lenis = useLenis();
  const { hash } = useLocation();

  // Scroll to #projects when arriving from another route (e.g. "/#projects")
  useEffect(() => {
    if (hash !== '#projects' || showSplash || loading) return;
    const el = document.getElementById('projects');
    if (el) lenis?.scrollTo(el, { offset: 0 });
  }, [hash, showSplash, loading, lenis]);

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
    async function fetchData() {
      if (globalStore.homeVisited && globalStore.homeProjects.length > 0) {
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .neq('is_visible', false)
        .order('sort_order', { ascending: true });

      if (import.meta.env.DEV && (error || !data || data.length === 0)) {
        const { devProjects } = await import('../lib/devProjects');
        setProjects(devProjects);
        globalStore.homeProjects = devProjects;
      } else if (error) {
        console.error('Error fetching projects:', error);
      } else if (data) {
        setProjects(data as Project[]);
        globalStore.homeProjects = data as Project[];
      } else {
        const dummyProjects: Project[] = [
          {
            id: 'dummy-1',
            title: 'Modern Coffee App',
            slug: 'modern-coffee-app',
            date: '2023 - 2024',
            cover_image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2787&auto=format&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop'
            ],
            content_body: 'A complete redesign... (dummy)',
            roles: ['UX Research', 'UI Design'],
            sort_order: 0
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
            roles: ['UI/UX Design', 'Design Systems'],
            sort_order: 1
          }
        ];
        setProjects(dummyProjects);
        globalStore.homeProjects = dummyProjects;
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // Preload project images in the background while splash screen is active
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(p => {
        if (p.cover_image_url) {
          const img = new Image();
          img.src = p.cover_image_url;
        }
      });
    }
  }, [projects]);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ 
              position: 'relative', 
              width: window.innerWidth < 768 ? '360px' : '512px', 
              height: window.innerWidth < 768 ? '360px' : '512px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              maxWidth: '95vw',
              maxHeight: '95vw'
            }}>
              <Lottie 
                animationData={loadingAnimation} 
                loop={true} 
                style={{ position: 'absolute', inset: 0, zIndex: 1, width: '100%', height: '100%' }} 
              />
              <div style={{ 
                position: 'relative', 
                zIndex: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: window.innerWidth < 768 ? '56px' : '80px', 
                fontWeight: 500, 
                color: '#fff', 
                letterSpacing: '-0.02em', 
                fontVariantNumeric: 'tabular-nums' 
              }}>
                <CountUp to={100} duration={2.5} onEnd={() => { 
                  globalStore.homeVisited = true;
                  setTimeout(() => setShowSplash(false), 500); 
                }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="rails" style={{ paddingTop: '66px' }}>
        {/* Intro */}
        <div className="frame">
          <style>{`
            .intro {
              max-width: 598px;
              font-family: var(--font-mono);
              font-size: 14px;
              line-height: 20px;
              letter-spacing: -0.09px;
              color: #d4d4d4;
            }
            .intro h1 { font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: -0.09px; color: #fff; }
            .intro .role { color: #a1a1a1; margin-bottom: 24px; }
            .intro p { margin: 0; font-size: inherit; }
            .intro p + p { margin-top: 14px; }
            .intro strong { font-weight: 550; color: #fff; }
            .pill {
              display: inline-flex; align-items: center; gap: 5px;
              padding: 3px 8px; border-radius: 999px;
              background: rgba(255, 255, 255, 0.08);
              color: #fff; font-size: 12.5px; font-weight: 500; line-height: 14px; letter-spacing: -0.09px;
              vertical-align: baseline;
              transition: background-color 0.2s ease;
            }
            .pill:hover { background: rgba(255, 255, 255, 0.16); }
          `}</style>
          <div className="intro" style={{ padding: '2.5rem 1.5rem' }}>
            <h1>Mahmut Elipek</h1>
            <p className="role">Product Designer</p>

            <p>
              I'm a <strong>product designer</strong> with 5 years of experience taking web and mobile products
              from idea to production.
            </p>
            <p>
              I work hands-on across product thinking, <strong>UX/UI</strong>, <strong>design systems</strong>,
              prototyping, and implementation. I'm most comfortable when the problem isn't fully defined yet and
              design needs both product thinking and technical understanding.
            </p>
            <p>
              I've built products from zero to one, worked as a sole designer, led design teams and client
              projects, and collaborated closely with engineering through production.
            </p>
            <p>
              Currently, I design product and UI for <strong>Flowla</strong> and independently build{' '}
              <strong>Skaplo</strong>, a live subscription product I design and develop with AI-assisted workflows.
            </p>
            <p>My focus is simple: understand the problem, find the right solution, and get it shipped.</p>
            <p>
              You can find me on{' '}
              {LINKS.map(({ label, href, Icon }, i) => (
                <span key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="pill">
                    <Icon size={12} />
                    {label}
                  </a>
                  {i < LINKS.length - 2 ? ', ' : i === LINKS.length - 2 ? ', and ' : '.'}
                </span>
              ))}
            </p>
            <p>
              Or reach me via{' '}
              <a href="mailto:mahmutelipk@gmail.com" className="pill">
                <Mail size={12} />
                Email
              </a>
            </p>
          </div>
        </div>

        <div className="hatch" />

        {!loading && projects.length > 0 && <SelectedWorks projects={projects} />}
        {!loading && projects.length === 0 && (
          <section style={{ padding: '4rem 2rem', textAlign: 'center', color: '#666' }}>
            <p>No projects found. Please add data to Supabase.</p>
          </section>
        )}
      </main>
    </>
  );
}
