import { NextRequest, NextResponse } from 'next/server';
import { getClientFromToken } from '@/lib/portal-auth';
import { getProjectsByClientId } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientFromToken(token);
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = await getProjectsByClientId(client.id);

    return NextResponse.json({ projects, client });
  } catch (err) {
    console.error('Portal projects error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
