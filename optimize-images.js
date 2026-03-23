import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import sharp from 'sharp';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env parameters");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function optimizeImage(publicUrl) {
  if (!publicUrl || !publicUrl.includes('/storage/v1/object/public/portfolio/')) {
    return publicUrl;
  }
  
  // if already optimized maybe skip? Actually let's just do it for non-webp.
  if (publicUrl.endsWith('.webp')) {
    console.log(`Skipping already webp: ${publicUrl}`);
    return publicUrl;
  }

  try {
    console.log(`Downloading: ${publicUrl}`);
    const res = await fetch(publicUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Processing with sharp...`);
    const optimizedBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const fileName = `uploads/${Math.random().toString(36).substring(7)}.webp`;
    
    console.log(`Uploading optimized WebP...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return publicUrl; // fallback
    }

    const { data: { publicUrl: newUrl } } = supabase.storage.from('portfolio').getPublicUrl(fileName);
    console.log(`Done. New URL: ${newUrl}`);
    return newUrl;

  } catch (err) {
    console.error("Error optimizing image:", err);
    return publicUrl;
  }
}

async function run() {
  console.log("Fetching projects...");
  const { data: projects, error: projectsError } = await supabase.from('projects').select('*');
  if (projectsError) throw projectsError;

  for (const project of projects) {
    let updated = false;
    let newCoverUrl = project.cover_image_url;
    let newBlocks = project.content_blocks ? [...project.content_blocks] : [];

    // Optimize Cover Image
    if (newCoverUrl && !newCoverUrl.endsWith('.webp')) {
      const optimized = await optimizeImage(newCoverUrl);
      if (optimized !== newCoverUrl) {
        newCoverUrl = optimized;
        updated = true;
      }
    }

    // Optimize Content Blocks Images
    for (let i = 0; i < newBlocks.length; i++) {
        const block = newBlocks[i];
        if (block.type === 'image' && block.value && !block.value.endsWith('.webp')) {
          const optimized = await optimizeImage(block.value);
          if (optimized !== block.value) {
            newBlocks[i].value = optimized;
            updated = true;
          }
        }
    }

    if (updated) {
      console.log(`Updating project ${project.title} in DB...`);
      await supabase.from('projects').update({
        cover_image_url: newCoverUrl,
        content_blocks: newBlocks
      }).eq('id', project.id);
    }
  }

  console.log("Fetching logos...");
  const { data: logos, error: logosError } = await supabase.from('logos').select('*');
  if (logosError) throw logosError;

  for (const logo of logos) {
    if (logo.image_url && !logo.image_url.endsWith('.webp')) {
        const optimized = await optimizeImage(logo.image_url);
        if (optimized !== logo.image_url) {
             console.log(`Updating logo ${logo.name} in DB...`);
             await supabase.from('logos').update({ image_url: optimized }).eq('id', logo.id);
        }
    }
  }

  console.log("Retroactive optimization complete!");
}

run().catch(console.error);
