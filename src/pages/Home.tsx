import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { ArrowUpRight } from 'lucide-react';
import { SelectedWorks } from '../components/SelectedWorks';
import CountUp from '../components/CountUp';
import Lottie from 'lottie-react';
import loadingAnimation from '../../loading.json';
import type { Project } from '../lib/types';
import { supabase } from '../lib/supabase';
import { globalStore } from '../lib/store';
import '../components/Frame.css';

const ABOUT = [
  'Product & Experience Designer focused on clarity and systems.',
  'End-to-end product design: research, UX, UI and design systems.',
  'I also work with motion and WebGL to make interfaces feel alive.',
];

const CONNECT = [
  { label: 'X (Twitter)', short: 'X', href: 'https://x.com/mahmutelipk' },
  { label: 'LinkedIn', short: 'in', href: 'https://www.linkedin.com/in/mahmutelipek' },
  { label: 'Shots', short: 'S', href: 'https://layers.to/mahmutelipek' },
  { label: 'Email', short: '@', href: 'mailto:mahmutelipk@gmail.com' },
];

export function Home() {
  const [projects, setProjects] = useState<Project[]>(globalStore.homeProjects);
  const [loading, setLoading] = useState(!globalStore.homeVisited);
  const [showSplash, setShowSplash] = useState(!globalStore.homeVisited);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(globalStore.avatarUrl);
  const lenis = useLenis();
  const { hash } = useLocation();

  useEffect(() => {
    if (globalStore.avatarUrl) return;
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'avatar_url')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          globalStore.avatarUrl = data.value;
          setAvatarUrl(data.value);
        }
      });
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
        {/* Profile */}
        <div className="frame">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: 96,
                height: 96,
                flexShrink: 0,
                padding: 4,
                border: '1px solid var(--line)',
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Mahmut Elipek" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: 10, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 600 }}>
                  M
                </div>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 500, letterSpacing: '-0.02em' }}>Mahmut Elipek</h1>
              <p style={{ marginTop: '0.35rem', color: 'var(--text-secondary)' }}>Product & Experience Designer.</p>
            </div>
          </div>
        </div>

        <div className="hatch" />

        {/* About */}
        <div className="frame">
          <h2 className="section-title">About</h2>
          <ul className="rule-top" style={{ padding: '1.75rem 1.5rem 2rem 2.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.6 }}>
            {ABOUT.map(line => <li key={line}>{line}</li>)}
          </ul>
        </div>

        <div className="hatch" />

        {/* Connect */}
        <div className="frame">
          <h2 className="section-title">Connect</h2>
          <div className="rule-top connect-grid">
            <style>{`
              .connect-grid { display: grid; grid-template-columns: repeat(2, 1fr); }
              .connect-item {
                display: flex; align-items: center; gap: 0.9rem;
                padding: 1rem 1.25rem; font-size: 14px;
                border-right: 1px solid var(--line);
                border-bottom: 1px solid var(--line);
                transition: background-color 0.2s ease;
              }
              .connect-item:nth-child(2n) { border-right: none; }
              .connect-item:nth-last-child(-n + 2) { border-bottom: none; }
              .connect-item:hover { background: rgba(255, 255, 255, 0.04); }
              .connect-icon {
                width: 32px; height: 32px; flex-shrink: 0;
                display: flex; align-items: center; justify-content: center;
                border: 1px solid var(--line); border-radius: 8px;
                background: #0d0d0d; font-size: 13px; font-weight: 600;
              }
            `}</style>
            {CONNECT.map(c => (
              <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="connect-item">
                <span className="connect-icon">{c.short}</span>
                <span style={{ flex: 1 }}>{c.label}</span>
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>
            ))}
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
