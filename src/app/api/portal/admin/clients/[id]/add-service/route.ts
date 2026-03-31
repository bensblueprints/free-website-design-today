import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getTasksByClientId, createTask, TASK_TEMPLATES } from '@/lib/portal-store';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const { id: clientId } = await params;
    const body = await req.json();
    const { service_type } = body;

    if (!TASK_TEMPLATES[service_type]) {
      return NextResponse.json({ error: 'Invalid service_type' }, { status: 400 });
    }

    // Get current max sort_order
    const existingTasks = await getTasksByClientId(clientId);
    let order = existingTasks.length > 0
      ? Math.max(...existingTasks.map((t: any) => t.sort_order || 0)) + 1
      : 1;

    const template = TASK_TEMPLATES[service_type];
    const creates = [];

    for (const title of template.client) {
      creates.push(createTask({
        client_id: clientId,
        title,
        assigned_to: 'client',
        sort_order: order++,
        description: '',
      }));
    }
    for (const title of template.agency) {
      creates.push(createTask({
        client_id: clientId,
        title,
        assigned_to: 'agency',
        sort_order: order++,
        description: '',
      }));
    }

    await Promise.all(creates);

    return NextResponse.json({
      success: true,
      tasks_added: template.client.length + template.agency.length,
    });
  } catch (err) {
    console.error('POST /admin/clients/:id/add-service error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
