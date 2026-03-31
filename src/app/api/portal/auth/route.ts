import { NextRequest, NextResponse } from 'next/server';
import { createToken, hashPassword, verifyPassword } from '@/lib/portal-auth';
import { getClientByEmail, createClient } from '@/lib/portal-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'signup') {
      const { name, full_name, business_name, email, password } = body;
      const clientName = name || full_name;

      if (!clientName || !email || !password) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      const existing = await getClientByEmail(email);
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
      }

      const password_hash = await hashPassword(password);

      const client = await createClient({
        name: clientName,
        full_name: clientName,
        business_name: business_name || '',
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
        return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
      }

      const client = await getClientByEmail(email);
      if (!client) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      if (!client.password_hash) {
        return NextResponse.json({ error: 'No password set. Contact support.' }, { status: 401 });
      }

      if (!client.is_active) {
        return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
      }

      const valid = await verifyPassword(password, client.password_hash);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const role = client.role || (client.is_admin ? 'admin' : 'client');
      const token = await createToken({ id: client.id, email: client.email });

      return NextResponse.json({
        token,
        client: {
          id: client.id,
          name: client.name || client.full_name,
          email: client.email,
          business_name: client.business_name,
          service_type: client.service_type,
          is_admin: client.is_admin || role === 'admin',
          role,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Portal auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
