-- Migration: Add pages table and update sections to reference pages
-- This migration converts the project-sections relationship to project-pages-sections

-- Step 1: Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_landing_page BOOLEAN DEFAULT FALSE,
  page_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create index on pages
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON pages(project_id);

-- Step 3: Enable RLS on pages
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policy for pages
CREATE POLICY "Users can CRUD their own pages"
  ON pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = pages.project_id AND projects.user_id = auth.uid()
  ));

-- Step 5: Add page_id column to sections (nullable initially)
ALTER TABLE sections ADD COLUMN IF NOT EXISTS page_id UUID REFERENCES pages(id) ON DELETE CASCADE;

-- Step 6: Create index on sections.page_id
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);

-- Step 7: Migrate existing data - create landing pages for projects with sections
-- First, create a landing page for each project that has sections
INSERT INTO pages (project_id, name, is_landing_page, page_order)
SELECT DISTINCT project_id, 'Landing Page', TRUE, 0
FROM sections
WHERE project_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Step 8: Update sections to reference the new landing pages
UPDATE sections
SET page_id = pages.id
FROM pages
WHERE sections.project_id = pages.project_id
  AND sections.page_id IS NULL;

-- Step 9: Make page_id NOT NULL after migration
ALTER TABLE sections ALTER COLUMN page_id SET NOT NULL;

-- Step 10: Update RLS policy for sections to use page_id
DROP POLICY IF EXISTS "Users can CRUD sections for their projects" ON sections;

CREATE POLICY "Users can CRUD sections for their pages"
  ON sections FOR ALL
  USING (EXISTS (
    SELECT 1 FROM pages 
    JOIN projects ON pages.project_id = projects.id 
    WHERE pages.id = sections.page_id AND projects.user_id = auth.uid()
  ));

-- Step 11: Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 12: Create triggers for pages
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 13: Note: We keep project_id on sections temporarily for rollback purposes
-- In a future migration, we can remove the project_id column from sections
-- ALTER TABLE sections DROP COLUMN project_id;
