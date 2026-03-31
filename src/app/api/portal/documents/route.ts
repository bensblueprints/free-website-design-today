import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { getDocumentsByClientId, createDocument } from '@/lib/portal-store';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const clientIdParam = req.nextUrl.searchParams.get('client_id');
    const clientId = (clientIdParam && user.is_admin) ? clientIdParam : user.clientId;

    const docs = await getDocumentsByClientId(clientId);
    return NextResponse.json(docs);
  } catch (err) {
    console.error('GET /documents error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const body = await req.json();
    const { file_name, file_data, document_type } = body;

    if (!file_name || !file_data) {
      return NextResponse.json({ error: 'file_name and file_data required' }, { status: 400 });
    }

    const clientId = (body.client_id && user.is_admin) ? body.client_id : user.clientId;

    const doc = await createDocument({
      client_id: clientId,
      file_name,
      file_data,
      document_type: document_type || 'other',
      uploaded_by: user.is_admin ? 'agency' : 'client',
    });

    return NextResponse.json(doc);
  } catch (err) {
    console.error('POST /documents error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
