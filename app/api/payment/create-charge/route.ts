import { NextRequest, NextResponse } from 'next/server';
import { createPlusCharge } from '@/lib/coinbase-commerce';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/payment/create-charge called');
    const { email } = await request.json();

    console.log('Email received:', email);

    if (!email) {
      console.warn('Email missing from request');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate redirect URL for after payment
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-success?email=${encodeURIComponent(email)}`;
    console.log('Redirect URL:', redirectUrl);
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);

    console.log('Creating Coinbase Commerce payment charge');
    const hostedUrl = await createPlusCharge(email, redirectUrl);

    console.log('Charge created successfully, hosted URL:', hostedUrl);
    return NextResponse.json({ success: true, url: hostedUrl });
  } catch (error: any) {
    console.error('Create charge error:', error?.message || error);
    console.error('Full error:', error);

    // Return more specific error messages
    const errorMessage = error?.message || 'Failed to create payment charge';
    const status = error?.message?.includes('401') ? 401 : 500;

    return NextResponse.json(
      {
        error: 'Failed to create payment charge',
        message: errorMessage
      },
      { status }
    );
  }
}
