/**
 * adminCheck.js
 * CloudWave Events Platform — Shared Admin Authorization Helper
 *
 * Usage in any Lambda handler:
 *   const { requireAdmin, corsHeaders } = require('../utils/adminCheck');
 *   const authError = requireAdmin(event);
 *   if (authError) return authError;
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

/**
 * Reads Cognito groups injected by API Gateway JWT Authorizer
 * and returns a 403 response if the caller is not in "admin" group.
 *
 * API Gateway (Cognito Authorizer) injects claims into:
 *   event.requestContext.authorizer.jwt.claims   (HTTP API v2)
 *   event.requestContext.authorizer.claims        (REST API v1)
 *
 * @param {object} event - Lambda event object
 * @returns {object|null} - 403 response object, or null if user IS admin
 */
function requireAdmin(event) {
  let groups = [];

  try {
    // Support both REST API (v1) and HTTP API (v2) authorizer claim formats
    const ctx = event.requestContext?.authorizer;

    if (ctx?.jwt?.claims) {
      // HTTP API v2 with JWT Authorizer
      const raw = ctx.jwt.claims['cognito:groups'];
      groups = parseGroups(raw);
    } else if (ctx?.claims) {
      // REST API v1 with Cognito User Pool Authorizer
      const raw = ctx.claims['cognito:groups'];
      groups = parseGroups(raw);
    }
  } catch (err) {
    console.error('[adminCheck] Failed to parse authorizer claims:', err);
  }

  const sub = extractSub(event);
  console.log(`[adminCheck] User ${sub} — groups: ${JSON.stringify(groups)}`);

  if (!groups.includes('admin')) {
    return {
      statusCode: 403,
      headers: corsHeaders,
      body: JSON.stringify({
        message: 'Only admin users can perform this action.',
        code: 'FORBIDDEN',
      }),
    };
  }

  return null; // User is admin — allow request to proceed
}

/**
 * Cognito returns groups as a JSON-encoded string array or plain string.
 * Handles both: ["admin","users"] and admin,users
 */
function parseGroups(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Fallback: comma-separated string
    return raw.split(',').map((g) => g.trim());
  }
}

/** Extract sub (user ID) for CloudWatch logging */
function extractSub(event) {
  try {
    const ctx = event.requestContext?.authorizer;
    return (
      ctx?.jwt?.claims?.sub ||
      ctx?.claims?.sub ||
      'unknown'
    );
  } catch {
    return 'unknown';
  }
}

module.exports = { requireAdmin, corsHeaders };
