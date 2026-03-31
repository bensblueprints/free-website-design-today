import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { getClientById, updateClient } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const client = await getClientById(user.clientId);
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { password_hash, ...safe } = client;
    return NextResponse.json(safe);
  } catch (err) {
    console.error('GET /me error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const body = await req.json();
    const allowed = ['google_drive_folder_url', 'welcome_message_dismissed', 'business_name'];
    const updates: Record<string, any> = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await updateClient(user.clientId, updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /me error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
