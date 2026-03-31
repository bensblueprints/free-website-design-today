import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { getTicketsByClientId, createTicket, addTicketMessage, getClientById } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const tickets = await getTicketsByClientId(user.clientId);
    return NextResponse.json(tickets);
  } catch (err) {
    console.error('GET /tickets error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const body = await req.json();
    const { subject, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // Get client name
    const client = await getClientById(user.clientId);
    const senderName = client?.name || client?.full_name || user.email;

    // Create ticket
    const ticket = await createTicket({
      client_id: user.clientId,
      subject: subject || 'Support Request',
    });

    // Add first message
    await addTicketMessage(ticket.id, {
      sender_type: 'client',
      sender_name: senderName,
      message,
    });

    return NextResponse.json({ ticket, success: true });
  } catch (err) {
    console.error('POST /tickets error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
