/**
 * Resolves Cognito ID token for the currently signed-in user.
 * Uses LastAuthUser when available (same key pattern as Login.jsx).
 */
export function getIdToken() {
  const CLIENT_ID = "3guikiunvals5vsf05aj56d4je";

  const direct = localStorage.getItem("idToken");
  if (direct) return direct;

  const lastUser = localStorage.getItem(
    `CognitoIdentityServiceProvider.${CLIENT_ID}.LastAuthUser`
  );
  if (lastUser) {
    const token = localStorage.getItem(
      `CognitoIdentityServiceProvider.${CLIENT_ID}.${lastUser}.idToken`
    );
    if (token) return token;
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.endsWith(".idToken")) {
      return localStorage.getItem(key);
    }
  }

  return null;
}
