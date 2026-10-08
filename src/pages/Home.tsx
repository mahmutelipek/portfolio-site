import { useEffect, useState, type CSSProperties, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Mail, Layers } from 'lucide-react';
import { XLogo, LinkedInLogo } from '../components/BrandIcons';
import { SelectedWorks } from '../components/SelectedWorks';
import { LogoMarquee } from '../components/LogoMarquee';
import CountUp from '../components/CountUp';
import type { Project, Logo } from '../lib/types';
import { supabase } from '../lib/supabase';
import { globalStore } from '../lib/store';
import '../components/Frame.css';

import { glassOverlayStyle } from '../lib/glass';
import { usePageMeta, HOME_TITLE, HOME_DESCRIPTION } from '../lib/useDocumentTitle';
import { whenIdle } from '../lib/idle';
const SplashLottie = lazy(() => import('../components/SplashLottie'));
const loadCover = () => import('../components/AsciiCover');
const AsciiCover = lazy(loadCover);

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
  usePageMeta({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: '/' });
  const [projects, setProjects] = useState<Project[]>(globalStore.homeProjects);
  const [logos, setLogos] = useState<Logo[]>(globalStore.logos);
  const [loading, setLoading] = useState(!globalStore.homeVisited);
  const [showSplash, setShowSplash] = useState(() => !globalStore.homeVisited);
  // The cover's one-off setup is heavy, so it is prepared behind the splash (as soon as the page is
  // idle) and is already there when the splash lifts. Without a splash it starts straight away.
  const [coverReady, setCoverReady] = useState(() => globalStore.homeVisited);
  const lenis = useLenis();
  const { hash } = useLocation();

  useEffect(() => {
    void loadCover();
    return whenIdle(() => setCoverReady(true), 800);
  }, []);

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
    if (globalStore.logos.length > 0) return;
    supabase
      .from('logos')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        globalStore.logos = data as Logo[];
        setLogos(data as Logo[]);
      });
  }, []);

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
        for (const p of devProjects) globalStore.projectDetails[p.slug] ??= p;
      } else if (error) {
        console.error('Error fetching projects:', error);
      } else if (data) {
        setProjects(data as Project[]);
        globalStore.homeProjects = data as Project[];
        // These are full rows, so project pages can open without another request.
        for (const p of data as Project[]) globalStore.projectDetails[p.slug] ??= p;
      }

      globalStore.homeVisited = true;
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
        {/* Cover (loads after the first paint; the box is reserved so nothing jumps) */}
        <div className="frame" style={{ padding: 'var(--pad)' }}>
          {coverReady ? (
            <Suspense fallback={<div className="ascii-cover" />}>
              <AsciiCover />
            </Suspense>
          ) : (
            <div className="ascii-cover" />
          )}
        </div>
        <div className="hatch" />

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

        <LogoMarquee logos={logos} />
        {logos.length > 0 && <div className="hatch" />}

        {/* Keeps the footer below the fold until the projects arrive, so it does not jump */}
        {loading && <div aria-hidden style={{ minHeight: '100vh' }} />}
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
