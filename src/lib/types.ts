export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  existing_website?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  lead_id: string;
  scheduled_at: string;
  calendly_event_id?: string;
  calendly_event_uri?: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface ActiveMeeting {
  id: string;
  appointment_id: string;
  meeting_link: string;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
  appointment?: Appointment;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  existing_website?: string;
  notes?: string;
}
