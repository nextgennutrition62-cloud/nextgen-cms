'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Погрешен email или лозинка.');
      return;
    }
    router.push('/admin/dashboard');
    router.refresh();
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-login-box">
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>NEXT GEN Admin</h1>
        <p style={{ color: 'var(--gray)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Најави се за да управуваш со страната.</p>
        <form onSubmit={handleLogin}>
          <label className="admin-label">Email</label>
          <input className="admin-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ime@email.com" />
          <label className="admin-label">Лозинка</label>
          <input className="admin-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p style={{ color: '#C0392B', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</p>}
          <button className="admin-btn" style={{ width: '100%', marginTop: '1.5rem' }} disabled={loading}>
            {loading ? 'Се најавува...' : 'Најави се'}
          </button>
        </form>
      </div>
    </div>
  );
}
