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

-- Insert initial avatar if not exists
INSERT INTO public.site_settings (key, value)
VALUES ('avatar_url', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT (key) DO NOTHING;
