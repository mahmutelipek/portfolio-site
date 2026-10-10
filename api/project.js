// Serves /works/:slug (see the rewrite in vercel.json). Link-preview robots (LinkedIn, X, WhatsApp,
// Facebook...) do not run JavaScript, so the per-project title, description and share image have to be
// in the HTML they download. This takes the built index.html and swaps those tags for the project's.
// Browsers get the same page and the app starts as usual. Any failure falls back to the plain page.
const SITE = 'https://www.mahmutelipek.com';
const SITE_NAME = 'Mahmut Elipek';
const SLUG = /^[A-Za-z0-9._~-]{1,100}$/;
const HOST = /^(www\.)?mahmutelipek\.com$|^[a-z0-9-]+\.vercel\.app$/;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** One or two sentences for the description, taken from the project's first text (same rule as the page). */
export function describe(project) {
  const blocks = Array.isArray(project.content_blocks) ? project.content_blocks : [];
  const first = blocks.find(b => b && b.type === 'text' && typeof b.value === 'string' && b.value.trim());
  const raw = ((first && first.value) || project.content_body || '').replace(/^#+\s*.*$/gm, ' ').replace(/\s+/g, ' ').trim();
  const roles = Array.isArray(project.roles) ? project.roles.join(', ') : '';
  if (!raw) return `${project.title}: ${roles || 'a project'} by ${SITE_NAME}.`;
  if (raw.length <= 155) return raw;
  const cut = raw.slice(0, 155);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 100))}…`;
}

/** Absolute address of the project's share image, or null to keep the site-wide one. */
export function shareImage(project) {
  const cover = project.cover_image_url;
  if (!cover) return null;
  const local = /^\/covers\/([\w-]+)\.webp$/.exec(cover);
  if (local) return { url: `${SITE}/covers/${local[1]}-og.jpg?v=2`, type: 'image/jpeg', sized: true };
  if (cover.startsWith('/')) return { url: `${SITE}${cover}`, type: null, sized: false };
  if (cover.includes('/storage/v1/object/public/') && !/\.(svg|gif)(\?|$)/i.test(cover)) {
    return { url: `${cover.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')}?width=1200&quality=80&resize=contain`, type: null, sized: false };
  }
  return { url: cover, type: null, sized: false };
}

function setMeta(html, attr, name, content) {
  const re = new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`, 'g');
  return html.replace(re, (_m, a, b) => `${a}${esc(content)}${b}`);
}

export function buildHtml(shell, project, slug) {
  const title = `${project.title} | ${SITE_NAME}`;
  const description = describe(project);
  const url = `${SITE}/works/${slug}`;
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  for (const [attr, name] of [['name', 'title'], ['itemprop', 'name'], ['property', 'og:title'], ['name', 'twitter:title'], ['property', 'twitter:title']]) {
    html = setMeta(html, attr, name, title);
  }
  for (const [attr, name] of [['name', 'description'], ['itemprop', 'description'], ['property', 'og:description'], ['name', 'twitter:description'], ['property', 'twitter:description']]) {
    html = setMeta(html, attr, name, description);
  }
  for (const [attr, name] of [['property', 'og:url'], ['name', 'twitter:url'], ['property', 'twitter:url']]) {
    html = setMeta(html, attr, name, url);
  }
  const alt = `${project.title}, a project by ${SITE_NAME}`;
  html = setMeta(html, 'property', 'og:image:alt', alt);
  html = setMeta(html, 'name', 'twitter:image:alt', alt);
  const image = shareImage(project);
  if (image) {
    for (const [attr, name] of [['itemprop', 'image'], ['property', 'og:image'], ['property', 'og:image:secure_url'], ['name', 'twitter:image'], ['property', 'twitter:image']]) {
      html = setMeta(html, attr, name, image.url);
    }
    if (image.type) html = setMeta(html, 'property', 'og:image:type', image.type);
    else html = html.replace(/\s*<meta property="og:image:type" content="[^"]*" \/>/, '');
    if (!image.sized) html = html.replace(/\s*<meta property="og:image:(width|height)" content="\d+" \/>/g, '');
  }
  return html;
}

async function loadShell(req) {
  const forwarded = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
  const origin = HOST.test(forwarded) ? `https://${forwarded}` : SITE;
  const res = await fetch(`${origin}/index.html`);
  if (!res.ok) throw new Error(`shell ${res.status}`);
  return res.text();
}

async function loadProject(slug) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const query = `select=title,slug,cover_image_url,content_blocks,content_body,roles&slug=eq.${encodeURIComponent(slug)}&is_visible=neq.false&limit=1`;
  const res = await fetch(`${url}/rest/v1/projects?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] && rows[0].title ? rows[0] : null;
}

export default async function handler(req, res) {
  let shell;
  try {
    shell = await loadShell(req);
  } catch {
    res.status(502).send('Temporarily unavailable');
    return;
  }
  const slug = String(req.query.slug || '');
  let html = shell;
  let found = false;
  if (SLUG.test(slug)) {
    try {
      const project = await loadProject(slug);
      if (project) {
        html = buildHtml(shell, project, slug);
        found = true;
      }
    } catch {
      // keep the plain page
    }
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', found ? 'public, s-maxage=600, stale-while-revalidate=86400' : 'public, s-maxage=60');
  res.status(200).send(html);
}
