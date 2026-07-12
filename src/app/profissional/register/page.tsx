'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { addEstablishment } from '@/lib/db';

export default function ProfissionalRegisterPage() {
  const [ownerName, setOwnerName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [category, setCategory] = useState('Barbearia');
  const [customCategory, setCustomCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [checkedFunnel, setCheckedFunnel] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const router = useRouter();

  useEffect(() => {
    const plan = sessionStorage.getItem('selectedPlan');
    if (!plan || !['mensal', 'semestral', 'anual'].includes(plan)) {
      setError('Por favor, selecione um plano antes de prosseguir com o cadastro.');
      const timer = setTimeout(() => {
        router.replace('/profissional/planos');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSelectedPlan(plan);
      setCheckedFunnel(true);
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Validação de Confirmação de E-mail
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      setError('Os e-mails informados não coincidem.');
      setLoading(false);
      return;
    }

    // 2. Validação de Complexidade da Senha (Mínimo 8 caracteres, maiúscula, minúscula, número, especial)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_#\-+$%&*=/[\]\\';`~^|]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('A senha deve conter no mínimo 8 caracteres, incluindo pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial (Ex: @, #, $, %, &, *).');
      setLoading(false);
      return;
    }

    // 3. Validação de Confirmação de Senha
    if (password !== confirmPassword) {
      setError('As senhas informadas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      // 4. Chamar a API segura de registro no servidor
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ownerName,
          establishmentName,
          phone,
          selectedPlan,
          category,
          customCategory
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao realizar cadastro.');
        setLoading(false);
        return;
      }

      // Se a confirmação de e-mail for necessária
      if (data.requiresConfirmation) {
        setSuccessMessage(data.message);
        setLoading(false);
        return;
      }

      // Se o login foi automático (confirmação desligada)
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      // Iniciar fluxo de checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          planKey: selectedPlan,
          userId: data.userId,
        }),
      });

      const checkoutData = await response.json();
      if (response.ok && checkoutData.url) {
        router.push(checkoutData.url);
      } else {
        router.push('/profissional/dashboard');
      }
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setError('Erro de conexão ao realizar cadastro. Tente novamente.');
      setLoading(false);
    }
  };

  if (!checkedFunnel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4 py-12">
        <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '450px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Acesso Restrito</h2>
          <p className="text-muted" style={{ fontSize: '14px', color: 'var(--color-danger)', lineHeight: 1.5 }}>
            {error || 'Verificando seleção de plano...'}
          </p>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4 py-12">
        <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '450px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>Verifique seu E-mail</h2>
          <p className="text-muted" style={{ fontSize: '14px', color: 'var(--color-success)', background: '#EAF7EC', border: '1px solid #C3E6CB', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '24px', lineHeight: 1.5 }}>
            {successMessage}
          </p>
          <Link href="/profissional" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
            Ir para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] p-4 py-12">
      <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '450px', padding: 'var(--space-10)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '18px' }}>Profissional</span>
            </div>
          </Link>
          <p className="text-muted" style={{ marginTop: '8px', fontSize: '14px' }}>
            Crie sua conta e comece a receber agendamentos
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Nome Completo</label>
            <input 
              type="text" 
              className="input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Nome do Estabelecimento</label>
            <input 
              type="text" 
              className="input"
              value={establishmentName}
              onChange={(e) => setEstablishmentName(e.target.value)}
              placeholder="Ex: Barbearia do João"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Categoria do Estabelecimento</label>
            <select 
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="Barbearia">Barbearia</option>
              <option value="Salão de Beleza">Salão de Beleza</option>
              <option value="Clínica de Estética">Clínica de Estética</option>
              <option value="Outros">Outros (Especifique abaixo)</option>
            </select>
          </div>

          {category === 'Outros' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Especifique a Categoria</label>
              <input 
                type="text" 
                className="input"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Estúdio de Tattoo, Petshop, Spa"
                required={category === 'Outros'}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Telefone (WhatsApp)</label>
            <input 
              type="tel" 
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

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
            <label className="input-label">Confirmar E-mail</label>
            <input 
              type="email" 
              className="input"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="Confirme seu e-mail"
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
              placeholder="Mínimo 8 caracteres, maiúscula, número e símbolo"
              required
              minLength={8}
            />
            <span style={{ fontSize: '10px', color: 'var(--color-muted)', marginTop: '2px' }}>
              Deve conter pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 símbolo.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="input-label">Confirmar Senha</label>
            <input 
              type="password" 
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--color-danger)', fontSize: '13px', textAlign: 'center', marginTop: '8px' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 'var(--space-4)' }} disabled={loading}>
            {loading ? 'Criando conta...' : 'Cadastrar e Acessar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Já possui uma conta?{' '}
            <Link href="/profissional" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
