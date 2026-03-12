-- Create About Blocks Table
CREATE TABLE public.about_blocks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'text', 'orbit', 'image'
  title text,
  content text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.about_blocks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access to about_blocks" ON public.about_blocks FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert to about_blocks" ON public.about_blocks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update to about_blocks" ON public.about_blocks FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete from about_blocks" ON public.about_blocks FOR DELETE USING (true);
