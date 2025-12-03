import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Test Webhook Endpoint
 * Mimics the Coinbase Commerce "Send test" webhook feature
 * Allows you to test webhook handling without real payments
 *
 * This endpoint generates a realistic webhook payload and sends it
 * to your webhook endpoint with proper Coinbase signature verification
 */

// Types for webhook payloads
type WebhookEventType = 'charge:created' | 'charge:confirmed' | 'charge:failed';

interface WebhookPayload {
  type: WebhookEventType;
  data: {
    id: string;
    resource: string;
    created_at: string;
    updated_at: string;
    code: string;
    name: string;
    description: string;
    hosted_url: string;
    created_by: string;
    metadata: {
      email: string;
      plan: string;
      created_at?: string;
    };
    timeline: Array<{
      status: string;
      time: string;
      context?: string;
    }>;
    pricing_type: string;
    pricing: {
      local: {
        amount: string;
        currency: string;
      };
    };
    redirects?: {
      success_url: string;
      cancel_url: string;
      will_redirect_after_success?: boolean;
    };
  };
}

/**
 * Generate a realistic Coinbase charge ID (UUID format)
 */
function generateChargeId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a realistic webhook payload based on event type
 */
function createWebhookPayload(
  eventType: WebhookEventType,
  email: string,
  plan: string
): WebhookPayload {
  const chargeId = generateChargeId();
  const now = new Date().toISOString();

  const basePayload: WebhookPayload = {
    type: eventType,
    data: {
      id: chargeId,
      resource: 'charge',
      created_at: now,
      updated_at: now,
      code: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      name: 'AI Job Master Plus - Monthly Subscription',
      description: 'Plus plan subscription at $5/month',
      hosted_url: `https://commerce.coinbase.com/charges/${chargeId}`,
      created_by: 'webhook_test@coinbase.com',
      metadata: {
        email,
        plan,
        created_at: now,
      },
      timeline: [
        {
          status: 'NEW',
          time: new Date(Date.now() - 60000).toISOString(),
        },
      ],
      pricing_type: 'fixed_price',
      pricing: {
        local: {
          amount: '5.00',
          currency: 'USD',
        },
      },
      redirects: {
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-success?email=${encodeURIComponent(email)}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-failed`,
        will_redirect_after_success: true,
      },
    },
  };

  // Add timeline event based on event type
  if (eventType === 'charge:confirmed') {
    basePayload.data.timeline.push({
      status: 'CONFIRMED',
      time: now,
    });
  } else if (eventType === 'charge:failed') {
    basePayload.data.timeline.push({
      status: 'FAILED',
      time: now,
      context: 'Charge expired',
    });
  }

  return basePayload;
}

/**
 * Sign webhook payload like Coinbase does
 */
function signWebhookPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode for security
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Test webhook endpoint not available in production' },
        { status: 403 }
      );
    }

    const { event_type, email, plan } = await request.json();

    // Validate inputs
    if (!event_type) {
      return NextResponse.json(
        {
          error: 'Missing event_type',
          supported_types: ['charge:created', 'charge:confirmed', 'charge:failed'],
        },
        { status: 400 }
      );
    }

    if (!email || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: email, plan' },
        { status: 400 }
      );
    }

    const supportedEvents: WebhookEventType[] = [
      'charge:created',
      'charge:confirmed',
      'charge:failed',
    ];

    if (!supportedEvents.includes(event_type)) {
      return NextResponse.json(
        {
          error: `Unsupported event_type: ${event_type}`,
          supported: supportedEvents,
        },
        { status: 400 }
      );
    }

    // Create webhook payload
    const payload = createWebhookPayload(event_type, email, plan);
    const payloadString = JSON.stringify(payload);

    // Sign the payload using webhook secret
    const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: 'COINBASE_WEBHOOK_SECRET not configured' },
        { status: 500 }
      );
    }

    const signature = signWebhookPayload(payloadString, webhookSecret);

    // Send webhook to our own webhook handler
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;

    console.log('Sending test webhook...');
    console.log('Event Type:', event_type);
    console.log('Email:', email);
    console.log('Webhook URL:', webhookUrl);
    console.log('Payload:', payload);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Webhook-Signature': signature,
      },
      body: payloadString,
    });

    const webhookResponseText = await webhookResponse.text();
    let webhookResponseData;

    try {
      webhookResponseData = JSON.parse(webhookResponseText);
    } catch {
      webhookResponseData = { raw: webhookResponseText };
    }

    if (!webhookResponse.ok) {
      console.error('Webhook handler returned error:', webhookResponseData);
      return NextResponse.json(
        {
          error: 'Webhook handler failed',
          status: webhookResponse.status,
          message: webhookResponseData,
        },
        { status: 400 }
      );
    }

    console.log('Test webhook sent successfully');
    console.log('Webhook response:', webhookResponseData);

    // Return success response with details
    return NextResponse.json(
      {
        success: true,
        message: `Test webhook (${event_type}) sent successfully`,
        details: {
          event_type,
          email,
          plan,
          charge_id: payload.data.id,
          signature_verified: true,
          webhook_response: webhookResponseData,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test webhook',
        message: (error as any)?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to show available test event types and usage
 */
export async function GET() {
  return NextResponse.json({
    message: 'Test Webhook Endpoint',
    description:
      'Send test webhooks to validate webhook handler. Development only.',
    usage: {
      endpoint: 'POST /api/payment/test-webhook',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        event_type: 'charge:confirmed | charge:created | charge:failed',
        email: 'test@example.com',
        plan: 'PLUS',
      },
      example: {
        command:
          'curl -X POST http://localhost:3000/api/payment/test-webhook -H "Content-Type: application/json" -d \'{"event_type":"charge:confirmed","email":"test@example.com","plan":"PLUS"}\'',
      },
    },
    supported_events: [
      {
        type: 'charge:created',
        description: 'Sent when a new charge is created',
      },
      {
        type: 'charge:confirmed',
        description: 'Sent when payment is confirmed (money received)',
      },
      {
        type: 'charge:failed',
        description: 'Sent when payment fails (expired, rejected, etc)',
      },
    ],
    environment: process.env.NODE_ENV,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
  });
}
