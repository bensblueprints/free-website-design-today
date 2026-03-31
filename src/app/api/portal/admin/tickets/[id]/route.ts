import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { updateTicket } from '@/lib/portal-store';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'status required' }, { status: 400 });
    }

    await updateTicket(id, { status });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /admin/tickets/:id error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
