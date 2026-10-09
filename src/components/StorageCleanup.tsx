import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { deleteUploads, findUnusedUploads, type StoredFile } from '../lib/storageCleanup';

const mb = (bytes: number) => (bytes / 1048576).toFixed(1);

/** Admin tool: scan the bucket for files nothing uses, then delete them after a confirmation. */
export function StorageCleanup() {
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<{ total: number; unused: StoredFile[] } | null>(null);
  const [message, setMessage] = useState('');

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onScan = () => run(async () => setScan(await findUnusedUploads(supabase)));

  const onDelete = () =>
    run(async () => {
      if (!scan || scan.unused.length === 0) return;
      const size = mb(scan.unused.reduce((s, f) => s + f.size, 0));
      if (!window.confirm(`Permanently delete ${scan.unused.length} unused files (${size} MB)? This cannot be undone.`)) return;
      const { removed, errors } = await deleteUploads(supabase, scan.unused.map(f => f.path));
      const wanted = scan.unused.length;
      const note =
        errors.length > 0 ? ` Errors: ${errors.join('; ')}`
        : removed < wanted ? ' Some files were not removed: check that the signed-in user may delete from the portfolio bucket.'
        : '';
      setMessage(`Deleted ${removed} of ${wanted} files.${note}`);
      setScan(await findUnusedUploads(supabase));
    });

  const button = (primary: boolean) => ({
    padding: '0.6rem 1.2rem',
    background: primary ? '#fff' : '#2d0000',
    color: primary ? '#000' : '#ff6b6b',
    fontWeight: 600,
    border: 'none',
    borderRadius: '6px',
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.6 : 1,
  } as const);

  return (
    <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Storage cleanup</h3>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1rem' }}>
        Finds uploaded files that no project, logo or setting uses anymore (old covers, replaced images, the old Supabase favicon and share image) and deletes them.
        Files that are still in use are never touched.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={onScan} disabled={busy} style={button(true)}>{busy ? 'Working…' : 'Scan storage'}</button>
        {scan && scan.unused.length > 0 && (
          <button onClick={onDelete} disabled={busy} style={button(false)}>
            Delete {scan.unused.length} unused files
          </button>
        )}
      </div>
      {scan && (
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          {scan.unused.length === 0
            ? `Nothing to clean: all ${scan.total} files are in use.`
            : `${scan.unused.length} of ${scan.total} files are unused (${mb(scan.unused.reduce((s, f) => s + f.size, 0))} MB).`}
        </p>
      )}
      {message && <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#9ad' }}>{message}</p>}
    </div>
  );
}
