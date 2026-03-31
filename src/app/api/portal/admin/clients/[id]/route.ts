import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getClientById, updateClient, deleteClient } from '@/lib/portal-store';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const { id } = await params;
    const body = await req.json();

    const allowed = ['name', 'full_name', 'email', 'business_name', 'service_type', 'onboarding_status', 'is_admin', 'role'];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    // Keep name and full_name in sync
    if (updates.name && !updates.full_name) updates.full_name = updates.name;
    if (updates.full_name && !updates.name) updates.name = updates.full_name;

    const updated = await updateClient(id, updates);
    if (!updated) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    const { password_hash, ...safe } = updated;
    return NextResponse.json(safe);
  } catch (err) {
    console.error('PATCH /admin/clients/:id error:', err);
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
    const client = await getClientById(id);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    await deleteClient(id);

    return NextResponse.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    console.error('DELETE /admin/clients/:id error:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
