import type { SupabaseClient } from '@supabase/supabase-js';

// Finds files in the portfolio bucket that nothing uses anymore (old covers, replaced images, test uploads)
// and deletes them on request. Everything is judged against what the projects, logos and settings point to.
// The old Supabase favicon and share image are listed too: the site now serves its own copies, so they are unused.
const BUCKET = 'portfolio';
const FOLDER = 'uploads';
const LEGACY_ROOT_FILES = ['favicon.png', 'og-image.jpg'];

export interface StoredFile {
  /** Path inside the bucket, e.g. `uploads/0.123.webp` or `favicon.png`. */
  path: string;
  size: number;
}

export async function findUnusedUploads(db: SupabaseClient): Promise<{ total: number; unused: StoredFile[] }> {
  const files: StoredFile[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(BUCKET).list(FOLDER, {
      limit: 1000,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw new Error(`Could not list storage: ${error.message}`);
    for (const f of data ?? []) if (f.id) files.push({ path: `${FOLDER}/${f.name}`, size: Number(f.metadata?.size ?? 0) });
    if (!data || data.length < 1000) break;
  }

  const [projects, logos, settings] = await Promise.all([
    db.from('projects').select('cover_image_url, gallery, content_blocks'),
    db.from('logos').select('url'),
    db.from('site_settings').select('value'),
  ]);
  for (const r of [projects, logos, settings]) {
    if (r.error) throw new Error(`Could not read what is in use: ${r.error.message}`);
  }
  // Never continue on an empty answer: it would make every file look unused.
  if (!projects.data?.length) throw new Error('No projects were returned, so nothing can be judged unused.');

  const inUse = JSON.stringify([projects.data, logos.data, settings.data]);
  const unused = files.filter(f => !inUse.includes(f.path.slice(FOLDER.length + 1)));

  const { data: root, error: rootError } = await db.storage.from(BUCKET).list('', { limit: 100 });
  if (rootError) throw new Error(`Could not list storage: ${rootError.message}`);
  for (const f of root ?? []) {
    if (f.id && LEGACY_ROOT_FILES.includes(f.name)) unused.push({ path: f.name, size: Number(f.metadata?.size ?? 0) });
  }
  return { total: files.length, unused };
}

export async function deleteUploads(db: SupabaseClient, paths: string[]): Promise<{ removed: number; errors: string[] }> {
  let removed = 0;
  const errors: string[] = [];
  for (let i = 0; i < paths.length; i += 100) {
    const { data, error } = await db.storage.from(BUCKET).remove(paths.slice(i, i + 100));
    if (error) errors.push(error.message);
    else removed += data?.length ?? 0;
  }
  return { removed, errors };
}
