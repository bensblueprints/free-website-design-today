import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthError } from '@/lib/portal-api-helpers';
import { createPaymentAuth } from '@/lib/portal-store';

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (isAuthError(user)) return user;

    const body = await req.json();
    const { platform, cardholder_name, last_four_digits, card_brand, authorization_note } = body;

    if (!platform || !cardholder_name || !last_four_digits) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (last_four_digits.length !== 4) {
      return NextResponse.json({ error: 'last_four_digits must be 4 chars' }, { status: 400 });
    }

    const record = await createPaymentAuth({
      client_id: user.clientId,
      platform,
      cardholder_name,
      last_four_digits,
      card_brand: card_brand || '',
      authorization_note: authorization_note || '',
    });

    return NextResponse.json(record);
  } catch (err) {
    console.error('POST /payment-auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
