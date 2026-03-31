import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getClientFromToken } from '@/lib/portal-auth';

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

    const supabase = createServerClient();

    // Verify the project belongs to this client
    const { data: project } = await supabase
      .from('portal_projects')
      .select('id')
      .eq('id', project_id)
      .eq('client_id', client.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: newMessage, error } = await supabase
      .from('portal_messages')
      .insert({
        project_id,
        sender_type: 'client',
        sender_name: client.full_name,
        message: message.trim(),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message: newMessage });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
