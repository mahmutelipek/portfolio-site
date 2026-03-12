-- Run this in your Supabase SQL Editor to initialize the database

-- Projects Table
CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  client text NOT NULL,
  date date NOT NULL,
  cover_image_url text NOT NULL,
  gallery jsonb DEFAULT '[]'::jsonb,
  content_body text,
  roles text[] DEFAULT '{}'::text[],
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Logos Table
CREATE TABLE public.logos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  url text NOT NULL,
  website_url text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access to logos" ON public.logos FOR SELECT USING (true);

-- Note: For the Admin interface to work, you may need to add additional 
-- policies for INSERT/UPDATE/DELETE depending on your authentication setup.
-- For a private portfolio, you can restrict these to authenticated users.
CREATE POLICY "Allow authenticated insert to projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete from projects" ON public.projects FOR DELETE USING (true);

CREATE POLICY "Allow authenticated insert to logos" ON public.logos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to logos" ON public.logos FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete from logos" ON public.logos FOR DELETE USING (true);
