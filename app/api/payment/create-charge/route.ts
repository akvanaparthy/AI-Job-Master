import { NextRequest, NextResponse } from 'next/server';
import { createPlusCharge } from '@/lib/coinbase-commerce';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate redirect URL for after payment
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-success?email=${encodeURIComponent(email)}`;

    // Create Coinbase Commerce charge
    const hostedUrl = await createPlusCharge(email, redirectUrl);

    return NextResponse.json({ success: true, url: hostedUrl });
  } catch (error) {
    console.error('Create charge error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment charge' },
      { status: 500 }
    );
  }
}
