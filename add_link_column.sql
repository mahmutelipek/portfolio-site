-- Run this script in the Supabase SQL Editor to add the missing link column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "link" TEXT;
