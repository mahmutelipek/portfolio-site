-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
CREATE POLICY "Allow public read access to site_settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated all access to site_settings" ON public.site_settings;
CREATE POLICY "Allow authenticated all access to site_settings" ON public.site_settings FOR ALL USING (true);
