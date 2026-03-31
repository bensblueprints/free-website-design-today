-- Client Portal Schema
-- Extends the existing schema with client authentication and project tracking

-- Portal clients table
CREATE TABLE IF NOT EXISTS portal_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portal projects table
CREATE TABLE IF NOT EXISTS portal_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES portal_clients(id) ON DELETE CASCADE,
    name VARCHAR(300) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, review, revision, completed, on_hold
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    preview_url TEXT,
    live_url TEXT,
    started_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project milestones
CREATE TABLE IF NOT EXISTS portal_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES portal_projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    sort_order INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project messages (communication between client and team)
CREATE TABLE IF NOT EXISTS portal_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES portal_projects(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- 'client' or 'team'
    sender_name VARCHAR(200),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project files/deliverables
CREATE TABLE IF NOT EXISTS portal_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES portal_projects(id) ON DELETE CASCADE,
    file_name VARCHAR(300) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- image, document, design, code
    file_size BIGINT,
    uploaded_by VARCHAR(20) DEFAULT 'team', -- 'client' or 'team'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portal_clients_email ON portal_clients(email);
CREATE INDEX IF NOT EXISTS idx_portal_projects_client_id ON portal_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_milestones_project_id ON portal_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_messages_project_id ON portal_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_files_project_id ON portal_files(project_id);

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_portal_clients_updated_at ON portal_clients;
CREATE TRIGGER update_portal_clients_updated_at
    BEFORE UPDATE ON portal_clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portal_projects_updated_at ON portal_projects;
CREATE TRIGGER update_portal_projects_updated_at
    BEFORE UPDATE ON portal_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_files ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access to portal_clients" ON portal_clients
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to portal_projects" ON portal_projects
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to portal_milestones" ON portal_milestones
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to portal_messages" ON portal_messages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to portal_files" ON portal_files
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Allow anonymous insert for client signup
CREATE POLICY "Allow anonymous client signup" ON portal_clients
    FOR INSERT TO anon WITH CHECK (true);
