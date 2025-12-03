import { NextRequest, NextResponse } from 'next/server';
import { confirmMockCharge, failMockCharge, getMockCharge } from '@/lib/coinbase-commerce-mock';
import { prisma } from '@/lib/db/prisma';

/**
 * Test webhook trigger endpoint
 * This endpoint allows triggering webhook events in development mode without real payments
 *
 * Development only - should not be accessible in production
 */
export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { chargeId, email, action } = await request.json();

    console.log(`Test webhook triggered: action=${action}, chargeId=${chargeId}, email=${email}`);

    if (!chargeId || !email) {
      return NextResponse.json(
        { error: 'chargeId and email are required' },
        { status: 400 }
      );
    }

    let charge;

    if (action === 'confirm') {
      // Confirm the payment
      charge = confirmMockCharge(chargeId);

      if (!charge) {
        return NextResponse.json(
          { error: 'Mock charge not found' },
          { status: 404 }
        );
      }

      // Update user to PLUS tier (simulate webhook behavior)
      try {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: {
            userType: 'PLUS',
            subscriptionId: chargeId,
          },
        });

        console.log(`User ${email} upgraded to PLUS tier`);
        console.log('Updated user:', updatedUser);

        return NextResponse.json({
          success: true,
          message: 'Payment confirmed and user upgraded',
          charge,
          user: updatedUser,
        });
      } catch (dbError: any) {
        console.error('Database error updating user:', dbError);

        // If user doesn't exist, create them first (for testing)
        if (dbError.code === 'P2025') {
          console.log('User not found, would need to be created first in signup flow');
          return NextResponse.json(
            {
              success: false,
              error: 'User not found. Complete signup first.',
              charge,
            },
            { status: 404 }
          );
        }

        throw dbError;
      }
    } else if (action === 'fail') {
      // Fail the payment
      charge = failMockCharge(chargeId);

      if (!charge) {
        return NextResponse.json(
          { error: 'Mock charge not found' },
          { status: 404 }
        );
      }

      console.log(`Payment failed for ${email}`);

      return NextResponse.json({
        success: true,
        message: 'Payment marked as failed',
        charge,
      });
    } else {
      return NextResponse.json(
        { error: `Unknown action: ${action}. Use 'confirm' or 'fail'` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Test webhook trigger error:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger webhook',
        message: (error as any)?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
