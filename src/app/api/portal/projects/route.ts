import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { getClientFromToken } from '@/lib/portal-auth';

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

    const supabase = createServerClient();

    // Fetch projects with milestones, messages, and files
    const { data: projects, error } = await supabase
      .from('portal_projects')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Fetch related data for each project
    const projectsWithDetails = await Promise.all(
      (projects || []).map(async (project) => {
        const [milestones, messages, files] = await Promise.all([
          supabase
            .from('portal_milestones')
            .select('*')
            .eq('project_id', project.id)
            .order('sort_order', { ascending: true }),
          supabase
            .from('portal_messages')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('portal_files')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false }),
        ]);

        return {
          ...project,
          milestones: milestones.data || [],
          messages: messages.data || [],
          files: files.data || [],
        };
      })
    );

    return NextResponse.json({ projects: projectsWithDetails, client });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
