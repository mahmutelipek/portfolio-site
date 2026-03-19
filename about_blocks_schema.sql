-- Schema for About section blocks (mentioned in documentation)
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.about_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  content text NOT NULL,
  type text DEFAULT 'text', -- 'text', 'experience', 'education', etc.
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.about_blocks ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to about_blocks" 
ON public.about_blocks FOR SELECT USING (true);

-- Authenticated CRUD
CREATE POLICY "Allow authenticated full access to about_blocks" 
ON public.about_blocks USING (auth.role() = 'authenticated');
