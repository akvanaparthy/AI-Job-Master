// Get or create Coinbase Commerce client
function getClient() {
  try {
    const { Client } = require('coinbase-commerce-node');
    return new Client({
      apiKey: process.env.COINBASE_KEY || '',
    });
  } catch (error) {
    console.error('Failed to initialize Coinbase client:', error);
    return null;
  }
}

export async function createPlusCharge(
  email: string,
  redirectUrl: string
): Promise<string> {
  try {
    const { Charge } = require('coinbase-commerce-node');

    const chargeData = {
      name: 'AI Job Master Plus - Monthly Subscription',
      description: 'Plus plan subscription at $5/month',
      local_price: {
        amount: '5.00',
        currency: 'USD',
      },
      pricing_type: 'fixed_price',
      metadata: {
        email,
        plan: 'PLUS',
        created_at: new Date().toISOString(),
      },
      redirect_url: redirectUrl,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-failed`,
    };

    const charge = await Charge.create(chargeData);
    return charge.hosted_url;
  } catch (error) {
    console.error('Error creating Coinbase charge:', error);
    throw new Error('Failed to create payment charge');
  }
}

export function verifyCoinbaseWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Coinbase Commerce uses HMAC-SHA256 for webhook signatures
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function getChargeById(chargeId: string): Promise<any> {
  try {
    const { Charge } = require('coinbase-commerce-node');
    const charge = await Charge.retrieve(chargeId);
    return charge;
  } catch (error) {
    console.error('Error retrieving charge:', error);
    throw new Error('Failed to retrieve charge');
  }
}

export function isChargeConfirmed(charge: any): boolean {
  // Charge is confirmed when it reaches 'confirmed' status
  return charge.timeline?.some((event: any) => event.status === 'confirmed');
}
