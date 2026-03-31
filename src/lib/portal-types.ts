export interface PortalClient {
  id: string;
  full_name: string;
  business_name?: string;
  email: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortalProject {
  id: string;
  client_id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'revision' | 'completed' | 'on_hold';
  progress: number;
  preview_url?: string;
  live_url?: string;
  started_at?: string;
  estimated_completion?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  milestones?: PortalMilestone[];
  messages?: PortalMessage[];
  files?: PortalFile[];
}

export interface PortalMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  sort_order: number;
  completed_at?: string;
  created_at: string;
}

export interface PortalMessage {
  id: string;
  project_id: string;
  sender_type: 'client' | 'team';
  sender_name?: string;
  message: string;
  created_at: string;
}

export interface PortalFile {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  uploaded_by: 'client' | 'team';
  created_at: string;
}
