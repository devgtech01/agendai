'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ProfissionalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
    } else {
      router.push('/profissional/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '400px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '18px' }}>Profissional</span>
            </div>
          </Link>
          <p className="text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
            Cadastre e gerencie seu estabelecimento e agenda
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">E-mail</label>
            <input 
              type="email" 
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">Senha</label>
              <Link 
                href="/profissional/esqueci-senha" 
                style={{ fontSize: '12px', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}
              >
                Esqueceu sua senha?
              </Link>
            </div>
            <input 
              type="password" 
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: '13px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Não possui uma conta?{' '}
            <Link href="/profissional/register" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
