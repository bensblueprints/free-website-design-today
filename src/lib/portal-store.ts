import { createServerClient } from './supabase';

function db() {
  return createServerClient();
}

// ─── Clients ───

export async function getClientByEmail(email: string) {
  const { data } = await db().from('clients').select('*').eq('email', email.toLowerCase()).single();
  return data;
}

export async function getClientById(id: string) {
  const { data } = await db().from('clients').select('*').eq('id', id).single();
  return data;
}

export async function createClient(client: {
  name?: string;
  full_name?: string;
  business_name?: string;
  email: string;
  password_hash: string | null;
  service_type?: string;
  is_admin?: boolean;
  role?: string;
  added_by?: string;
}) {
  const { data, error } = await db().from('clients').insert({
    name: client.name || client.full_name || '',
    email: client.email.toLowerCase(),
    password_hash: client.password_hash,
    business_name: client.business_name || '',
    service_type: client.service_type || 'web_design',
    is_admin: client.is_admin || false,
    role: client.role || 'client',
    added_by: client.added_by || null,
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Record<string, any>) {
  const { data, error } = await db().from('clients').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { error } = await db().from('clients').delete().eq('id', id);
  return !error;
}

export async function getAllClients() {
  const { data } = await db().from('clients').select('*').order('created_at', { ascending: false });
  return data || [];
}

// ─── Tasks ───

export async function getTasksByClientId(clientId: string) {
  const { data } = await db().from('tasks').select('*').eq('client_id', clientId).order('assigned_to').order('sort_order');
  return data || [];
}

export async function createTask(task: {
  client_id: string;
  title: string;
  assigned_to: string;
  description?: string;
  due_date?: string | null;
  sort_order?: number;
}) {
  let sortOrder = task.sort_order;
  if (sortOrder === undefined) {
    const { data: maxRow } = await db().from('tasks').select('sort_order').eq('client_id', task.client_id).eq('assigned_to', task.assigned_to).order('sort_order', { ascending: false }).limit(1).single();
    sortOrder = (maxRow?.sort_order || 0) + 1;
  }
  const { data, error } = await db().from('tasks').insert({
    client_id: task.client_id,
    title: task.title,
    assigned_to: task.assigned_to,
    description: task.description || '',
    due_date: task.due_date || null,
    sort_order: sortOrder,
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function getTaskById(id: string) {
  const { data } = await db().from('tasks').select('*').eq('id', id).single();
  return data;
}

export async function updateTask(id: string, updates: Record<string, any>) {
  const { data, error } = await db().from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await db().from('tasks').delete().eq('id', id);
  return !error;
}

// ─── Documents ───

export async function getDocumentsByClientId(clientId: string) {
  const { data } = await db().from('documents').select('id, client_id, file_name, document_type, uploaded_by, created_at').eq('client_id', clientId).order('created_at', { ascending: false });
  return data || [];
}

export async function createDocument(doc: {
  client_id: string;
  file_name: string;
  file_data: string;
  document_type?: string;
  uploaded_by?: string;
}) {
  const { data, error } = await db().from('documents').insert({
    client_id: doc.client_id,
    file_name: doc.file_name,
    file_data: doc.file_data,
    document_type: doc.document_type || 'other',
    uploaded_by: doc.uploaded_by || 'client',
  }).select('id, file_name, document_type, uploaded_by, created_at').single();
  if (error) throw error;
  return data;
}

export async function getDocumentById(id: string) {
  const { data } = await db().from('documents').select('*').eq('id', id).single();
  return data;
}

export async function deleteDocument(id: string) {
  const { error } = await db().from('documents').delete().eq('id', id);
  return !error;
}

// ─── Tickets ───

export async function getTicketsByClientId(clientId: string) {
  const { data } = await db().from('tickets').select('*').eq('client_id', clientId).order('updated_at', { ascending: false });
  return data || [];
}

export async function createTicket(ticket: { client_id: string; subject: string }) {
  const { data, error } = await db().from('tickets').insert({
    client_id: ticket.client_id,
    subject: ticket.subject,
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function getTicketById(id: string) {
  const { data } = await db().from('tickets').select('*').eq('id', id).single();
  return data;
}

export async function updateTicket(id: string, updates: Record<string, any>) {
  const { data, error } = await db().from('tickets').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function getAllTickets() {
  const { data } = await db().from('tickets').select('*, clients(name, business_name, email)').order('updated_at', { ascending: false });
  return (data || []).map((t: any) => ({
    ...t,
    client_name: t.clients?.name,
    business_name: t.clients?.business_name,
    client_email: t.clients?.email,
    clients: undefined,
  }));
}

export async function getTicketMessages(ticketId: string) {
  const { data } = await db().from('ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at');
  return data || [];
}

export async function addTicketMessage(msg: {
  ticket_id: string;
  sender_type: string;
  sender_name?: string;
  message: string;
}) {
  const { data, error } = await db().from('ticket_messages').insert(msg).select('*').single();
  if (error) throw error;
  // Update ticket timestamp
  await db().from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', msg.ticket_id);
  return data;
}

// ─── Payment Auth ───

export async function createPaymentAuth(auth: {
  client_id: string;
  platform: string;
  cardholder_name: string;
  last_four_digits: string;
  card_brand?: string;
  authorization_note?: string;
}) {
  const { data, error } = await db().from('payment_authorizations').insert(auth).select('*').single();
  if (error) throw error;
  return data;
}

// ─── Settings ───

export async function getSettings() {
  const { data } = await db().from('settings').select('*');
  const result: Record<string, string> = {};
  (data || []).forEach((row: any) => { result[row.key] = row.value; });
  return result;
}

export async function updateSettings(updates: Record<string, string>) {
  const supabase = db();
  for (const [key, value] of Object.entries(updates)) {
    await supabase.from('settings').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  }
  return true;
}

// ─── Legacy stubs (for old routes that haven't been removed) ───

export async function getProjectsByClientId(_clientId: string) {
  return [];
}

export async function addMessage(_projectId: string, _msg: any) {
  return { id: '', project_id: '', message: '', created_at: new Date().toISOString() };
}

// ─── Task Templates ───

export const TASK_TEMPLATES: Record<string, { client: string[]; agency: string[] }> = {
  web_design: {
    client: ['Create a shared Google Drive folder and paste the link in your portal', 'Upload your logo (PNG or SVG preferred)', 'Write a short description of your business', 'List your main services or products', 'Upload any photos or images you want on the site', 'Review and approve the website sitemap', 'Review and approve the design mockup', 'Provide any feedback on the first draft'],
    agency: ['Send client the onboarding welcome email', 'Review uploaded assets and confirm what is missing', 'Build out sitemap and share with client', 'Design homepage mockup in Figma', 'Build out full site in staging environment', 'Conduct QA and cross-browser testing', 'Launch site and transfer DNS'],
  },
  facebook_ads: {
    client: ['Add a payment method to your Meta Business Suite account', 'Confirm your Facebook Business Page URL', 'Provide your target audience details (age, location, interests)', 'Approve the first set of ad creatives', 'Share any existing customer testimonials or success stories'],
    agency: ['Set up Meta Business Manager and ad account', 'Install Facebook Pixel on client website', 'Build custom audiences and lookalike audiences', 'Create first ad campaign drafts', 'Share ad creatives for client approval', 'Launch campaigns', 'Send first performance report at 7 days'],
  },
  google_ads: {
    client: ['Add a billing method to your Google Ads account', 'Confirm your website URL and main landing page', 'Provide your target keywords or main products/services', 'Confirm your service area or target locations', 'Approve ad copy drafts'],
    agency: ['Set up Google Ads account and link to Analytics', 'Set up conversion tracking', 'Conduct keyword research', 'Write ad copy for client approval', 'Build out campaign structure', 'Launch campaigns', 'Send first performance report at 7 days'],
  },
  seo: {
    client: ['Provide Google Analytics and Google Search Console access', 'Provide website admin/CMS login (or add agency as user)', 'Confirm target keywords and service areas', 'Approve on-page optimization changes before they go live', 'Provide any blog topics or industry FAQs you get from customers'],
    agency: ['Conduct full technical SEO audit', 'Conduct keyword research and mapping', 'Optimize meta titles and descriptions site-wide', 'Fix technical issues (crawl errors, speed, schema)', 'Build out first 4 blog posts', 'Submit sitemap to Google Search Console', 'Send 30-day ranking report'],
  },
  gohighlevel: {
    client: ['Confirm your business name, phone number, and address for GHL setup', 'Provide your logo and brand colors', 'Connect your domain or confirm subdomain preference', 'Review your pipeline stages and confirm workflow', 'Set up your GHL mobile app (agency will send invite)', 'Review and approve automated follow-up sequences'],
    agency: ['Create GHL sub-account for client', 'Configure pipeline and opportunity stages', 'Set up automated lead follow-up sequences', 'Build appointment booking calendar', 'Set up reputation management (review requests)', 'Configure reporting dashboard', 'Send client GHL login credentials and mobile app invite'],
  },
  press: {
    client: ['Provide your professional bio and headshot', 'List 3-5 key topics you can speak on as an expert', 'Share any previous media appearances or press coverage', 'Provide links to your social media profiles', 'Approve the press release draft (agency will provide)', 'Review and approve media pitch angles'],
    agency: ['Research target publications and journalists', 'Write press release draft', 'Build media contact list', 'Create press kit with bio, headshot, and talking points', 'Pitch to journalists and media outlets', 'Send placement report with links to coverage', 'Distribute press release via wire service'],
  },
  coaching: {
    client: ['Complete the business intake questionnaire', 'Share your current revenue numbers and goals', 'Provide access to your analytics dashboards', 'List your top 3 business challenges', 'Come prepared with questions for your first call'],
    agency: ['Review client business model and current metrics', 'Prepare initial audit of sales process and operations', 'Identify automation opportunities', 'Create a strategic action plan for first 30 days', 'Schedule recurring weekly coaching calls'],
  },
};
