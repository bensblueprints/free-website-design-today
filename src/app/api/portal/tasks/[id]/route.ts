import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getTaskById, updateTask, deleteTask } from '@/lib/portal-store';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['pending', 'in_progress', 'complete'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const task = await getTaskById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // Non-admin can only update their own client-assigned tasks
    if (!user.is_admin) {
      if (task.client_id !== user.clientId || task.assigned_to !== 'client') {
        return NextResponse.json({ error: 'Task not found or not editable' }, { status: 404 });
      }
    }

    const updated = await updateTask(id, { status });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /tasks/:id error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const { id } = await params;
    await deleteTask(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /tasks/:id error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
