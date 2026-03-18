import { useEffect, useState } from 'react';
import { AuraHero } from '../components/AuraHero';
import { SelectedWorks } from '../components/SelectedWorks';
import DomeGallery from '../components/DomeGallery';
import type { Project, Logo } from '../lib/types';
import { supabase } from '../lib/supabase';

export function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch Projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order', { ascending: true });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      if (!projectsError && projectsData && projectsData.length > 0) {
        setProjects(projectsData);
      } else {
        // Fallback dummy data
        setProjects([
          {
            id: 'dummy-1',
            title: 'Modern Coffee App',
            slug: 'modern-coffee-app',
            client: 'Brew Culture Co.',
            date: '2025-01-10',
            cover_image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2787&auto=format&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2671&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2670&auto=format&fit=crop'
            ],
            content_body: '### Overview\nA complete redesign of the mobile ordering experience for specialty coffee lovers.\n\n### Challenge\nThe previous app suffered from low conversion rates due to a confusing, multi-step checkout process and low-quality imagery.\n\n### Solution\nFocused on extreme minimalism, prioritizing high-resolution product imagery and seamless one-touch ordering mechanics. We utilized a strict monochromatic palette to let the coffee photography stand out.\n\n### Results\nIncreased mobile organic orders by 32% and reduced average checkout time from 45 seconds to just 12 seconds.',
            roles: ['Product Design', 'UX Research', 'Prototyping'],
            sort_order: 0
          },
          {
            id: 'dummy-2',
            title: 'Banking Dashboard',
            slug: 'banking-dashboard',
            client: 'FinTech Startup',
            date: '2024-10-22',
            cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
            gallery: [
              'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'
            ],
            content_body: '### Overview\nDesigning a clear, high-contrast dashboard for complex and high-frequency financial data.\n\n### Challenge\nInstitutional traders were overwhelmed by cluttered interfaces that lacked visual hierarchy, leading to slower decision-making and increased cognitive load during peak hours.\n\n### Solution\nUtilized strict 8pt grid systems, modular card layouts, and monospaced typography to drastically enhance data legibility. We implemented dynamic color coding for instantaneous trend recognition.\n\n### Results\nImproved user workflow efficiency scores by 40% in beta testing, with traders reporting a significantly lower fatigue rate over standard 8-hour sessions.',
            roles: ['UI/UX Design', 'Design Systems'],
            sort_order: 1
          }
        ]);
      }

      // Fetch Logos
      const { data: logosData, error: logosError } = await supabase
        .from('logos')
        .select('*')
        .order('sort_order', { ascending: true });

      if (logosError) {
        console.error('Error fetching logos:', logosError);
      }

      if (!logosError && logosData && logosData.length > 0) {
        setLogos(logosData);
      } else {
        // Fallback dummy logos
        setLogos([
          { id: 'l1', url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", name: 'Amazon', website_url: 'https://amazon.com' },
          { id: 'l2', url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", name: 'Google', website_url: 'https://google.com' },
          { id: 'l3', url: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", name: 'Microsoft', website_url: 'https://microsoft.com' },
          { id: 'l4', url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", name: 'Meta', website_url: 'https://meta.com' },
          { id: 'l5', url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", name: 'Apple', website_url: 'https://apple.com' },
          { id: 'l6', url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", name: 'Netflix', website_url: 'https://netflix.com' }
        ]);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <main>
      <AuraHero />
      {!loading && projects.length > 0 && (
        <>
          <SelectedWorks projects={projects} />
          <section id="teams" style={{ paddingTop: isMobile ? '64px' : '8rem', paddingBottom: '8rem', background: '#000000', overflowX: 'hidden' }}>
            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem' }}>
              <h2 style={{
                marginBottom: '40px',
                fontSize: '22px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}>
                and more...
              </h2>
            </div>
            <DomeGallery images={logos.map(l => ({ src: l.url, alt: l.name, link: l.website_url }))} />
          </section>
        </>
      )}
      {!loading && projects.length === 0 && (
        <section style={{ padding: '8rem 2rem', textAlign: 'center', color: '#666' }}>
          <p>No projects found. Please add data to Supabase.</p>
        </section>
      )}
    </main>
  );
}
