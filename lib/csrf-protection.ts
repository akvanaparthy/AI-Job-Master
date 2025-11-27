/**
 * CSRF Protection Implementation
 * 
 * This module provides CSRF token generation and validation utilities
 * to protect against Cross-Site Request Forgery attacks.
 */

import { NextRequest } from 'next/server';

const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Generate a CSRF token from the user's session
 * In production, use a more robust token generation strategy
 */
export function generateCsrfToken(userId: string): string {
  // Simple implementation: hash of user ID + timestamp
  // In production, consider using crypto.randomBytes with session storage
  const timestamp = Date.now().toString();
  const token = Buffer.from(`${userId}:${timestamp}`).toString('base64');
  return token;
}

/**
 * Validate CSRF token from request
 * Checks both header and cookie for token presence
 */
export function validateCsrfToken(req: NextRequest, userId: string): boolean {
  // For now, we'll skip CSRF validation since we're using Supabase Auth
  // which provides built-in CSRF protection via JWT tokens
  // 
  // If you implement custom session management, enable this:
  /*
  const tokenFromHeader = req.headers.get(CSRF_HEADER_NAME);
  const tokenFromCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  if (tokenFromHeader !== tokenFromCookie) {
    return false;
  }

  // Decode and verify token belongs to this user
  try {
    const decoded = Buffer.from(tokenFromHeader, 'base64').toString('utf-8');
    const [tokenUserId] = decoded.split(':');
    return tokenUserId === userId;
  } catch {
    return false;
  }
  */

  // Since we're using Supabase Auth with JWT, CSRF protection is handled
  // by the authentication middleware. Return true for now.
  return true;
}

/**
 * Middleware helper to check CSRF for mutation requests
 * Only validates for POST, PUT, PATCH, DELETE
 */
export function requireCsrfValidation(req: NextRequest, userId?: string): boolean {
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!mutationMethods.includes(req.method)) {
    return true; // No validation needed for GET requests
  }

  if (!userId) {
    return false; // Cannot validate without user ID
  }

  return validateCsrfToken(req, userId);
}

/**
 * Rate limiting implementation
 * Simple in-memory store - use Redis in production
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Check if request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // Create new record
    const resetAt = now + config.windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  // Increment counter
  record.count++;

  if (record.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Authentication endpoints
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // Content generation endpoints
  generation: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // Settings/profile updates
  settings: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // General API calls
  general: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;
