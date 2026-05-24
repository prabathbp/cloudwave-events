/**
 * adminCheck.js
 * CloudWave Events Platform — Shared Admin Authorization Helper
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = Buffer.from(base64, 'base64').toString('utf8');
    const claims = JSON.parse(payload);
    const now = Math.floor(Date.now() / 1000);
    if (claims.exp && claims.exp < now) return null;
    return claims;
  } catch {
    return null;
  }
}

function getBearerToken(event) {
  const headers = event.headers || {};
  const authHeader =
    headers.Authorization ||
    headers.authorization ||
    headers.AUTHORIZATION;
  if (!authHeader || typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Cognito returns groups as a JSON-encoded string array or plain string.
 */
function parseGroups(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return String(raw)
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
  }
}

function getGroupsFromAuthorizer(event) {
  const ctx = event.requestContext?.authorizer;
  if (!ctx) return [];

  if (ctx.jwt?.claims) {
    return parseGroups(ctx.jwt.claims['cognito:groups']);
  }

  if (ctx.claims) {
    return parseGroups(ctx.claims['cognito:groups']);
  }

  return [];
}

function getGroupsFromBearerToken(event) {
  const token = getBearerToken(event);
  if (!token) return [];
  const claims = decodeJwtPayload(token);
  if (!claims) return [];
  return parseGroups(claims['cognito:groups']);
}

function getAdminGroups(event) {
  const fromAuthorizer = getGroupsFromAuthorizer(event);
  if (fromAuthorizer.length > 0) return fromAuthorizer;
  return getGroupsFromBearerToken(event);
}

function extractSub(event) {
  try {
    const ctx = event.requestContext?.authorizer;
    if (ctx?.jwt?.claims?.sub) return ctx.jwt.claims.sub;
    if (ctx?.claims?.sub) return ctx.claims.sub;

    const token = getBearerToken(event);
    if (token) {
      const claims = decodeJwtPayload(token);
      if (claims?.sub) return claims.sub;
    }
  } catch {
    // ignore
  }
  return 'unknown';
}

function requireAdmin(event) {
  const groups = getAdminGroups(event);
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

  return null;
}

module.exports = { requireAdmin, corsHeaders };
