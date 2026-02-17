-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Untitled Project',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready')),
    global_prompt TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hero', 'features', 'testimonials', 'pricing', 'cta', 'footer', 'custom')),
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    image_description TEXT,
    style_notes TEXT,
    animation_notes TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_sections_project_id ON sections(project_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(project_id, "order");

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view own projects" 
    ON projects FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" 
    ON projects FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
    ON projects FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
    ON projects FOR DELETE 
    USING (auth.uid() = user_id);

-- Create RLS policies for sections
CREATE POLICY "Users can view sections of own projects" 
    ON sections FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = sections.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sections to own projects" 
    ON sections FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = sections.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sections of own projects" 
    ON sections FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = sections.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sections of own projects" 
    ON sections FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = sections.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
