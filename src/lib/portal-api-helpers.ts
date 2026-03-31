import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './portal-auth';
import { getClientById } from './portal-store';

export type AuthUser = {
  clientId: string;
  email: string;
  is_admin: boolean;
  role: string;
};

/**
 * Extract and verify the authenticated user from the request.
 * Returns the user object or a 401 NextResponse.
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthUser | NextResponse> {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await getClientById(payload.id);
  if (!client) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return {
    clientId: client.id,
    email: client.email,
    is_admin: client.is_admin || client.role === 'admin',
    role: client.role || (client.is_admin ? 'admin' : 'client'),
  };
}

/** Check if result is an error response (NextResponse) or a valid user */
export function isAuthError(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

/** Return 403 if user is not admin */
export function requireAdmin(user: AuthUser): NextResponse | null {
  if (!user.is_admin && user.role !== 'admin') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  return null;
}

export function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
