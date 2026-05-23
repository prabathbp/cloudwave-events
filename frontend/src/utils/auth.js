/**
 * auth.js
 * CloudWave Events Platform — Frontend Auth Utilities
 *
 * Decodes the Cognito JWT stored by Amplify/Cognito in localStorage
 * and exposes helper functions for role-based UI logic.
 */

/**
 * Decodes the payload of a JWT token (no signature verification — that's
 * the backend's job; frontend only needs the claims for UI display).
 *
 * @param {string} token
 * @returns {object|null}
 */
export function decodeJwt(token) {
  try {
    // JWT structure: header.payload.signature
    const base64Payload = token.split('.')[1];
    // Base64url → Base64
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Retrieves the Cognito ID token from localStorage.
 * Amplify v5/v6 stores it under keys like:
 *   CognitoIdentityServiceProvider.<clientId>.<username>.idToken
 *
 * Falls back to a generic 'idToken' key for custom implementations.
 *
 * @returns {string|null}
 */
export function getIdToken() {
  // Try generic key first (most common custom Cognito setup)
  const direct = localStorage.getItem('idToken');
  if (direct) return direct;

  // Try Amplify v5 key pattern
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith('.idToken')) {
      return localStorage.getItem(key);
    }
  }

  // Try Amplify v6 / cognito-identity-js pattern
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('CognitoIdentityServiceProvider') && key.endsWith('idToken')) {
      return localStorage.getItem(key);
    }
  }

  return null;
}

/**
 * Returns the decoded claims from the currently stored ID token.
 * @returns {object|null}
 */
export function getCurrentUserClaims() {
  const token = getIdToken();
  if (!token) return null;
  return decodeJwt(token);
}

/**
 * Returns true if the logged-in user belongs to the Cognito "admin" group.
 * @returns {boolean}
 */
export function isAdmin() {
  const claims = getCurrentUserClaims();
  if (!claims) return false;

  const groups = claims['cognito:groups'];
  if (!groups) return false;

  if (Array.isArray(groups)) return groups.includes('admin');
  if (typeof groups === 'string') {
    // Could be JSON array string or comma-separated
    try {
      const parsed = JSON.parse(groups);
      return Array.isArray(parsed) && parsed.includes('admin');
    } catch {
      return groups.split(',').map((g) => g.trim()).includes('admin');
    }
  }

  return false;
}

/**
 * Returns the username/email from the current token for display.
 * @returns {string}
 */
export function getCurrentUserEmail() {
  const claims = getCurrentUserClaims();
  return claims?.email || claims?.['cognito:username'] || '';
}

/**
 * Checks whether a valid (non-expired) token exists.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const claims = getCurrentUserClaims();
  if (!claims) return false;
  const now = Math.floor(Date.now() / 1000);
  return claims.exp ? claims.exp > now : false;
}
