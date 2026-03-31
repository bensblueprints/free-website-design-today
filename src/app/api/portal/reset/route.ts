import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/portal-auth';
import { getClientByEmail } from '@/lib/portal-store';
import { getStore } from '@netlify/blobs';

export async function POST(req: NextRequest) {
  try {
    const { email, new_password, admin_key } = await req.json();

    // Simple admin protection
    if (admin_key !== 'fwd-reset-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientByEmail(email);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const password_hash = await hashPassword(new_password);
    const updated = { ...client, password_hash, updated_at: new Date().toISOString() };

    const store = getStore({ name: 'portal-clients', consistency: 'strong' });
    await store.setJSON(`id:${client.id}`, updated);
    await store.setJSON(`email:${client.email}`, updated);

    return NextResponse.json({ success: true, email: client.email });
  } catch (err) {
    console.error('Reset error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
