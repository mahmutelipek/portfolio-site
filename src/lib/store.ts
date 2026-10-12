import type { Project, Logo } from './types';

// The home page's last known projects and logos are kept in localStorage, so a returning visitor sees the
// list straight away instead of waiting for Supabase (which can be slow on a cold request). The fresh data
// replaces it as soon as it arrives. Project detail pages are not seeded from this copy: they must never
// show stale content for longer than the home list does.
const CACHE_KEY = 'portfolio:home:v1';

interface HomeCache {
  projects: Project[];
  logos: Logo[];
}

function readHomeCache(): HomeCache | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
    if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.logos)) return null;
    return { projects: parsed.projects, logos: parsed.logos };
  } catch {
    return null;
  }
}

/** Remembers fresh home data for the next visit (silently does nothing where storage is unavailable). */
export function saveHomeCache(part: Partial<HomeCache>) {
  try {
    const current = readHomeCache() ?? { projects: [], logos: [] };
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...current, ...part }));
  } catch {
    // private mode, quota, blocked storage: the site just works without the shortcut
  }
}

const cached = readHomeCache();

export const globalStore = {
  homeVisited: false,
  homeProjects: cached?.projects ?? ([] as Project[]),
  logos: cached?.logos ?? ([] as Logo[]),
  /** True once this page load has fetched the logos itself (as opposed to reading the cached copy). */
  logosFresh: false,
  projectsList: [] as { title: string; slug: string; sort_order: number }[],
  projectDetails: {} as Record<string, Project>,
};
