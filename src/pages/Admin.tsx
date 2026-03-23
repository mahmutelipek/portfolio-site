import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, Logo, ContentBlock } from '../lib/types';
import { Trash2, ArrowUp, ArrowDown, LogOut, Image as ImageIcon, Type, Plus, Save } from 'lucide-react';

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'logos'>(() => {
    return (localStorage.getItem('admin_active_tab') as any) || 'projects';
  });

  useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizingStatus, setOptimizingStatus] = useState('');
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [hoveredLogoId, setHoveredLogoId] = useState<string | null>(null);
  const [deletingLogoId, setDeletingLogoId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    // Fetch Projects
    const { data: pData } = await supabase.from('projects').select('*').order('sort_order');
    if (pData) setProjects(pData);

    const { data: lData } = await supabase.from('logos').select('*').order('sort_order');
    if (lData) setLogos(lData);

    // Fetch Avatar
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = () => supabase.auth.signOut();

  // --- STORAGE HELPERS ---
  const uploadImage = async (file: File) => {
    let fileToUpload = file;
    let fileExt = file.name.split('.').pop();

    try {
      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920, // Max width/height for web display
        useWebWorker: true,
        fileType: 'image/webp' // Always convert to WebP for standard performance
      };
      const compressedFile = await imageCompression(file, options);
      // Construct a new file object for typing compatibility
      fileToUpload = new File([compressedFile], file.name.replace(/\.[^/.]+$/, ".webp"), { type: 'image/webp' });
      fileExt = 'webp';
    } catch (error) {
      console.error('Image compression failed, falling back to original:', error);
    }

    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, fileToUpload);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message + '\nMake sure you have a public bucket named "portfolio".');
      return null;
    }

    const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // --- PROJECT ACTIONS ---
  const addBlock = (type: 'text' | 'image') => {
    if (!editingProject) return;
    const newBlock: ContentBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      value: ''
    };
    const blocks = [...(editingProject.content_blocks || []), newBlock];
    setEditingProject({ ...editingProject, content_blocks: blocks });
  };

  const updateBlock = (id: string, value: string) => {
    if (!editingProject) return;
    const blocks = editingProject.content_blocks?.map(b => b.id === id ? { ...b, value } : b);
    setEditingProject({ ...editingProject, content_blocks: blocks });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingProject?.content_blocks) return;
    const blocks = [...editingProject.content_blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setEditingProject({ ...editingProject, content_blocks: blocks });
  };

  const deleteBlock = (id: string) => {
    if (!editingProject) return;
    const blocks = editingProject.content_blocks?.filter(b => b.id !== id);
    setEditingProject({ ...editingProject, content_blocks: blocks });
  };

  const reorderProject = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const p1 = projects[index];
    const p2 = projects[newIndex];

    if (p1.sort_order === p2.sort_order) {
      for (let i = 0; i < projects.length; i++) {
        await supabase.from('projects').update({ sort_order: i }).eq('id', projects[i].id);
      }
      await fetchData();
      return;
    }

    const { error: e1 } = await supabase.from('projects').update({ sort_order: p2.sort_order }).eq('id', p1.id);
    const { error: e2 } = await supabase.from('projects').update({ sort_order: p1.sort_order }).eq('id', p2.id);

    if (!e1 && !e2) fetchData();
  };

  const optimizeExistingImages = async () => {
    if (!window.confirm("This will download, compress (to WebP), and re-upload all unoptimized legacy images. It might take a minute or two. Proceed?")) return;
    
    setIsOptimizing(true);
    setOptimizingStatus('Starting optimization...');
    
    // Process projects
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      let updated = false;
      let newCover = p.cover_image_url;
      setOptimizingStatus(`Checking project: ${p.title}...`);

      if (newCover && !newCover.endsWith('.webp') && newCover.includes('portfolio')) {
         try {
           const res = await fetch(newCover);
           const blob = await res.blob();
           const file = new File([blob], `cover_${p.id}.png`, { type: blob.type });
           const optimizedUrl = await uploadImage(file);
           if (optimizedUrl) { newCover = optimizedUrl; updated = true; }
         } catch(e) { console.error("Optimization failed on cover", e); }
      }

      let newBlocks = p.content_blocks ? [...p.content_blocks] : [];
      for (let j = 0; j < newBlocks.length; j++) {
        const b = newBlocks[j];
        if (b.type === 'image' && b.value && !b.value.endsWith('.webp') && b.value.includes('portfolio')) {
          setOptimizingStatus(`Checking block image in ${p.title}...`);
          try {
             const res = await fetch(b.value);
             const blob = await res.blob();
             const file = new File([blob], `block_${p.id}_${j}.png`, { type: blob.type });
             const optimizedUrl = await uploadImage(file);
             if (optimizedUrl) { newBlocks[j].value = optimizedUrl; updated = true; }
          } catch(e) { console.error("Optimization failed on block", e); }
        }
      }

      if (updated) {
         setOptimizingStatus(`Saving ${p.title}...`);
         await supabase.from('projects').update({ cover_image_url: newCover, content_blocks: newBlocks }).eq('id', p.id);
      }
    }

    // Process logos
    for (let i = 0; i < logos.length; i++) {
      const l = logos[i];
      if (l.url && !l.url.endsWith('.webp') && l.url.includes('portfolio')) {
         setOptimizingStatus(`Optimizing logo: ${l.name}...`);
         try {
           const res = await fetch(l.url);
           const blob = await res.blob();
           const file = new File([blob], `logo_${l.id}.png`, { type: blob.type });
           const optimizedUrl = await uploadImage(file);
           if (optimizedUrl) {
             await supabase.from('logos').update({ url: optimizedUrl }).eq('id', l.id);
           }
         } catch(e) { console.error("Optimization failed on logo", e); }
      }
    }

    setOptimizingStatus('Optimization complete! Refreshing data.');
    await fetchData();
    setTimeout(() => { setIsOptimizing(false); setOptimizingStatus(''); }, 3000);
  };

  const reorderLogo = async (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= logos.length) return;

    const l1 = logos[index];
    const l2 = logos[newIndex];

    if (l1.sort_order === l2.sort_order) {
      for (let i = 0; i < logos.length; i++) {
        await supabase.from('logos').update({ sort_order: i }).eq('id', logos[i].id);
      }
      await fetchData();
      return;
    }

    const { error: e1 } = await supabase.from('logos').update({ sort_order: l2.sort_order }).eq('id', l1.id);
    const { error: e2 } = await supabase.from('logos').update({ sort_order: l1.sort_order }).eq('id', l2.id);

    if (!e1 && !e2) fetchData();
  };


  const saveProject = async () => {
    if (!editingProject) return;

    // Basic validation
    if (!editingProject.title || !editingProject.slug) {
      alert('Title and Slug are required.');
      return;
    }

    // Default cover image to first image block if empty
    let finalCoverUrl = editingProject.cover_image_url;
    if (!finalCoverUrl && editingProject.content_blocks) {
      const firstImgBlock = editingProject.content_blocks.find(b => b.type === 'image' && b.value);
      if (firstImgBlock) finalCoverUrl = firstImgBlock.value;
    }

    if (!finalCoverUrl) {
      alert('Please upload a cover image or add at least one image section to use as a cover.');
      return;
    }

    // Ensure slug is URL friendly
    const sanitizedProject = {
      ...editingProject,
      cover_image_url: finalCoverUrl,
      slug: editingProject.slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      sort_order: editingProject.id ? editingProject.sort_order : projects.length
    };

    const { error } = await supabase.from('projects').upsert(sanitizedProject);
    
    if (!error) {
      setEditingProject(null);
      fetchData();
    } else {
      console.error('Save error:', error);
      alert('Error: ' + error.message + '\n\nTip: Did you run the SQL update to add the "content_blocks" column?');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  if (!session) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <form onSubmit={handleLogin} style={{ background: '#141414', padding: '3rem', borderRadius: '12px', border: '1px solid #222', width: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>Admin Access</h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#888' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} required />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#888' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff' }} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '1rem', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '2rem', color: '#fff' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#fff' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer' }}>CMS Dashboard</h1>
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', border: 'none', background: 'none', cursor: 'pointer' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Tabs */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('projects')} style={{ textAlign: 'left', padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'projects' ? '#fff' : 'transparent', color: activeTab === 'projects' ? '#000' : '#888', cursor: 'pointer', fontWeight: 500 }}>Projects</button>
          <button onClick={() => setActiveTab('logos')} style={{ textAlign: 'left', padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'logos' ? '#fff' : 'transparent', color: activeTab === 'logos' ? '#000' : '#888', cursor: 'pointer', fontWeight: 500 }}>Teams (Logos)</button>
        </aside>

        {/* --- PROJECTS TAB (TABLE MODE) --- */}
        {activeTab === 'projects' && (
          <main style={{ background: '#141414', borderRadius: '12px', padding: '2rem', border: '1px solid #222' }}>
            {!editingProject ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Project List</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {isOptimizing ? (
                      <span style={{ fontSize: '0.85rem', color: '#00aaff', background: '#001a33', padding: '0.5rem 1rem', borderRadius: '6px' }}>{optimizingStatus}</span>
                    ) : (
                      <button 
                        onClick={optimizeExistingImages}
                        style={{ padding: '0.75rem 1.5rem', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Optimize Legacy Images
                      </button>
                    )}
                    <button 
                      onClick={() => setEditingProject({ 
                        title: '', 
                        slug: '', 
                        roles: [], 
                        content_blocks: [], 
                        cover_image_url: '',
                        date: new Date().toISOString().split('T')[0] 
                      })}
                      style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Plus size={18} /> New Project
                    </button>
                  </div>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #222' }}>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover</th>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</th>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title</th>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date/Year</th>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Case Study</th>
                        <th style={{ padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p, index) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ width: '60px', height: '40px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
                              {p.cover_image_url && <img src={p.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button 
                                onClick={() => reorderProject(index, 'up')} 
                                disabled={index === 0} 
                                style={{ 
                                  padding: '0.4rem',
                                  background: '#1a1a1a',
                                  border: '1px solid #333',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  cursor: index === 0 ? 'default' : 'pointer',
                                  opacity: index === 0 ? 0.2 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button 
                                onClick={() => reorderProject(index, 'down')} 
                                disabled={index === projects.length - 1} 
                                style={{ 
                                  padding: '0.4rem',
                                  background: '#1a1a1a',
                                  border: '1px solid #333',
                                  borderRadius: '6px',
                                  color: '#fff',
                                  cursor: index === projects.length - 1 ? 'default' : 'pointer',
                                  opacity: index === projects.length - 1 ? 0.2 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ArrowDown size={14} />
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>{p.title}</td>
                          <td style={{ padding: '1rem', color: '#666' }}>{new Date(p.date).getFullYear()}</td>
                          <td style={{ padding: '1rem' }}>
                             <button 
                              onClick={() => setEditingProject(p)}
                              style={{ padding: '0.4rem 0.8rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#fff' }}>
                              Edit Blocks ({p.content_blocks?.length || 0})
                             </button>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button onClick={() => setEditingProject(p)} style={{ border: 'none', background: 'none', color: '#fff', cursor: 'pointer' }}><ImageIcon size={18} /></button>
                              
                              {deletingProjectId === p.id ? (
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', background: '#2d0000', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid #ff4444' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#ff4444' }}>Confirm?</span>
                                  <button 
                                    onClick={async () => {
                                      const { error } = await supabase.from('projects').delete().eq('id', p.id);
                                      if (!error) fetchData();
                                      setDeletingProjectId(null);
                                    }}
                                    style={{ padding: '0.2rem 0.4rem', background: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                                  >
                                    Yes
                                  </button>
                                  <button 
                                    onClick={() => setDeletingProjectId(null)}
                                    style={{ padding: '0.2rem 0.4rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeletingProjectId(p.id)} 
                                  style={{ border: 'none', background: 'none', color: '#ff4444', cursor: 'pointer' }}
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Editing: {editingProject.title || 'New Project'}</h2>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setEditingProject(null)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', color: '#fff' }}>Cancel</button>
                    <button onClick={saveProject} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Save size={18} /> Save & Close
                    </button>
                  </div>
                </div>

                {/* Main Settings & Cover */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                  {/* Cover Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>Cover Image (Required)</label>
                    <div style={{ width: '100%', aspectRatio: '3/2', background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid #333' }}>
                      {editingProject.cover_image_url ? (
                        <img src={editingProject.cover_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                          <ImageIcon size={32} />
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if(file) {
                            const url = await uploadImage(file);
                            if(url) setEditingProject({...editingProject, cover_image_url: url});
                          }
                        }}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#888' }}>Tap to upload or replace cover</p>
                  </div>

                  {/* Fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#888' }}>Project Title</label>
                      <input type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} placeholder="e.g. Modern Coffee App" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#888' }}>Scope</label>
                      <input type="text" value={editingProject.industries || ''} onChange={e => setEditingProject({...editingProject, industries: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} placeholder="e.g. Expense Management" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#888' }}>URL Slug</label>
                      <input type="text" value={editingProject.slug} onChange={e => setEditingProject({...editingProject, slug: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} placeholder="modern-coffee-app" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#888' }}>Date</label>
                      <input type="text" value={editingProject.date} onChange={e => setEditingProject({...editingProject, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} placeholder="e.g. 2023-2024" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500, color: '#888' }}>Roles (separated by comma)</label>
                      <input type="text" value={editingProject.roles?.join(', ')} onChange={e => setEditingProject({...editingProject, roles: e.target.value.split(',').map(r => r.trim())})} style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} placeholder="UI/UX, Branding" />
                    </div>
                  </div>
                </div>

                {/* Case Study Blocks */}
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Case Study Layout</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {editingProject.content_blocks?.map((block, index) => (
                      <div key={block.id} style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: '1rem', top: '1rem', display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => moveBlock(index, 'up')} style={{ border: '1px solid #333', background: '#0a0a0a', borderRadius: '4px', cursor: 'pointer', padding: '4px', color: '#fff' }}><ArrowUp size={14} /></button>
                           <button onClick={() => moveBlock(index, 'down')} style={{ border: '1px solid #333', background: '#0a0a0a', borderRadius: '4px', cursor: 'pointer', padding: '4px', color: '#fff' }}><ArrowDown size={14} /></button>
                           <button onClick={() => deleteBlock(block.id)} style={{ border: 'none', background: '#2d0000', borderRadius: '4px', cursor: 'pointer', padding: '4px', color: '#ff4444' }}><Trash2 size={14} /></button>
                        </div>

                        {block.type === 'text' ? (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600 }}><Type size={16} /> Text Section</div>
                            <div>
                              <input 
                                type="text" 
                                placeholder="Section Title (e.g. Overview)" 
                                value={block.title || ''} 
                                onChange={e => {
                                  const blocks = [...(editingProject.content_blocks || [])];
                                  blocks[index].title = e.target.value;
                                  setEditingProject({...editingProject, content_blocks: blocks});
                                }}
                                style={{ width: '100%', padding: '0.75rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', marginBottom: '0.75rem', fontWeight: 500, color: '#fff' }}
                              />
                              <textarea 
                                value={block.value} 
                                onChange={e => updateBlock(block.id, e.target.value)}
                                placeholder="Description text..."
                                style={{ width: '100%', minHeight: '100px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem', color: '#fff' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600 }}><ImageIcon size={16} /> Image Section</div>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                               <div style={{ width: '150px', aspectRatio: '3/2', background: '#0a0a0a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                                 {block.value && <img src={block.value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                               </div>
                               <input type="file" accept="image/*" onChange={async e => {
                                 const file = e.target.files?.[0];
                                 if(file){
                                   const url = await uploadImage(file);
                                   if(url) updateBlock(block.id, url);
                                 }
                               }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                       <button onClick={() => addBlock('text')} style={{ flex: 1, padding: '1.5rem', background: '#141414', border: '2px dashed #333', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#888' }}>
                         <Plus size={20} /> Add Text Section (Title + Desc)
                       </button>
                       <button onClick={() => addBlock('image')} style={{ flex: 1, padding: '1.5rem', background: '#141414', border: '2px dashed #333', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#888' }}>
                         <Plus size={20} /> Add Image Section
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}

        {/* --- LOGOS TAB --- */}
        {activeTab === 'logos' && (
          <main style={{ background: '#141414', borderRadius: '12px', padding: '2rem', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>Logos</h2>
              <button 
                onClick={async () => {
                  const { error } = await supabase.from('logos').insert({ name: 'Logo', url: '', sort_order: logos.length });
                  if (!error) fetchData();
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={18} /> Add Logo
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1.5rem' }}>
              {logos.map((logo, index) => (
                <div key={logo.id} 
                  onMouseEnter={() => setHoveredLogoId(logo.id)}
                  onMouseLeave={() => {
                    setHoveredLogoId(null);
                    setDeletingLogoId(null); // Reset deletion state when leaving
                  }}
                  style={{ 
                    aspectRatio: '1/1', 
                    border: '1px solid #222', 
                    borderRadius: '12px', 
                    position: 'relative', 
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    cursor: 'default',
                    color: '#fff'
                  }}
                >
                  {logo.url ? (
                    <img src={logo.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: '#ccc', textAlign: 'center' }}>
                      <ImageIcon size={24} style={{ marginBottom: '0.25rem' }} />
                      <div style={{ fontSize: '0.65rem' }}>Empty</div>
                    </div>
                  )}
                  
                  {/* Floating Actions Overlay */}
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: '#0d0d0dfc', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.6rem',
                    opacity: hoveredLogoId === logo.id ? 1 : 0,
                    pointerEvents: hoveredLogoId === logo.id ? 'auto' : 'none',
                    transition: 'opacity 0.2s ease',
                    padding: '0.5rem',
                    zIndex: 20
                  }}
                  >
                    {deletingLogoId === logo.id ? (
                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ff4444' }}>Confirm Delete?</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            onClick={async () => {
                              const { error } = await supabase.from('logos').delete().eq('id', logo.id);
                              if (!error) fetchData();
                              else alert(error.message);
                              setDeletingLogoId(null);
                            }}
                            style={{ padding: '0.4rem 0.6rem', background: '#cc0000', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            Yes
                          </button>
                          <button 
                            onClick={() => setDeletingLogoId(null)}
                            style={{ padding: '0.4rem 0.6rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                         <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                           <button onClick={() => reorderLogo(index, 'left')} disabled={index === 0} style={{ flex: 1, padding: '0.4rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', color: '#fff', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
                           <button onClick={() => reorderLogo(index, 'right')} disabled={index === logos.length - 1} style={{ flex: 1, padding: '0.4rem', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', color: '#fff', cursor: 'pointer', opacity: index === logos.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
                         </div>
                          <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                            <label style={{ 
                              flex: 1,
                              padding: '0.4rem 0.6rem', 
                              background: '#121212', 
                              color: 'white', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              cursor: 'pointer',
                              fontWeight: 500,
                              textAlign: 'center'
                            }}>
                              Update
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={async e => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await uploadImage(file);
                                    if (url) {
                                      await supabase.from('logos').update({ url }).eq('id', logo.id);
                                      fetchData();
                                    }
                                  }
                                }} 
                                style={{ display: 'none' }}
                              />
                            </label>
                            <button 
                               onClick={() => setDeletingLogoId(logo.id)} 
                               style={{ 
                                 flex: 1,
                                 padding: '0.4rem 0.6rem', 
                                 background: '#2d0000', 
                                 color: '#ff4444', 
                                 border: '1px solid #ff4444', 
                                 borderRadius: '4px', 
                                 fontSize: '0.7rem', 
                                 cursor: 'pointer',
                                 fontWeight: 600,
                                 textAlign: 'center'
                               }}
                             >
                              Delete
                            </button>
                          </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={async () => {
                  const { error } = await supabase.from('logos').insert({ name: 'Logo', url: '', sort_order: logos.length });
                  if (!error) fetchData();
                }}
                style={{ 
                  aspectRatio: '1/1', 
                  border: '2px dashed #333', 
                  borderRadius: '12px', 
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  color: '#999'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.background = '#f9f9f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#eee'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Plus size={24} />
                <span style={{ fontSize: '0.75rem' }}>Add Logo</span>
              </button>
            </div>
          </main>
        )}

      </div>
    </div>
  );
}
