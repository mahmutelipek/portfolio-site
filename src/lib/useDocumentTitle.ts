import { useEffect } from 'react';

export const SITE_NAME = 'Mahmut Elipek';
export const SITE_URL = 'https://www.mahmutelipek.com';
export const HOME_TITLE = `${SITE_NAME} | Product Designer & Design Engineer`;
export const HOME_DESCRIPTION =
  'Product designer and design engineer with 5 years of experience taking web and mobile products from idea to production.';

export interface PageMeta {
  title?: string;
  description?: string;
  /** Absolute URL of the share image (Open Graph / Twitter). */
  image?: string;
  /** Path of this page, e.g. "/works/norma". Used for the canonical and og:url. */
  path?: string;
  /** Keep this page out of search results. */
  noindex?: boolean;
}

type Tag = HTMLMetaElement | HTMLLinkElement;

const SELECTORS = {
  title: 'meta[name="title"], meta[itemprop="name"], meta[property="og:title"], meta[name="twitter:title"], meta[property="twitter:title"]',
  description:
    'meta[name="description"], meta[itemprop="description"], meta[property="og:description"], meta[name="twitter:description"], meta[property="twitter:description"]',
  image:
    'meta[itemprop="image"], meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"], meta[property="twitter:image"]',
  url: 'meta[property="og:url"], meta[name="twitter:url"], meta[property="twitter:url"]',
  canonical: 'link[rel="canonical"]',
  robots: 'meta[name="robots"]',
} as const;

/** Sets an attribute on every matching tag and returns a function that restores the old values. */
function setTags(selector: string, attr: 'content' | 'href', value: string): () => void {
  const tags = Array.from(document.head.querySelectorAll<Tag>(selector));
  const previous = tags.map(t => t.getAttribute(attr));
  tags.forEach(t => t.setAttribute(attr, value));
  return () => tags.forEach((t, i) => (previous[i] === null ? t.removeAttribute(attr) : t.setAttribute(attr, previous[i]!)));
}

/**
 * Updates the tab title and the SEO / social tags for the calling page and puts the
 * previous values back when it unmounts. Undefined fields are left alone.
 */
export function usePageMeta({ title, description, image, path, noindex }: PageMeta) {
  useEffect(() => {
    const restores: Array<() => void> = [];
    if (title) {
      const previousTitle = document.title;
      document.title = title;
      restores.push(() => (document.title = previousTitle), setTags(SELECTORS.title, 'content', title));
    }
    if (description) restores.push(setTags(SELECTORS.description, 'content', description));
    if (image) restores.push(setTags(SELECTORS.image, 'content', image));
    if (path !== undefined) {
      const url = `${SITE_URL}${path}`;
      restores.push(setTags(SELECTORS.url, 'content', url), setTags(SELECTORS.canonical, 'href', url));
    }
    if (noindex) restores.push(setTags(SELECTORS.robots, 'content', 'noindex, nofollow'));
    return () => restores.forEach(r => r());
  }, [title, description, image, path, noindex]);
}

/** Title-only shortcut kept for simple pages. */
export function useDocumentTitle(title?: string) {
  usePageMeta({ title });
}
