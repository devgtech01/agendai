'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const redirectUrl = `${window.location.origin}/profissional/redefinir-senha`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setError(error.message || 'Erro ao solicitar redefinição de senha.');
      } else {
        setMessage('Instruções enviadas! Verifique sua caixa de entrada e pasta de spam para redefinir sua senha.');
      }
    } catch (err: any) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4">
      <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '420px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '18px' }}>Profissional</span>
            </div>
          </Link>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '16px', color: 'var(--color-text)' }}>
            Recuperação de Senha
          </h2>
          <p className="text-muted" style={{ marginTop: '6px', fontSize: '14px' }}>
            Digite seu e-mail cadastrado para receber o link de redefinição
          </p>
        </div>

        {message ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📧</div>
            <div style={{ color: 'var(--color-success)', background: '#EAF7EC', border: '1px solid #C3E6CB', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              {message}
            </div>
            <Link href="/profissional" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
              Voltar ao Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">E-mail Cadastrado</label>
              <input 
                type="email" 
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: '13px', textAlign: 'center', background: '#FCEAEA', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
              {loading ? 'Enviando instruções...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-5)' }}>
          <Link href="/profissional" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
            ← Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
