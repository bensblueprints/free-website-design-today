import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getSettings, updateSettings } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (err) {
    console.error('GET /admin/settings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const body = await req.json();
    const updates: Record<string, string> = {};

    for (const [key, value] of Object.entries(body)) {
      updates[key] = String(value);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    await updateSettings(updates);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /admin/settings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
