import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Project, Logo, ContentBlock } from '../lib/types';
import { Trash2, ArrowUp, ArrowDown, LogOut, Image as ImageIcon, Type, Plus, Save } from 'lucide-react';

export function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'logos' | 'about'>(() => {
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
  const [avatarUrl, setAvatarUrl] = useState<string>('');
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
        fetchAboutBlocks();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchData();
        fetchAboutBlocks();
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
    try {
      const { data: sData, error: sError } = await supabase.from('site_settings').select('value').eq('key', 'avatar_url').single();
      if (!sError && sData) setAvatarUrl(sData.value);
    } catch (e) {
      console.log('Site settings table may not exist yet.');
    }
    fetchAboutBlocks();
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = () => supabase.auth.signOut();

  // --- STORAGE HELPERS ---
  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(filePath, file);

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

  // --- ABOUT BLOCKS ---
  const [aboutBlocks, setAboutBlocks] = useState<any[]>([]);
  const [editingBlock, setEditingBlock] = useState<any>(null);

  const fetchAboutBlocks = async () => {
    const { data } = await supabase.from('about_blocks').select('*').order('sort_order', { ascending: true });
    if (data) setAboutBlocks(data);
  };

  const saveAboutBlock = async () => {
    if (!editingBlock) return;
    
    if (editingBlock.id) {
      await supabase.from('about_blocks').update(editingBlock).eq('id', editingBlock.id);
    } else {
      // Get next sort order
      const nextOrder = aboutBlocks.length > 0 ? Math.max(...aboutBlocks.map(b => b.sort_order)) + 1 : 0;
      await supabase.from('about_blocks').insert({ ...editingBlock, sort_order: nextOrder });
    }
    setEditingBlock(null);
    fetchAboutBlocks();
  };

  const deleteAboutBlock = async (id: string) => {
    await supabase.from('about_blocks').delete().eq('id', id);
    fetchAboutBlocks();
  };

  const reorderAboutBlock = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= aboutBlocks.length) return;

    const b1 = aboutBlocks[index];
    const b2 = aboutBlocks[newIndex];

    if (b1.sort_order === b2.sort_order) {
      for (let i = 0; i < aboutBlocks.length; i++) {
        await supabase.from('about_blocks').update({ sort_order: i }).eq('id', aboutBlocks[i].id);
      }
      fetchAboutBlocks();
      return;
    }

    await supabase.from('about_blocks').update({ sort_order: b2.sort_order }).eq('id', b1.id);
    await supabase.from('about_blocks').update({ sort_order: b1.sort_order }).eq('id', b2.id);
    fetchAboutBlocks();
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
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '400px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem', textAlign: 'center' }}>Admin Access</h2>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} required />
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px' }} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '1rem', background: '#121212', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '2rem' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#121212' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, cursor: 'pointer' }}>CMS Dashboard</h1>
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666', border: 'none', background: 'none', cursor: 'pointer' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Tabs */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('projects')} style={{ textAlign: 'left', padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'projects' ? '#121212' : 'transparent', color: activeTab === 'projects' ? 'white' : '#121212', cursor: 'pointer' }}>Projects</button>
          <button onClick={() => setActiveTab('logos')} style={{ textAlign: 'left', padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'logos' ? '#121212' : 'transparent', color: activeTab === 'logos' ? 'white' : '#121212', cursor: 'pointer' }}>Teams (Logos)</button>
          <button onClick={() => setActiveTab('about')} style={{ textAlign: 'left', padding: '1rem', borderRadius: '8px', border: 'none', background: activeTab === 'about' ? '#121212' : 'transparent', color: activeTab === 'about' ? 'white' : '#121212', cursor: 'pointer' }}>About Page</button>
        </aside>

        {/* --- PROJECTS TAB (TABLE MODE) --- */}
        {activeTab === 'projects' && (
          <main style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            {!editingProject ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Project List</h2>
                  <button 
                    onClick={() => setEditingProject({ 
                      title: '', 
                      slug: '', 
                      roles: [], 
                      content_blocks: [], 
                      client: '', 
                      cover_image_url: '',
                      date: new Date().toISOString().split('T')[0] 
                    })}
                    style={{ padding: '0.75rem 1.5rem', background: '#121212', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Plus size={18} /> New Project
                  </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Cover</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Order</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Title</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Client</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Date/Year</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500 }}>Case Study</th>
                        <th style={{ padding: '1rem', color: '#666', fontWeight: 500, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((p, index) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ width: '60px', height: '40px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
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
                                  background: '#f5f5f5',
                                  border: '1px solid #ddd',
                                  borderRadius: '6px',
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
                                  background: '#f5f5f5',
                                  border: '1px solid #ddd',
                                  borderRadius: '6px',
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
                          <td style={{ padding: '1rem', color: '#666' }}>{p.client}</td>
                          <td style={{ padding: '1rem', color: '#666' }}>{new Date(p.date).getFullYear()}</td>
                          <td style={{ padding: '1rem' }}>
                             <button 
                              onClick={() => setEditingProject(p)}
                              style={{ padding: '0.4rem 0.8rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                              Edit Blocks ({p.content_blocks?.length || 0})
                             </button>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button onClick={() => setEditingProject(p)} style={{ border: 'none', background: 'none', color: '#121212', cursor: 'pointer' }}><ImageIcon size={18} /></button>
                              
                              {deletingProjectId === p.id ? (
                                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', background: '#fff0f0', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid #ffcccc' }}>
                                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#cc0000' }}>Confirm?</span>
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
                                    style={{ padding: '0.2rem 0.4rem', background: '#eee', color: '#121212', border: 'none', borderRadius: '4px', fontSize: '0.65rem', cursor: 'pointer' }}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeletingProjectId(p.id)} 
                                  style={{ border: 'none', background: 'none', color: '#cc0000', cursor: 'pointer' }}
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
                    <button onClick={() => setEditingProject(null)} style={{ padding: '0.75rem 1.5rem', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveProject} style={{ padding: '0.75rem 1.5rem', background: '#121212', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Save size={18} /> Save & Close
                    </button>
                  </div>
                </div>

                {/* Main Settings & Cover */}
                <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', background: '#fafafa', padding: '1.5rem', borderRadius: '12px' }}>
                  {/* Cover Upload */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#121212' }}>Cover Image (Required)</label>
                    <div style={{ width: '100%', aspectRatio: '3/2', background: '#eee', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid #ddd' }}>
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
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Project Title</label>
                      <input type="text" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="e.g. Modern Coffee App" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Client</label>
                      <input type="text" value={editingProject.client} onChange={e => setEditingProject({...editingProject, client: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="e.g. Acme Corp" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>URL Slug</label>
                      <input type="text" value={editingProject.slug} onChange={e => setEditingProject({...editingProject, slug: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="modern-coffee-app" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Date</label>
                      <input type="date" value={editingProject.date} onChange={e => setEditingProject({...editingProject, date: e.target.value})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 500 }}>Roles (separated by comma)</label>
                      <input type="text" value={editingProject.roles?.join(', ')} onChange={e => setEditingProject({...editingProject, roles: e.target.value.split(',').map(r => r.trim())})} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }} placeholder="UI/UX, Branding" />
                    </div>
                  </div>
                </div>

                {/* Case Study Blocks */}
                <div style={{ marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Case Study Layout</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {editingProject.content_blocks?.map((block, index) => (
                      <div key={block.id} style={{ background: '#fcfcfc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', position: 'relative' }}>
                        <div style={{ position: 'absolute', right: '1rem', top: '1rem', display: 'flex', gap: '0.5rem' }}>
                           <button onClick={() => moveBlock(index, 'up')} style={{ border: 'none', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><ArrowUp size={14} /></button>
                           <button onClick={() => moveBlock(index, 'down')} style={{ border: 'none', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderRadius: '4px', cursor: 'pointer', padding: '4px' }}><ArrowDown size={14} /></button>
                           <button onClick={() => deleteBlock(block.id)} style={{ border: 'none', background: '#fff0f0', borderRadius: '4px', cursor: 'pointer', padding: '4px', color: '#cc0000' }}><Trash2 size={14} /></button>
                        </div>

                        {block.type === 'text' ? (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#121212', fontWeight: 600 }}><Type size={16} /> Text Section</div>
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
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '0.75rem', fontWeight: 500 }}
                              />
                              <textarea 
                                value={block.value} 
                                onChange={e => updateBlock(block.id, e.target.value)}
                                placeholder="Description text..."
                                style={{ width: '100%', minHeight: '100px', border: '1px solid #ddd', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#121212', fontWeight: 600 }}><ImageIcon size={16} /> Image Section</div>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                               <div style={{ width: '150px', aspectRatio: '3/2', background: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
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
                       <button onClick={() => addBlock('text')} style={{ flex: 1, padding: '1.5rem', background: '#f5f5f5', border: '2px dashed #ddd', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}>
                         <Plus size={20} /> Add Text Section (Title + Desc)
                       </button>
                       <button onClick={() => addBlock('image')} style={{ flex: 1, padding: '1.5rem', background: '#f5f5f5', border: '2px dashed #ddd', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}>
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
          <main style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Logos</h2>
              <button 
                onClick={async () => {
                  const { error } = await supabase.from('logos').insert({ name: 'Logo', url: '', sort_order: logos.length });
                  if (!error) fetchData();
                }}
                style={{ padding: '0.75rem 1.5rem', background: '#121212', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
                    border: '1px solid #eee', 
                    borderRadius: '12px', 
                    position: 'relative', 
                    overflow: 'hidden',
                    background: '#fcfcfc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    cursor: 'default'
                  }}
                >
                  {logo.url ? (
                    <img src={logo.url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                    background: 'rgba(255,255,255,0.98)', 
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
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#cc0000' }}>Confirm Delete?</span>
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
                            style={{ padding: '0.4rem 0.6rem', background: '#eee', color: '#121212', border: 'none', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.65rem', fontWeight: 600, color: '#888' }}>WEBSITE URL</label>
                            {saveStatus === `logo-${logo.id}` && <span style={{ fontSize: '0.6rem', color: '#2ecc71', fontWeight: 600 }}>SAVED!</span>}
                          </div>
                          <input 
                            type="text" 
                            placeholder="google.com" 
                            value={logo.website_url || ''} 
                            onChange={(e) => {
                              const val = e.target.value;
                              const newLogos = [...logos];
                              newLogos[index].website_url = val;
                              setLogos(newLogos);
                            }}
                            onBlur={async (e) => {
                              let val = e.target.value.trim();
                              if (val && !val.startsWith('http')) {
                                val = `https://${val}`;
                              }
                              const newLogos = [...logos];
                              newLogos[index].website_url = val;
                              setLogos(newLogos);
                              const { error } = await supabase.from('logos').update({ website_url: val }).eq('id', logo.id);
                              if (!error) setSaveStatus(`logo-${logo.id}`);
                            }}
                            style={{ width: '100%', padding: '4px 6px', fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem', width: '100%' }}>
                          <button onClick={() => reorderLogo(index, 'left')} disabled={index === 0} style={{ flex: 1, padding: '0.4rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUp size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
                          <button onClick={() => reorderLogo(index, 'right')} disabled={index === logos.length - 1} style={{ flex: 1, padding: '0.4rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', opacity: index === logos.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={14} style={{ transform: 'rotate(-90deg)' }} /></button>
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
                                padding: '0.4rem 0.6rem', 
                                background: '#fff0f0', 
                                color: '#cc0000', 
                                border: '1px solid #ffcccc', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem', 
                                cursor: 'pointer'
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
                  border: '2px dashed #eee', 
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

        {/* --- ABOUT TAB --- */}
        {activeTab === 'about' && (
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>About Page Blocks</h2>
              <button 
                onClick={() => setEditingBlock({ type: 'text', title: '', content: '' })}
                style={{ padding: '0.75rem 1.5rem', background: '#121212', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
              >
                Add Block
              </button>
            </div>

            {/* Avatar Section */}
            <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #eee' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Profile Picture (Avatar)</h3>
              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', background: '#eee' }}>
                  {avatarUrl && <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <label style={{ padding: '0.6rem 1.2rem', background: '#121212', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Upload New Avatar
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await uploadImage(file);
                        if (url) {
                          await supabase.from('site_settings').upsert({ key: 'avatar_url', value: url });
                          setAvatarUrl(url);
                        }
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {aboutBlocks.map((block, index) => (
                <div key={block.id} style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <button onClick={() => reorderAboutBlock(index, 'up')} disabled={index === 0} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === 0 ? 0.2 : 1 }}><ArrowUp size={16} /></button>
                      <button onClick={() => reorderAboutBlock(index, 'down')} disabled={index === aboutBlocks.length - 1} style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: index === aboutBlocks.length - 1 ? 0.2 : 1 }}><ArrowDown size={16} /></button>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: '#999', display: 'block', marginBottom: '0.25rem' }}>{block.type}</span>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{block.title || (block.type === 'orbit' ? 'Orbiting Images Component' : 'Untitled Block')}</h4>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setEditingBlock(block)} style={{ padding: '0.4rem 0.8rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => deleteAboutBlock(block.id)} style={{ padding: '0.4rem 0.8rem', background: '#fff0f0', color: '#cc0000', border: '1px solid #ffcccc', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {editingBlock && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <h3 style={{ marginBottom: '1.5rem' }}>{editingBlock.id ? 'Edit' : 'Add'} About Block</h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>TYPE</label>
                    <select 
                      value={editingBlock.type} 
                      onChange={e => setEditingBlock({...editingBlock, type: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    >
                      <option value="text">Text / Paragraph</option>
                      <option value="image">Single Image</option>
                      <option value="orbit">Orbit (Rotation Project List)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>LABEL / TITLE (Internal)</label>
                    <input 
                      type="text" 
                      value={editingBlock.title || ''} 
                      onChange={e => setEditingBlock({...editingBlock, title: e.target.value})}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                  </div>

                  {editingBlock.type === 'text' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>CONTENT (Paragraph Text)</label>
                      <textarea 
                        rows={5}
                        value={editingBlock.content || ''} 
                        onChange={e => setEditingBlock({...editingBlock, content: e.target.value})}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit' }}
                      />
                    </div>
                  )}

                  {editingBlock.type === 'image' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>IMAGE</label>
                      {editingBlock.content && (
                        <img src={editingBlock.content} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />
                      )}
                      <label style={{ display: 'inline-block', padding: '0.6rem 1.2rem', background: '#121212', color: 'white', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        {editingBlock.content ? 'Change Image' : 'Upload Image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await uploadImage(file);
                            if (url) setEditingBlock({...editingBlock, content: url});
                          }
                        }} />
                      </label>
                    </div>
                  )}

                  {editingBlock.type === 'orbit' && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>This block will render the orbiting project images component at its position in the list.</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingBlock(null)} style={{ padding: '0.75rem 1.5rem', background: 'none', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={saveAboutBlock} style={{ padding: '0.75rem 1.5rem', background: '#121212', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Save Block</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
