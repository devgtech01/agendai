'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se o usuário possui sessão ativa de redefinição via hash/link do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Se não houver sessão ativa, monitorar mudanças de auth estado (callback da URL do Supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY') {
            setError('');
          }
        });
        return () => subscription.unsubscribe();
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_#\-+$%&*=/[\]\\';`~^|]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError('A nova senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial (Ex: @, #, $, %, &).');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Digite novamente.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setError(error.message || 'Erro ao redefinir senha. Tente novamente.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profissional');
        }, 3000);
      }
    } catch (err: any) {
      setError('Erro inesperado ao atualizar a senha.');
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
            Criar Nova Senha
          </h2>
          <p className="text-muted" style={{ marginTop: '6px', fontSize: '14px' }}>
            Digite a sua nova senha de acesso abaixo
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
            <div style={{ color: 'var(--color-success)', background: '#EAF7EC', border: '1px solid #C3E6CB', padding: '14px', borderRadius: 'var(--radius-md)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.5 }}>
              Senha redefinida com sucesso! Você será redirecionado para o login em instantes...
            </div>
            <Link href="/profissional" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
              Ir para o Login Agora
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Nova Senha</label>
              <input 
                type="password" 
                className="input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, maiúscula, número e símbolo"
                required
                minLength={8}
              />
              <span style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '2px' }}>
                Deve conter pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 símbolo.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Confirmar Nova Senha</label>
              <input 
                type="password" 
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
                minLength={8}
              />
            </div>

            {error && (
              <div style={{ color: 'var(--color-danger)', fontSize: '13px', textAlign: 'center', background: '#FCEAEA', padding: '10px', borderRadius: 'var(--radius-md)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-2)' }} disabled={loading}>
              {loading ? 'Redefinindo senha...' : 'Salvar Nova Senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
