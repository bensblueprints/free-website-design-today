CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  business_name VARCHAR(200) DEFAULT '',
  service_type VARCHAR(50) DEFAULT 'web_design',
  onboarding_status VARCHAR(50) DEFAULT 'new',
  google_drive_folder_url TEXT DEFAULT '',
  welcome_message_dismissed BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  role VARCHAR(50) DEFAULT 'client',
  commission_rate DECIMAL(5,2) DEFAULT 0,
  added_by UUID,
  github_repo TEXT DEFAULT '',
  hosting_url TEXT DEFAULT '',
  hosting_type TEXT DEFAULT '',
  server_ip TEXT DEFAULT '',
  netlify_site_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  assigned_to VARCHAR(20) DEFAULT 'client',
  status VARCHAR(20) DEFAULT 'pending',
  sort_order INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  file_name VARCHAR(300) NOT NULL,
  file_data TEXT,
  document_type VARCHAR(50) DEFAULT 'other',
  uploaded_by VARCHAR(20) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  subject VARCHAR(300) NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL,
  sender_name VARCHAR(200),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform VARCHAR(50),
  cardholder_name VARCHAR(200),
  last_four_digits VARCHAR(4),
  card_brand VARCHAR(50),
  authorization_note TEXT,
  viewed_by_agency BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(200) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
