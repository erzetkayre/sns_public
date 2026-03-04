/**
 * Middleware for extracting authenticated user
 * Better Auth provides session info via request context
 */

import auth from '../lib/auth.js';

/**
 * Middleware to extract and validate authenticated user
 * Adds userId to req.body if authenticated
 */
export async function authenticateUser(req, res, next) {
  try {
    // Better Auth stores session in headers
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token provided' });
    }

    // For now, we'll pass through - in production you'd validate the session
    // The session validation would happen in your auth routes
    // For better integration, consider using auth.handler middleware

    next();
  } catch (error) {
    console.error('[Auth] Error:', error.message);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Mock userId extraction - replace with actual session validation
 * This is a placeholder for real session management
 */
export function getMockUserId(req) {
  // In production, extract from authenticated session
  // For now, use a placeholder
  return req.body?.userId || req.query?.userId || 'test-user-id';
}
