import { NextRequest, NextResponse } from 'next/server';
import { createPlusCharge } from '@/lib/coinbase-commerce';
import { createPlusChargeMock } from '@/lib/coinbase-commerce-mock';

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

    // Check if we should use mock payment (for development/testing)
    const useMockPayment =
      process.env.USE_MOCK_PAYMENT === 'true' ||
      (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_PAYMENT !== 'false');

    let hostedUrl: string;

    if (useMockPayment) {
      console.log('Using MOCK payment flow');
      hostedUrl = await createPlusChargeMock(email, redirectUrl);
    } else {
      console.log('Using REAL Coinbase Commerce payment');
      hostedUrl = await createPlusCharge(email, redirectUrl);
    }

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
