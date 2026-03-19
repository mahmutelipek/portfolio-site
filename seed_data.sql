-- Professional Seed Data for Portfolio
-- Run this in your Supabase SQL Editor AFTER running supabase_schema.sql and update_schema.sql

-- Clear existing data (CAUTION)
-- TRUNCATE public.projects CASCADE;
-- TRUNCATE public.logos CASCADE;

-- Insert Sample Projects
INSERT INTO public.projects (title, slug, client, date, cover_image_url, roles, sort_order, content_blocks)
VALUES 
(
  'Norma Finance App', 
  'norma-finance', 
  'Norma', 
  '2026-01-15', 
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200', 
  ARRAY['UI/UX Design', 'Branding'], 
  0, 
  '[
    {"id": "b1", "type": "text", "title": "Overview", "value": "Norma is a revolutionary finance application designed for the modern user. Focusing on clarity and efficiency, the interface provides a seamless experience for managing digital assets."},
    {"id": "b2", "type": "image", "value": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=1200"},
    {"id": "b3", "type": "text", "title": "The Challenge", "value": "Creating a complex data-driven application that remains accessible to non-technical users while providing deep insights for experts."}
  ]'::jsonb
),
(
  'Aura OS Interface', 
  'aura-os', 
  'Aura Technologies', 
  '2025-11-20', 
  'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200', 
  ARRAY['Product Design', 'Motion'], 
  1, 
  '[
    {"id": "b1", "type": "text", "title": "Concept", "value": "Aura OS is a concept for a future-proof operating system. It utilizes 3D spatial awareness and adaptive glassmorphism to create a tactile digital environment."},
    {"id": "b2", "type": "image", "value": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200"}
  ]'::jsonb
);

-- Insert Sample Logos
INSERT INTO public.logos (name, url, website_url, sort_order)
VALUES 
('Apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'https://apple.com', 0),
('Google', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://google.com', 1),
('Microsoft', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', 'https://microsoft.com', 2),
('Framework', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Framework_Computer_logo.svg/1200px-Framework_Computer_logo.svg.png', 'https://frame.work', 3);
