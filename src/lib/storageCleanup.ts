import type { SupabaseClient } from '@supabase/supabase-js';

// Finds files in the `uploads/` folder of the portfolio bucket that no project, logo or setting
// points to anymore (old covers, replaced images, test uploads), and deletes them on request.
// Root files such as favicon.png and og-image.jpg live outside `uploads/` and are never touched.
const BUCKET = 'portfolio';
const FOLDER = 'uploads';

export interface StoredFile {
  name: string;
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
    for (const f of data ?? []) if (f.id) files.push({ name: f.name, size: Number(f.metadata?.size ?? 0) });
    if (!data || data.length < 1000) break;
  }

  const [projects, logos, settings, about] = await Promise.all([
    db.from('projects').select('cover_image_url, gallery, content_blocks'),
    db.from('logos').select('url'),
    db.from('site_settings').select('value'),
    db.from('about_blocks').select('content'),
  ]);
  for (const r of [projects, logos, settings, about]) {
    if (r.error) throw new Error(`Could not read what is in use: ${r.error.message}`);
  }
  // Never continue on an empty answer: it would make every file look unused.
  if (!projects.data?.length) throw new Error('No projects were returned, so nothing can be judged unused.');

  const inUse = JSON.stringify([projects.data, logos.data, settings.data, about.data]);
  return { total: files.length, unused: files.filter(f => !inUse.includes(f.name)) };
}

export async function deleteUploads(db: SupabaseClient, names: string[]): Promise<{ removed: number; errors: string[] }> {
  let removed = 0;
  const errors: string[] = [];
  for (let i = 0; i < names.length; i += 100) {
    const batch = names.slice(i, i + 100).map(n => `${FOLDER}/${n}`);
    const { data, error } = await db.storage.from(BUCKET).remove(batch);
    if (error) errors.push(error.message);
    else removed += data?.length ?? 0;
  }
  return { removed, errors };
}
