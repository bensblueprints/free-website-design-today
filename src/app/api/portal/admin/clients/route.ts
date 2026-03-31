import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { hashPassword } from '@/lib/portal-auth';
import { getAllClients, getTasksByClientId, createClient, getClientByEmail } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const clients = await getAllClients();

    // Get task counts per client
    const clientsWithTasks = await Promise.all(
      clients.map(async (c: any) => {
        const tasks = await getTasksByClientId(c.id);
        const total = tasks.length;
        const done = tasks.filter((t: any) => t.status === 'complete').length;
        const { password_hash, ...safe } = c;
        return { ...safe, tasks: { total, done } };
      })
    );

    // Sort by created_at desc
    clientsWithTasks.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(clientsWithTasks);
  } catch (err) {
    console.error('GET /admin/clients error:', err);
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
    const { name, email, password, business_name, service_type } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'name and email required' }, { status: 400 });
    }

    const existing = await getClientByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hash = password ? await hashPassword(password) : null;

    const client = await createClient({
      name,
      full_name: name,
      email: email.toLowerCase().trim(),
      password_hash: hash,
      business_name: business_name || '',
      service_type: service_type || 'web_design',
      added_by: user.clientId,
    });

    const { password_hash, ...safe } = client;
    return NextResponse.json(safe);
  } catch (err) {
    console.error('POST /admin/clients error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
