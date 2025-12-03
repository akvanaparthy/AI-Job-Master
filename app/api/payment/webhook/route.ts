import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyCoinbaseWebhookSignature } from '@/lib/coinbase-commerce';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-cc-webhook-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = verifyCoinbaseWebhookSignature(
      payload,
      signature,
      process.env.COINBASE_WEBHOOK_SECRET || ''
    );

    if (!isValid) {
      console.warn('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const { type, data } = event;

    // Handle charge confirmed event
    if (type === 'charge:confirmed') {
      const { email, plan } = data.metadata || {};

      if (email && plan === 'PLUS') {
        // Update user to PLUS tier
        await prisma.user.update({
          where: { email },
          data: {
            userType: 'PLUS',
            subscriptionId: data.id,
          },
        });

        console.log(`User ${email} upgraded to PLUS`);
      }
    }

    // Handle charge failed event
    if (type === 'charge:failed') {
      const { email } = data.metadata || {};
      console.log(`Payment failed for ${email}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
