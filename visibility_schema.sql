-- Add is_visible column to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE projects 
ADD COLUMN is_visible BOOLEAN DEFAULT true;

-- Ensure all existing projects are visible by default
UPDATE projects SET is_visible = true WHERE is_visible IS NULL;
