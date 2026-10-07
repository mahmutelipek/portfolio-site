import { useEffect, useState, type CSSProperties, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Mail, Layers } from 'lucide-react';
import { XLogo, LinkedInLogo } from '../components/BrandIcons';
import { SelectedWorks } from '../components/SelectedWorks';
import CountUp from '../components/CountUp';
import type { Project } from '../lib/types';
import { supabase } from '../lib/supabase';
import { globalStore } from '../lib/store';
import '../components/Frame.css';

import { glassOverlayStyle } from '../lib/glass';
import { useDocumentTitle, HOME_TITLE } from '../lib/useDocumentTitle';
const SplashLottie = lazy(() => import('../components/SplashLottie'));

// Set a URL to turn a name in the intro into a link; leave empty for plain text.
const PRODUCT_URLS = {
  flowla: 'https://www.flowla.com',
  skaplo: 'https://skaplo.com',
};

function ProductName({ name, url }: { name: string; url: string }) {
  if (!url) return <strong>{name}</strong>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="ulink">
      <strong>{name}</strong>
    </a>
  );
}

// `color` tints each pill and its icon.
const LINKS = [
  { label: 'X', href: 'https://x.com/mahmutelipk', Icon: XLogo, color: '#e7e9ea' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/mahmutelipek', Icon: LinkedInLogo, color: '#3b8fe0' },
  { label: 'Shots', href: 'https://layers.to/mahmutelipek', Icon: Layers, color: '#b794f6' },
];
const EMAIL_COLOR = '#ff6b5e';

export function Home() {
  useDocumentTitle(HOME_TITLE);
  const [projects, setProjects] = useState<Project[]>(globalStore.homeProjects);
  const [loading, setLoading] = useState(!globalStore.homeVisited);
  const [showSplash, setShowSplash] = useState(!globalStore.homeVisited);
  const lenis = useLenis();
  const { hash } = useLocation();

  // Scroll to #projects when arriving from another route (e.g. "/#projects")
  useEffect(() => {
    if (hash !== '#projects' || showSplash || loading) return;
    const el = document.getElementById('projects');
    if (el) lenis?.scrollTo(el, { offset: -66 });
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
              width: window.innerWidth < 768 ? '220px' : '300px', 
              height: window.innerWidth < 768 ? '220px' : '300px', 
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
                fontSize: window.innerWidth < 768 ? '34px' : '48px', 
                fontWeight: 500, 
                color: '#fff', 
                letterSpacing: '-0.02em', 
                fontVariantNumeric: 'tabular-nums' 
              }}>
                <CountUp to={100} duration={1.3} onEnd={() => { 
                  globalStore.homeVisited = true;
                  setTimeout(() => setShowSplash(false), 150); 
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
              font-family: var(--font-mono);
              font-size: 14px;
              line-height: 20px;
              letter-spacing: -0.09px;
              color: #d4d4d4;
            }
            .intro h1 { font-size: 14px; line-height: 20px; font-weight: 500; letter-spacing: -0.09px; color: #fff; }
            .intro .role { color: #a1a1a1; margin-bottom: 24px; }
            .intro p { margin: 0; font-size: inherit; }
            @media (max-width: 740px) {
              .intro { font-size: 15px; line-height: 23px; }
              .intro h1, .intro .role { font-size: 15px; line-height: 23px; }
            }
            .intro p + p { margin-top: 14px; }
            .intro strong { font-weight: 550; color: #fff; }
          `}</style>
          <div className="intro" style={{ padding: 'var(--pad)' }}>
            <h1>Mahmut Elipek</h1>
            <p className="role">Product Designer &amp; Design Engineer</p>

            <p>
              I'm a <strong>product designer</strong> and <strong>design engineer</strong> with 5 years of experience
              taking web and mobile products from idea to production. I work hands-on across product thinking,{' '}
              <strong>UX/UI</strong>, <strong>design systems</strong>, prototyping, and implementation, and I design
              with <strong>AI-based</strong> workflows. I'm most comfortable when the problem isn't fully defined yet.
            </p>
            <p>
              I've built products from zero to one, worked as a sole designer, and led design teams and client
              projects. Currently, I design product and UI for{' '}
              <ProductName name="Flowla" url={PRODUCT_URLS.flowla} /> and independently build{' '}
              <ProductName name="Skaplo" url={PRODUCT_URLS.skaplo} />, a live subscription product I design and
              develop with AI-assisted workflows. I'm also working on <strong>two games</strong>, coming soon to <strong>Steam</strong>.
            </p>
            <p>My focus is simple: understand the problem, find the right solution, and get it shipped.</p>
            <p>
              You can find me on{' '}
              {LINKS.map(({ label, href, Icon, color }, i) => (
                <span key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="pill" style={{ '--pill': color } as CSSProperties}>
                    <Icon size={12} />
                    {label}
                  </a>
                  {i < LINKS.length - 2 ? ', ' : i === LINKS.length - 2 ? ', and ' : '.'}
                </span>
              ))}
            </p>
            <p>
              Or reach me via{' '}
              <a href="mailto:mahmutelipk@gmail.com" className="pill" style={{ '--pill': EMAIL_COLOR } as CSSProperties}>
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
