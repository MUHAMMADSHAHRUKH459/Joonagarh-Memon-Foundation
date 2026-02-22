'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--gray-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '420px',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          backgroundColor: 'var(--green-dark)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '70px', height: '70px',
            backgroundColor: 'var(--green-light)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', margin: '0 auto 1rem',
          }}>🕌</div>
          <h1 style={{ color: 'white', fontSize: '1.4rem' }}>Memon Welfare</h1>
          <p style={{ color: 'var(--green-border)', fontSize: '0.85rem', marginTop: '4px' }}>
            Admin Login - Karachi Chapter
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fce4e4', border: '1px solid #ef9a9a',
              borderRadius: '8px', padding: '10px 16px',
              marginBottom: '1rem', color: '#c62828', fontSize: '0.9rem',
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                fontSize: '0.85rem', fontWeight: '600',
                color: 'var(--green-dark)', marginBottom: '6px', display: 'block',
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter username"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid var(--green-border)',
                  borderRadius: 'var(--radius)', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                fontSize: '0.85rem', fontWeight: '600',
                color: 'var(--green-dark)', marginBottom: '6px', display: 'block',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                style={{
                  width: '100%', padding: '10px 14px',
                  border: '1.5px solid var(--green-border)',
                  borderRadius: 'var(--radius)', fontSize: '0.95rem',
                  outline: 'none', boxSizing: 'border-box' as const,
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', backgroundColor: 'var(--green-main)',
              color: 'white', border: 'none', padding: '12px',
              borderRadius: 'var(--radius)', cursor: 'pointer',
              fontSize: '1rem', fontWeight: '700',
            }}>
              {loading ? '⏳ Logging in...' : '🔐 Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}