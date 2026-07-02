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
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    // Calcular expiração do teste grátis (30 dias para mensal)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const trialUntil = selectedPlan === 'mensal' ? trialEndDate.toISOString().split('T')[0] : null;

    // 1. Criar usuário no Supabase Auth com plano e teste grátis no metadado
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
          plan: selectedPlan,
          trial_until: trialUntil,
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;

    if (!userId) {
      setError('Erro ao criar usuário.');
      setLoading(false);
      return;
    }

    // 2. Criar Estabelecimento vinculado ao owner_id
    const establishment = await addEstablishment({
      name: establishmentName,
      description: 'Bem-vindo ao meu estabelecimento!', // Default description
      address: 'Endereço pendente', // Default address
      phone: phone,
      imageUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Default image
      ownerId: userId
    });

    if (!establishment) {
      setError('Erro ao criar o perfil do estabelecimento. Tente novamente.');
      setLoading(false);
      return;
    }

    // Sucesso - Iniciar fluxo de checkout (real ou simulado)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          planKey: selectedPlan,
          userId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        router.push(data.url);
      } else {
        router.push('/profissional/dashboard');
      }
    } catch (err) {
      console.error('Erro ao chamar API de checkout:', err);
      router.push('/profissional/dashboard');
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
            <label className="input-label">Senha</label>
            <input 
              type="password" 
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
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
