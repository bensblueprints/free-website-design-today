import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getTasksByClientId, createTask } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const clientIdParam = req.nextUrl.searchParams.get('client_id');
    const clientId = (clientIdParam && user.is_admin) ? clientIdParam : user.clientId;

    const tasks = await getTasksByClientId(clientId);
    return NextResponse.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const body = await req.json();
    const { client_id, title, assigned_to, description, due_date } = body;

    if (!client_id || !title || !assigned_to) {
      return NextResponse.json({ error: 'client_id, title, assigned_to required' }, { status: 400 });
    }

    const task = await createTask({ client_id, title, assigned_to, description, due_date });
    return NextResponse.json(task);
  } catch (err) {
    console.error('POST /tasks error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
