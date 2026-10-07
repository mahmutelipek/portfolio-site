import { useEffect, useState, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project } from '../lib/types';
import { globalStore } from '../lib/store';
import '../components/Frame.css';
import { FitImage, FitVideo, COLUMN_SIZES } from '../components/FitMedia';

import { motion } from 'framer-motion';
import { usePageMeta, SITE_NAME } from '../lib/useDocumentTitle';
import { shareImage } from '../lib/image';

function splitList(value?: string): string[] {
  return (value ?? '').split(',').map(v => v.trim()).filter(Boolean);
}

/** One or two sentences for the meta description, taken from the project's first text. */
function describeProject(project: Project): string {
  const firstText = project.content_blocks?.find(b => b.type === 'text' && b.value?.trim())?.value;
  const raw = (firstText ?? project.content_body ?? '').replace(/^#+\s*.*$/gm, ' ').replace(/\s+/g, ' ').trim();
  const fallback = `${project.title}: ${project.roles?.join(', ') || 'a project'} by ${SITE_NAME}.`;
  if (!raw) return fallback;
  if (raw.length <= 155) return raw;
  const cut = raw.slice(0, 155);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 100))}…`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const MEDIA_SIZES = COLUMN_SIZES;
/** Media blocks this far down the page load right away; later ones load as you scroll. */
const EAGER_MEDIA = 3;

/** Full-page notice (loading / not found) in the same framed layout as the rest of the site. */
function PageMessage({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rails" style={{ paddingTop: '66px', flex: '1 0 auto' }}>
      <style>{`
        .page-message { font-size: 14px; line-height: 22px; letter-spacing: -0.09px; color: #d4d4d4; }
        .page-message h1 { font-size: clamp(1.5rem, 5vw, 1.75rem); line-height: 1.15; font-weight: 500; letter-spacing: -0.02em; color: #fff; margin-bottom: 0.5rem; }
        .page-message p { margin: 0; font-size: inherit; }
        .page-message p + p { margin-top: 0.75rem; }
        .page-message strong { font-weight: 550; color: #fff; }
        .page-message .muted { color: var(--text-secondary); }
        @media (max-width: 740px) { .page-message { font-size: 15px; line-height: 23px; } }
      `}</style>
      <div className="frame page-message">
        <div style={{ padding: 'var(--pad)' }}>
          {title && <h1>{title}</h1>}
          {children}
        </div>
      </div>
      <div className="hatch" />
    </section>
  );
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const isCached = slug ? !!globalStore.projectDetails[slug] : false;
  const [project, setProject] = useState<Project | null>(slug ? globalStore.projectDetails[slug] || null : null);
  const [loading, setLoading] = useState(!isCached);
  const [prevProject, setPrevProject] = useState<{title: string, slug: string} | null>(null);
  const [nextProject, setNextProject] = useState<{title: string, slug: string} | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!slug) return;
    const cached = !!globalStore.projectDetails[slug];
    setLoading(!cached);
    if (cached) {
      setProject(globalStore.projectDetails[slug]);
    }
  }, [slug]);

  useEffect(() => {
    async function initNavigation() {
      if (!slug) return;
      let list = globalStore.projectsList;

      if (!list || list.length === 0) {
        const { data } = await supabase
          .from('projects')
          .select('title, slug, sort_order')
          .neq('is_visible', false)
          .order('sort_order', { ascending: true });

        if (data) {
          list = data as any;
          globalStore.projectsList = data as any;
        }
      }

      if (list && list.length > 0) {
        const currentIndex = list.findIndex(p => p.slug === slug);
        if (currentIndex !== -1) {
          setPrevProject(currentIndex > 0 ? list[currentIndex - 1] : null);
          setNextProject(currentIndex < list.length - 1 ? list[currentIndex + 1] : null);
        } else {
          setPrevProject(null);
          setNextProject(null);
        }
      }
    }
    initNavigation();
  }, [slug]);

  useEffect(() => {
    async function fetchProject() {
      if (!slug || globalStore.projectDetails[slug]) return;
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .neq('is_visible', false)
        .single();
        
      if (error) {
        console.error('Error fetching project:', error);
      }
      
      if (data) {
        setProject(data as Project);
        globalStore.projectDetails[slug] = data as Project;
      }
      setLoading(false);
    }
    
    fetchProject();
  }, [slug]);

  const scope = splitList(project?.industries);
  const eagerImages = new Set(
    (project?.content_blocks ?? []).filter(b => b.type === 'image').slice(0, EAGER_MEDIA).map(b => b.id)
  );

  const notFound = !project && !loading;
  usePageMeta(
    project
      ? {
          title: `${project.title} | ${SITE_NAME}`,
          description: describeProject(project),
          image: project.cover_image_url ? shareImage(project.cover_image_url) : undefined,
          path: `/works/${project.slug}`,
        }
      : notFound
        ? { title: `Project not found | ${SITE_NAME}`, noindex: true }
        : {},
  );

  if (loading) {
    return (
      <PageMessage>
        <p className="muted">Loading…</p>
      </PageMessage>
    );
  }

  if (!project && !loading) {
    return (
      <PageMessage title="Project not found">
        <p>This project doesn't exist or has been removed.</p>
        <p>
          <Link to="/#projects" className="ulink">
            <strong>See all projects</strong>
          </Link>
        </p>
      </PageMessage>
    );
  }

  return (
    <>
      {(project && !loading) && (
        <motion.article
          className="rails"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ paddingTop: '66px', minHeight: '100vh', color: '#ffffff' }}
        >
          <style>{`
            .detail { font-size: 14px; line-height: 22px; letter-spacing: -0.09px; color: #d4d4d4; }
            .detail h1 { font-size: clamp(1.5rem, 5vw, 1.75rem); line-height: 1.15; font-weight: 500; letter-spacing: -0.02em; color: #fff; overflow-wrap: anywhere; }
            .detail h3 { font-size: 15px; line-height: 22px; font-weight: 600; color: #fff; margin-bottom: 0.5rem; overflow-wrap: anywhere; }
            .detail p { font-size: inherit; margin: 0; overflow-wrap: anywhere; }
            .detail p + p { margin-top: 0.75rem; }
            .detail .meta { margin-top: 0.5rem; }
            .detail strong { font-weight: 550; color: #fff; }
            .detail-media { width: 100%; background: #0a0a0a; overflow: hidden; border-radius: 12px; }
            .detail-pager { display: grid; grid-template-columns: 1fr 1fr; }
            .detail-pager a { display: block; padding: var(--pad); transition: background-color 0.2s ease; }
            .detail-pager a:hover { background: rgba(255, 255, 255, 0.04); }
            .detail-pager .next { text-align: right; border-left: 1px solid var(--line); }
            .detail-pager .pager-label { font-size: 12px; line-height: 16px; color: var(--text-secondary); margin-bottom: 4px; }
            .detail-pager .pager-title { font-size: 15px; font-weight: 500; color: #fff; overflow-wrap: anywhere; }
            @media (max-width: 740px) {
              .detail { font-size: 15px; line-height: 23px; }
              .detail h3 { line-height: 23px; }
              .detail-pager .pager-label { font-size: 13px; }
            }
          `}</style>

          {/* Title & meta */}
          <div className="frame detail">
            <div style={{ padding: 'var(--pad)' }}>
              <h1>{project.title}</h1>
              <p className="meta">
                {scope.length > 0 && (
                  <>
                    A <strong>{joinList(scope)}</strong> project.{' '}
                  </>
                )}
                {(project.roles?.length > 0 || project.date) &&
                  (project.roles?.length > 0 ? (
                    <>
                      I worked on it as <strong>{joinList(project.roles)}</strong>
                      {project.date && (
                        <>
                          {' '}in <strong>{project.date}</strong>
                        </>
                      )}
                      .{' '}
                    </>
                  ) : (
                    <>
                      Completed in <strong>{project.date}</strong>.{' '}
                    </>
                  ))}
                {project.link && (
                  <>
                    See it live at{' '}
                    <a
                      className="ulink"
                      href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <strong>{project.link.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')}</strong>
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="hatch" />

          {/* Content blocks */}
          <div className="frame detail">
            <div style={{ padding: 'var(--pad)', display: 'flex', flexDirection: 'column', gap: 'var(--pad)' }}>
              {project.content_blocks && project.content_blocks.length > 0 ? (
                project.content_blocks.map((block) => (
                  <div key={block.id}>
                    {block.type === 'text' ? (
                      <div>
                        {block.title && <h3>{block.title}</h3>}
                        {block.value.split('\n').filter(l => l.trim().length > 0).map((line, j) => (
                          <p key={j}>{line}</p>
                        ))}
                      </div>
                    ) : block.type === 'image' ? (
                      <motion.div
                        initial={eagerImages.has(block.id) ? false : { y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <FitImage
                          className="detail-media"
                          src={block.value}
                          alt="Project visual"
                          sizes={MEDIA_SIZES}
                          priority={eagerImages.has(block.id)}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      >
                        <FitVideo className="detail-media" src={block.value} />
                      </motion.div>
                    )}
                  </div>
                ))
              ) : (
                /* Fallback for projects that don't have blocks yet (using old fields if available) */
                <>
                  {project.content_body && (
                    <div>
                      {project.content_body.split('\n').filter(l => l.trim().length > 0).map((line, j) => {
                        const isTitle = line.startsWith('#');
                        const cleanText = line.replace(/^#+\s*/, '');
                        return isTitle ? (
                          <h3 key={j} style={{ marginTop: j === 0 ? 0 : '1.5rem' }}>{cleanText}</h3>
                        ) : (
                          <p key={j}>{cleanText}</p>
                        );
                      })}
                    </div>
                  )}
                  {project.cover_image_url && (
                    <FitImage className="detail-media" src={project.cover_image_url} alt={project.title} sizes={MEDIA_SIZES} priority />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="hatch" />

          {/* Previous / next */}
          <div className="frame detail">
            <div className="detail-pager">
              {prevProject ? (
                <Link to={`/works/${prevProject.slug}`}>
                  <div className="pager-label">Previous</div>
                  <div className="pager-title">{prevProject.title}</div>
                </Link>
              ) : (
                <div />
              )}
              {nextProject ? (
                <Link to={`/works/${nextProject.slug}`} className="next">
                  <div className="pager-label">Next</div>
                  <div className="pager-title">{nextProject.title}</div>
                </Link>
              ) : (
                <div className="next" />
              )}
            </div>
          </div>
        </motion.article>
      )}
    </>
  );
}
