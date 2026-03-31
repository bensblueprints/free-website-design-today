import { NextRequest, NextResponse } from 'next/server';
import { getClientFromToken } from '@/lib/portal-auth';
import { getProjectsByClientId, addMessage } from '@/lib/portal-store';

export async function POST(req: NextRequest) {
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

    const { project_id, message } = await req.json();

    if (!project_id || !message?.trim()) {
      return NextResponse.json({ error: 'Project ID and message are required' }, { status: 400 });
    }

    // Verify the project belongs to this client
    const projects = await getProjectsByClientId(client.id);
    const project = projects.find((p: any) => p.id === project_id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const newMessage = await addMessage(project_id, {
      sender_type: 'client',
      sender_name: client.full_name,
      message: message.trim(),
    });

    return NextResponse.json({ message: newMessage });
  } catch (err) {
    console.error('Portal messages error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
