'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const SESSION_KEY = 'emrg_dispatcher_token';

function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const login = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const result = await response.json() as { token?: string; detail?: string };
      if (!response.ok || !result.token) throw new Error(result.detail ?? 'Login failed.');
      sessionStorage.setItem(SESSION_KEY, result.token);
      const next = searchParams.get('next');
      router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Login failed.'); }
    finally { setSubmitting(false); }
  };

  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-color)', padding: '1.5rem' }}>
    <form onSubmit={login} style={{ width: 'min(400px, 100%)', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
      <p style={{ margin: 0, color: 'var(--accent-red)', fontWeight: 800, letterSpacing: '0.08em', fontSize: '0.75rem' }}>E-MRG DISPATCH CONSOLE</p>
      <h1 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>Dispatcher login</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Enter your authorized dispatcher credentials.</p>
      <label style={{ display: 'grid', gap: '0.4rem', marginBottom: '1rem', color: 'var(--text-primary)', fontWeight: 700 }}>Username<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} /></label>
      <label style={{ display: 'grid', gap: '0.4rem', marginBottom: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} /></label>
      {error && <p role="alert" style={{ color: 'var(--accent-red)', margin: '0 0 1rem' }}>{error}</p>}
      <button disabled={submitting} style={{ width: '100%', padding: '0.8rem', border: 0, borderRadius: '8px', background: 'var(--accent-red)', color: '#fff', fontWeight: 800, cursor: submitting ? 'wait' : 'pointer' }}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      <p style={{ margin: '1rem 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hackathon demo access only.</p>
    </form>
  </main>;
}

export default function LoginPage(): React.JSX.Element {
  return <Suspense fallback={null}><LoginForm /></Suspense>;
}
