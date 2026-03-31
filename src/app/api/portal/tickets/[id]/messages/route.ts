import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { getTicketById, getTicketMessages, addTicketMessage, updateTicket, getClientById } from '@/lib/portal-store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const { id } = await params;
    const ticket = await getTicketById(id);
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Verify access
    if (!user.is_admin && ticket.client_id !== user.clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await getTicketMessages(id);
    return NextResponse.json({ ticket, messages });
  } catch (err) {
    console.error('GET /tickets/:id/messages error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const { id } = await params;
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const ticket = await getTicketById(id);
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Verify access
    if (!user.is_admin && ticket.client_id !== user.clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isAdmin = user.is_admin;
    const client = await getClientById(user.clientId);
    const senderName = isAdmin ? 'Free Website Design Today' : (client?.name || client?.full_name || user.email);

    await addTicketMessage({
      ticket_id: id,
      sender_type: isAdmin ? 'agency' : 'client',
      sender_name: senderName,
      message,
    });

    // Update ticket status
    await updateTicket(id, { status: isAdmin ? 'answered' : 'open' });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /tickets/:id/messages error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
