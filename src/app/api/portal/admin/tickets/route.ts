import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError, requireAdmin } from '@/lib/portal-api-helpers';
import { getAllTickets, getTicketMessages, getClientById } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;
    const adminErr = requireAdmin(user);
    if (adminErr) return adminErr;

    const tickets = await getAllTickets();

    // Enrich with client info and message count
    const enriched = await Promise.all(
      tickets.map(async (t: any) => {
        const client = await getClientById(t.client_id);
        const messages = await getTicketMessages(t.id);
        return {
          ...t,
          client_name: client?.name || client?.full_name || '',
          client_email: client?.email || '',
          business_name: client?.business_name || '',
          message_count: messages.length,
        };
      })
    );

    // Sort: open first, then by updated_at desc
    enriched.sort((a: any, b: any) => {
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return NextResponse.json(enriched);
  } catch (err) {
    console.error('GET /admin/tickets error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
