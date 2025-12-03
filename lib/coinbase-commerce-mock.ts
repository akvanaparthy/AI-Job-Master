/**
 * Mock Coinbase Commerce for testing without real payments
 * This simulates the EXACT Coinbase Commerce API responses
 *
 * Real API Reference: https://docs.cdp.coinbase.com/api-reference/commerce-api/rest-api/charges/create-a-charge
 */

/**
 * Exact match to Coinbase Commerce API response format
 * See: https://docs.cdp.coinbase.com/api-reference/commerce-api/rest-api/charges/create-a-charge
 */
export interface MockCharge {
  // Metadata we inject (not from Coinbase)
  metadata?: {
    email: string;
    plan: string;
    created_at: string;
  };

  // ===== EXACT COINBASE API RESPONSE FIELDS =====

  // Core identifiers
  id: string; // UUID format
  code?: string;

  // Charge details
  name: string;
  description: string;
  pricing_type: 'fixed_price' | 'no_price';

  // Pricing information - IMPORTANT: This is the Coinbase format
  pricing: {
    local: {
      amount: string;
      currency: string;
    };
    settlement?: {
      amount: string;
      currency: string;
    };
  };

  // Payment URLs - IMPORTANT: These are "redirects" in Coinbase API
  redirects?: {
    cancel_url: string;
    success_url: string;
    will_redirect_after_success?: boolean;
  };

  // Hosted payment page
  hosted_url: string;

  // Timeline of events
  timeline: Array<{
    status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'FAILED' | 'SIGNED';
    time: string; // ISO 8601
  }>;

  // Timestamps
  created_at: string; // ISO 8601
  confirmed_at?: string; // ISO 8601
  expires_at?: string; // ISO 8601

  // Optional fields
  charge_kind?: string;
  support_email?: string;
  organization_name?: string;
  brand_color?: string;
  brand_logo_url?: string;
}

/**
 * Generate a mock charge ID in UUID format (same as Coinbase)
 * Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 */
function generateMockChargeId(): string {
  // Generate UUID v4-like format for consistency with real Coinbase
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `mock-${uuid}`; // Prefix with "mock-" so it's clear it's not real
}

/**
 * Create a mock charge for testing
 * Returns a URL that simulates the Coinbase hosted payment page
 */
export async function createPlusChargeMock(
  email: string,
  redirectUrl: string
): Promise<string> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const chargeId = generateMockChargeId();

  console.log('Creating MOCK charge for email:', email);
  console.log('Mock Charge ID:', chargeId);

  // Return the mock payment page URL
  // This page will simulate the payment process
  const mockPaymentUrl = new URL('/api/payment/mock-checkout', process.env.NEXT_PUBLIC_APP_URL!);
  mockPaymentUrl.searchParams.set('chargeId', chargeId);
  mockPaymentUrl.searchParams.set('email', email);
  mockPaymentUrl.searchParams.set('redirect', redirectUrl);
  mockPaymentUrl.searchParams.set('amount', '5.00');

  return mockPaymentUrl.toString();
}

/**
 * Create and store a mock charge in memory for the test session
 * In production, this would be persisted in a database
 */
const mockChargesStore = new Map<string, MockCharge>();

export function saveMockCharge(chargeId: string, charge: MockCharge): void {
  mockChargesStore.set(chargeId, charge);
  console.log('Mock charge saved:', chargeId);
}

export function getMockCharge(chargeId: string): MockCharge | undefined {
  return mockChargesStore.get(chargeId);
}

export function getAllMockCharges(): Array<MockCharge> {
  return Array.from(mockChargesStore.values());
}

export function clearMockCharges(): void {
  mockChargesStore.clear();
  console.log('All mock charges cleared');
}

/**
 * Simulate confirming a payment (like Coinbase would)
 */
export function confirmMockCharge(chargeId: string): MockCharge | null {
  const charge = mockChargesStore.get(chargeId);
  if (!charge) return null;

  // Add confirmed event to timeline
  charge.timeline.push({
    status: 'confirmed',
    time: new Date().toISOString(),
  });

  mockChargesStore.set(chargeId, charge);
  console.log('Mock charge confirmed:', chargeId);
  return charge;
}

/**
 * Simulate failing a payment
 */
export function failMockCharge(chargeId: string): MockCharge | null {
  const charge = mockChargesStore.get(chargeId);
  if (!charge) return null;

  charge.timeline.push({
    status: 'failed',
    time: new Date().toISOString(),
  });

  mockChargesStore.set(chargeId, charge);
  console.log('Mock charge failed:', chargeId);
  return charge;
}
