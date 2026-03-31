import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { createToken, hashPassword, verifyPassword } from '@/lib/portal-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const supabase = createServerClient();

    if (action === 'signup') {
      const { full_name, business_name, email, password } = body;

      if (!full_name || !email || !password) {
        return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('portal_clients')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();

      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }

      const password_hash = await hashPassword(password);

      const { data: client, error } = await supabase
        .from('portal_clients')
        .insert({
          full_name,
          business_name: business_name || null,
          email: email.toLowerCase(),
          password_hash,
        })
        .select('id, full_name, business_name, email, created_at')
        .single();

      if (error) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }

      const token = await createToken({ id: client.id, email: client.email });

      return NextResponse.json({ token, client });
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const { data: client } = await supabase
        .from('portal_clients')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
