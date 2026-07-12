'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoadingLogin(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminToken', password);
        router.push('/admin/dashboard');
      } else {
        setErrorMsg(data.error || 'E-mail ou senha de administrador incorretos.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao autenticar.');
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '400px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '18px' }}>Admin</span>
            </div>
          </Link>
          <p className="text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
            Acesso restrito para gestão da plataforma
          </p>
        </div>

        {errorMsg && (
          <div className="badge badge-danger w-full p-3 mb-4 text-center text-xs" style={{ borderRadius: '8px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">E-mail</label>
            <input 
              type="email" 
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Senha</label>
            <input 
              type="password" 
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-2)' }} disabled={loadingLogin}>
            {loadingLogin ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
