const COGNITO_URL = 'https://cognito-idp.ap-southeast-1.amazonaws.com/';
const CLIENT_ID = '3guikiunvals5vsf05aj56d4je';

async function cognitoRequest(target, payload) {
  const res = await fetch(COGNITO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': target,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Cognito request failed');
  }
  return data;
}

export async function registerUser(email, password) {
  await cognitoRequest('AWSCognitoIdentityProviderService.SignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [{ Name: 'email', Value: email }],
  });
}

export async function confirmUser(email, code) {
  await cognitoRequest('AWSCognitoIdentityProviderService.ConfirmSignUp', {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });
}

export async function logoutUser() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes('CognitoIdentityServiceProvider') || key === 'idToken')
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}
