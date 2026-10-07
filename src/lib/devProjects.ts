import type { Project } from './types';

// Dev-only sample data so the homepage can be previewed without Supabase.
const cover = (from: string, to: string) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
  );

export const devProjects: Project[] = [
  { id: 'dev-1', title: 'Frink', slug: 'frink', date: '2025', cover_image_url: cover('#3b2a1a', '#c8894a'), roles: ['UX Research', 'UI Design'], sort_order: 0 },
  { id: 'dev-2', title: 'Norm Banking', slug: 'norm', date: '2025', cover_image_url: cover('#0f2a3a', '#2f80ed'), roles: ['Product Design', 'Design Systems'], sort_order: 1 },
  { id: 'dev-3', title: 'Elva Face Yoga', slug: 'elva', date: '2024', cover_image_url: cover('#3a1a2e', '#e056a0'), roles: ['Mobile App', 'Branding'], sort_order: 2 },
  { id: 'dev-4', title: 'Humble Studio', slug: 'humble', date: '2024', cover_image_url: cover('#12301f', '#3ecf8e'), roles: ['Web Design', 'Motion'], sort_order: 3 },
  { id: 'dev-5', title: 'Firecrawl Launch', slug: 'firecrawl', date: '2024', cover_image_url: cover('#3a1508', '#ff6a3d'), roles: ['WebGL', 'Campaign'], sort_order: 4 },
  { id: 'dev-6', title: 'City Hospital', slug: 'hospital', date: '2023', cover_image_url: cover('#102a30', '#38bdf8'), roles: ['CMS', 'UI Design'], sort_order: 5 },
];
