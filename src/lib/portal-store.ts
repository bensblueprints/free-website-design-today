import { getStore } from '@netlify/blobs';

function clientsStore() {
  return getStore({ name: 'portal-clients', consistency: 'strong' });
}

function projectsStore() {
  return getStore({ name: 'portal-projects', consistency: 'strong' });
}

function messagesStore() {
  return getStore({ name: 'portal-messages', consistency: 'strong' });
}

// ─── Clients ───

export async function getClientByEmail(email: string) {
  const store = clientsStore();
  const data = await store.get(`email:${email.toLowerCase()}`, { type: 'json' });
  return data as any | null;
}

export async function getClientById(id: string) {
  const store = clientsStore();
  const data = await store.get(`id:${id}`, { type: 'json' });
  return data as any | null;
}

export async function createClient(client: {
  full_name: string;
  business_name?: string;
  email: string;
  password_hash: string;
}) {
  const store = clientsStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    ...client,
    email: client.email.toLowerCase(),
    is_active: true,
    created_at: now,
    updated_at: now,
  };

  // Store by both ID and email for lookups
  await store.setJSON(`id:${id}`, record);
  await store.setJSON(`email:${record.email}`, record);

  return record;
}

// ─── Projects ───

export async function getProjectsByClientId(clientId: string) {
  const store = projectsStore();
  const index = await store.get(`client:${clientId}`, { type: 'json' }) as string[] | null;
  if (!index || index.length === 0) return [];

  const projects = await Promise.all(
    index.map(async (projectId) => {
      const project = await store.get(`project:${projectId}`, { type: 'json' });
      if (!project) return null;

      // Get milestones
      const milestones = await store.get(`milestones:${projectId}`, { type: 'json' }) || [];

      // Get files
      const files = await store.get(`files:${projectId}`, { type: 'json' }) || [];

      // Get messages
      const msgStore = messagesStore();
      const messages = await msgStore.get(`project:${projectId}`, { type: 'json' }) || [];

      return { ...project, milestones, files, messages };
    })
  );

  return projects.filter(Boolean);
}

export async function createProject(project: {
  client_id: string;
  name: string;
  description?: string;
  status?: string;
  progress?: number;
}) {
  const store = projectsStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const record = {
    id,
    status: 'pending',
    progress: 0,
    ...project,
    created_at: now,
    updated_at: now,
  };

  await store.setJSON(`project:${id}`, record);

  // Update client's project index
  const index = (await store.get(`client:${project.client_id}`, { type: 'json' }) as string[] | null) || [];
  index.push(id);
  await store.setJSON(`client:${project.client_id}`, index);

  return record;
}

// ─── Messages ───

export async function addMessage(projectId: string, msg: {
  sender_type: 'client' | 'team';
  sender_name?: string;
  message: string;
}) {
  const store = messagesStore();
  const messages = (await store.get(`project:${projectId}`, { type: 'json' }) as any[] | null) || [];
  const record = {
    id: crypto.randomUUID(),
    project_id: projectId,
    ...msg,
    created_at: new Date().toISOString(),
  };
  messages.push(record);
  await store.setJSON(`project:${projectId}`, messages);
  return record;
}
