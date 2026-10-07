// Serves /sitemap.xml (see the rewrite in vercel.json). Reads the visible project slugs from
// Supabase at request time, so new projects show up without a redeploy. If Supabase is
// unreachable it still returns a valid sitemap with the homepage.
const SITE = 'https://www.mahmutelipek.com';

async function fetchSlugs() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const res = await fetch(`${url}/rest/v1/projects?select=slug&is_visible=neq.false&order=sort_order.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.map(r => r.slug).filter(s => typeof s === 'string' && /^[A-Za-z0-9._~-]+$/.test(s));
}

export function buildSitemap(slugs) {
  const urls = [`${SITE}/`, ...slugs.map(s => `${SITE}/works/${s}`)];
  const body = urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export default async function handler(_req, res) {
  let slugs = [];
  try {
    slugs = await fetchSlugs();
  } catch {
    // fall back to the homepage only
  }
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(buildSitemap(slugs));
}
