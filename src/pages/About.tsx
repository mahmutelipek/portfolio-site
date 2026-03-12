import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import OrbitImages from '../components/OrbitImages';
import { PixelCard } from '../components/PixelCard';
import { supabase } from '../lib/supabase';

export function About() {
  const [images, setImages] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      // Fetch Orbit Images
      const { data: imgData } = await supabase
        .from('about_images')
        .select('url')
        .order('sort_order');
      
      if (imgData && imgData.length > 0) {
        setImages(imgData.map(img => img.url));
      }

      // Fetch About Blocks
      const { data: blockData } = await supabase
        .from('about_blocks')
        .select('*')
        .order('sort_order');
      if (blockData) setBlocks(blockData);

      // Fetch Avatar
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'avatar_url')
        .single();
      
      if (settingsData) {
        setAvatarUrl(settingsData.value);
      }
    }
    fetchData();
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{ 
        padding: isMobile ? '8rem 1.5rem' : '12rem 2rem', 
        maxWidth: '1000px', 
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%', margin: '0 auto', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <PixelCard 
          variant="default"
          style={{ width: '100%', maxWidth: isMobile ? '220px' : '280px', marginBottom: '4rem', background: 'transparent', border: 'none', borderRadius: '8px', overflow: 'hidden' }}
        >
          {avatarUrl && (
            <img 
              src={avatarUrl} 
              alt="Mahmut Elİpek Avatar" 
              style={{ width: '100%', display: 'block', borderRadius: '8px' }}
            />
          )}
        </PixelCard>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%' }}>
        {blocks.map((block) => (
          <div key={block.id} style={{ width: '100%' }}>
            {block.type === 'text' && (
              <p style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', lineHeight: 1.6, color: 'var(--text-secondary)', textAlign: 'center', margin: '0 auto', maxWidth: '800px' }}>
                {block.content}
              </p>
            )}
            
            {block.type === 'image' && (
              <div style={{ width: '100%', maxWidth: '800px', margin: '2rem auto', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={block.content} style={{ width: '100%', display: 'block' }} />
              </div>
            )}

            {block.type === 'orbit' && images.length > 0 && (
              <div style={{ position: 'relative', width: '100%', height: isMobile ? '300px' : '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <OrbitImages 
                  radiusX={isMobile ? 140 : 320} 
                  radiusY={isMobile ? 70 : 140} 
                  duration={90} 
                  rotation={-15}
                  itemSize={isMobile ? 80 : 135}
                  images={images}
                />
              </div>
            )}
          </div>
        ))}

        {/* Fallback if no blocks */}
        {blocks.length === 0 && (
          <p style={{ fontSize: '1.25rem', lineHeight: 1.6, color: 'var(--text-secondary)', textAlign: 'center' }}>
            No content blocks found. Please add content in the admin panel.
          </p>
        )}
      </div>
    </motion.section>
  );
}
