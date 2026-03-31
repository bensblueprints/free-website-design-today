import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { getDocumentById, deleteDocument } from '@/lib/portal-store';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const { id } = await params;
    const doc = await getDocumentById(id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Check access
    if (!user.is_admin && doc.client_id !== user.clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return the base64 file data as a binary download
    const buffer = Uint8Array.from(atob(doc.file_data), c => c.charCodeAt(0));
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${doc.file_name}"`,
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (err) {
    console.error('GET /documents/:id error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const { id } = await params;
    const doc = await getDocumentById(id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Non-admin can only delete own documents
    if (!user.is_admin && doc.client_id !== user.clientId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteDocument(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /documents/:id error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
