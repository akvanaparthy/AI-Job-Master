import { NextRequest, NextResponse } from 'next/server';
import { saveMockCharge, confirmMockCharge } from '@/lib/coinbase-commerce-mock';

/**
 * Mock Checkout Page Handler
 * This simulates the Coinbase hosted payment page
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const chargeId = searchParams.get('chargeId');
  const email = searchParams.get('email');
  const redirectUrl = searchParams.get('redirect');
  const amount = searchParams.get('amount');

  if (!chargeId || !email || !redirectUrl || !amount) {
    return new NextResponse('Missing required parameters', { status: 400 });
  }

  // Create the mock charge object matching EXACT Coinbase API format
  // Reference: https://docs.cdp.coinbase.com/api-reference/commerce-api/rest-api/charges/create-a-charge
  const mockCharge = {
    // Core fields matching Coinbase response format
    id: chargeId,
    name: 'AI Job Master Plus - Monthly Subscription',
    description: 'Plus plan subscription at $5/month',
    pricing_type: 'fixed_price',

    // IMPORTANT: Pricing format matches Coinbase exactly
    pricing: {
      local: {
        amount: amount,
        currency: 'USD',
      },
    },

    // IMPORTANT: Redirects use this format in Coinbase API
    redirects: {
      success_url: redirectUrl,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-failed`,
      will_redirect_after_success: true,
    },

    // Hosted payment page URL
    hosted_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/mock-checkout?chargeId=${chargeId}&email=${email}&redirect=${redirectUrl}&amount=${amount}`,

    // Timeline with proper Coinbase status values
    timeline: [
      {
        status: 'NEW',
        time: new Date().toISOString(),
      },
    ],

    // Timestamps
    created_at: new Date().toISOString(),

    // Custom metadata we add for tracking (not in real Coinbase response)
    metadata: {
      email,
      plan: 'PLUS',
      created_at: new Date().toISOString(),
    },
  };

  // Save the mock charge
  saveMockCharge(chargeId, mockCharge as any);

  // Return HTML that simulates Coinbase's payment page
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mock Payment - Coinbase Commerce</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
          padding: 40px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
          color: #1a1a1a;
        }

        .header p {
          color: #666;
          font-size: 14px;
        }

        .warning {
          background: #fef3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 24px;
          color: #856404;
          font-size: 13px;
        }

        .payment-details {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #666;
          font-size: 14px;
        }

        .detail-value {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 14px;
        }

        .amount {
          font-size: 32px;
          font-weight: bold;
          color: #667eea;
          text-align: center;
          margin: 20px 0;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        button {
          flex: 1;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-pay {
          background: #667eea;
          color: white;
        }

        .btn-pay:hover {
          background: #5568d3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-cancel {
          background: #e9ecef;
          color: #666;
        }

        .btn-cancel:hover {
          background: #dee2e6;
        }

        .footer {
          text-align: center;
          margin-top: 20px;
          color: #999;
          font-size: 12px;
        }

        .loading {
          display: none;
          text-align: center;
          padding: 20px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Complete Payment</h1>
          <p>Mock Coinbase Commerce - Test Mode</p>
        </div>

        <div class="warning">
          ⚠️ This is a <strong>TEST PAYMENT</strong> - No real money will be charged
        </div>

        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Email</span>
            <span class="detail-value">${email}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Plan</span>
            <span class="detail-value">AI Job Master Plus</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Billing Period</span>
            <span class="detail-value">Monthly</span>
          </div>
        </div>

        <div class="amount">$${amount}</div>

        <div class="action-buttons">
          <button class="btn-pay" onclick="confirmPayment()">Complete Payment</button>
          <button class="btn-cancel" onclick="cancelPayment()">Cancel</button>
        </div>

        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p>Processing payment...</p>
        </div>

        <div class="footer">
          Charge ID: <code>${chargeId}</code>
        </div>
      </div>

      <script>
        function confirmPayment() {
          const btn = document.querySelector('.btn-pay');
          btn.disabled = true;
          document.getElementById('loading').style.display = 'block';

          // Simulate payment processing
          setTimeout(() => {
            // Send webhook notification to backend
            fetch('/api/payment/test-webhook-trigger', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chargeId: '${chargeId}',
                email: '${email}',
                action: 'confirm'
              })
            }).then(() => {
              // Redirect to success page
              window.location.href = decodeURIComponent('${redirectUrl}');
            }).catch(err => {
              console.error('Webhook error:', err);
              alert('Error processing payment. Check console.');
              btn.disabled = false;
              document.getElementById('loading').style.display = 'none';
            });
          }, 1500);
        }

        function cancelPayment() {
          window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}/auth/payment-failed';
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
