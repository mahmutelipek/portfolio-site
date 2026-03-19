import { useEffect, useState } from 'react';
import { AuraHero } from '../components/AuraHero';
import { SelectedWorks } from '../components/SelectedWorks';
import type { Project } from '../lib/types';
import { supabase } from '../lib/supabase';

export function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
