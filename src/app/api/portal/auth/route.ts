import { NextRequest, NextResponse } from 'next/server';
import { createToken, hashPassword, verifyPassword } from '@/lib/portal-auth';
import { getClientByEmail, createClient } from '@/lib/portal-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'signup') {
      const { full_name, business_name, email, password } = body;

      if (!full_name || !email || !password) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const existing = await getClientByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const password_hash = await hashPassword(password);

      const client = await createClient({
        full_name,
        business_name: business_name || undefined,
        email,
        password_hash,
      });

      const token = await createToken({ id: client.id, email: client.email });

      const { password_hash: _, ...safeClient } = client;
      return NextResponse.json({ token, client: safeClient });
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const client = await getClientByEmail(email);
      if (!client) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!client.is_active) {
        return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
      }

      const valid = await verifyPassword(password, client.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const token = await createToken({ id: client.id, email: client.email });

      return NextResponse.json({
        token,
        client: {
          id: client.id,
          full_name: client.full_name,
          business_name: client.business_name,
          email: client.email,
          created_at: client.created_at,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Portal auth error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
