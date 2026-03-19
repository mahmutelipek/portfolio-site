-- Adding content_blocks column to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS content_blocks jsonb DEFAULT '[]'::jsonb;

-- Comment out the old content_body if no longer needed, 
-- or keep it for backward compatibility.
-- ALTER TABLE public.projects DROP COLUMN IF EXISTS content_body;
