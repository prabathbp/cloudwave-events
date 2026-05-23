import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = 'https://d307hyj1i7.execute-api.ap-southeast-1.amazonaws.com/dev';
const USER_POOL_ID = 'ap-southeast-1_oghlS18u1';
const CLIENT_ID = '3guikiunvals5vsf05aj56d4je';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `https://cognito-idp.ap-southeast-1.amazonaws.com/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-amz-json-1.1',
            'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          },
          body: JSON.stringify({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: CLIENT_ID,
            AuthParameters: {
              USERNAME: email,
              PASSWORD: password,
            },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const idToken = data.AuthenticationResult?.IdToken;
      const accessToken = data.AuthenticationResult?.AccessToken;
      const refreshToken = data.AuthenticationResult?.RefreshToken;

      if (!idToken) {
        setError('Login failed — no token received.');
        setLoading(false);
        return;
      }

      // Store tokens using Cognito key pattern so auth.js can find them
      const key = `CognitoIdentityServiceProvider.${CLIENT_ID}.${email}`;
      localStorage.setItem(`${key}.idToken`, idToken);
      localStorage.setItem(`${key}.accessToken`, accessToken);
      localStorage.setItem(`${key}.refreshToken`, refreshToken);
      localStorage.setItem(
        `CognitoIdentityServiceProvider.${CLIENT_ID}.LastAuthUser`,
        email
      );

      navigate('/events');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>CloudWave Events</h1>
        <h2 style={styles.sub}>Sign in to your account</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="you@example.com"
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.registerText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '0.25rem',
    color: '#111827',
  },
  sub: {
    fontSize: '1rem',
    fontWeight: '400',
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginTop: '0.5rem',
  },
  input: {
    padding: '0.65rem 0.9rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  registerText: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.9rem',
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
