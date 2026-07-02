'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getEstablishmentByOwnerId, Establishment } from '@/lib/db';

export default function AlterarPlanoPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [planStatus, setPlanStatus] = useState<string>('inactive');
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/profissional');
        return;
      }
      setCurrentUser(user);
      setCurrentPlan(user.user_metadata?.plan || '');
      setPlanStatus(user.user_metadata?.plan_status || 'inactive');

      const est = await getEstablishmentByOwnerId(user.id);
      if (est) {
        setEstablishment(est);
      }
      setLoading(false);
    }
    loadData();
  }, [router]);

  const selectPlanAndProceed = async (planKey: string) => {
    if (planKey === currentPlan && planStatus === 'active') return;

    setLoadingPlan(planKey);
    sessionStorage.setItem('selectedPlan', planKey);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          planKey,
          userId: currentUser.id,
        }),
      });

      const data = await response.json();
      if (response.ok && data.url) {
        router.push(data.url);
        return;
      }
    } catch (err) {
      console.error('Erro ao chamar API de checkout:', err);
    }
    router.push('/profissional/dashboard');
    setLoadingPlan(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        Carregando planos de assinatura...
      </div>
    );
  }

  const plans = [
    {
      key: "mensal",
      name: "Mensal",
      price: "R$ 34,90",
      period: "/mês",
      description: "Ideal para começar e testar todas as funcionalidades. Primeiro mês grátis.",
      badge: "1 Mês Grátis",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Escolher Mensal",
    },
    {
      key: "semestral",
      name: "Semestral",
      price: "R$ 178,44",
      period: " a cada 6 meses",
      description: "Economize 15% e tenha mais previsibilidade para seu negócio.",
      badge: "-15%",
      monthlyEquiv: "R$ 29,74",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Escolher Semestral",
    },
    {
      key: "anual",
      name: "Anual",
      price: "R$ 306,00",
      period: " a cada 12 meses",
      description: "O melhor custo-benefício para quem leva o negócio a sério.",
      badge: "-25%",
      monthlyEquiv: "R$ 25,50",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Escolher Anual",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Topnav */}
      <header style={{ background: 'var(--color-surface)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--color-border)' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
                Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '14px' }}>Profissional</span>
              </div>
            </Link>
            <nav className="hidden md:flex gap-4">
              <Link href="/profissional/dashboard" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Dashboard</Link>
              <Link href="/profissional/agenda" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Minha Agenda</Link>
              <Link href="/profissional/services" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Meus Serviços</Link>
              <Link href="/profissional/settings" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Meu Estabelecimento</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{establishment?.name || 'Estabelecimento'}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container flex-1" style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px' }}>
            <Link href="/profissional/settings?tab=billing" className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:opacity-80" style={{ textDecoration: 'none', marginBottom: '16px' }}>
              <ArrowLeft className="h-4 w-4" /> Voltar ao faturamento
            </Link>
            <h1 className="heading-1">Alterar Plano de Assinatura</h1>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Escolha o plano que melhor se adapta às necessidades do seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.key && planStatus === 'active';
              return (
                <article
                  key={plan.name}
                  className={`card-hover relative flex flex-col rounded-2xl border p-6 md:p-8 ${
                    plan.name === "Anual" ? "bg-primary text-linen animate-pulse-once" : "bg-surface text-foreground"
                  }`}
                  style={{ borderWidth: "0.5px", borderColor: isCurrent ? 'var(--color-accent)' : 'var(--color-border)', boxShadow: isCurrent ? '0 0 0 2px var(--color-accent)' : 'none' }}
                >
                  {isCurrent && (
                    <span
                      className="absolute rounded-full text-xs font-semibold"
                      style={{
                        top: "-12px",
                        left: "24px",
                        padding: "4px 12px",
                        backgroundColor: "var(--color-accent)",
                        color: "#FFFFFF",
                        zIndex: 10,
                      }}
                    >
                      Plano Atual Ativo
                    </span>
                  )}

                  {plan.badge && !isCurrent && (
                    <span
                      className="absolute rounded-full text-xs font-semibold"
                      style={{
                        top: "-12px",
                        right: "24px",
                        padding: "4px 12px",
                        backgroundColor: "#C15A2E",
                        color: "#FFFFFF",
                        zIndex: 10,
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <div style={{ marginBottom: "24px" }}>
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: plan.name === "Anual" ? "#E8D5B7" : "var(--color-text)" }}
                    >
                      {plan.name}
                    </h3>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: plan.name === "Anual" ? "rgba(232,213,183,0.7)" : "var(--color-muted)" }}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1" style={{ marginBottom: "4px" }}>
                    <span
                      className="font-display text-4xl font-medium"
                      style={{ color: plan.name === "Anual" ? "#E8D5B7" : "var(--color-text)" }}
                    >
                      {plan.price}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ 
                      marginBottom: "24px", 
                      color: plan.name === "Anual" ? "rgba(232,213,183,0.7)" : "var(--color-muted)" 
                    }}
                  >
                    {plan.period}
                    {plan.monthlyEquiv && (
                      <span 
                        className="rounded-md bg-accent-soft text-xs font-medium text-accent-soft-foreground"
                        style={{
                          marginLeft: "8px",
                          padding: "2px 8px",
                          display: "inline-block",
                        }}
                      >
                        {plan.monthlyEquiv}/mês
                      </span>
                    )}
                  </p>

                  <ul className="flex-1 space-y-3" style={{ marginBottom: "32px", listStyle: 'none', padding: 0 }}>
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: plan.name === "Anual" ? "#C15A2E" : "var(--color-accent)" }}
                        />
                        <span style={{ color: plan.name === "Anual" ? "rgba(232,213,183,0.9)" : "var(--color-text)" }}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => selectPlanAndProceed(plan.key)}
                    disabled={isCurrent || loadingPlan !== null}
                    className={`press w-full py-3 rounded-lg text-sm font-medium text-center ${
                      isCurrent
                        ? "btn-secondary"
                        : plan.name === "Anual"
                        ? "btn-premium-primary"
                        : "btn-premium-secondary"
                    }`}
                    style={{
                      opacity: (isCurrent || loadingPlan !== null) ? 0.7 : 1,
                      cursor: (isCurrent || loadingPlan !== null) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loadingPlan === plan.key ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processando...
                      </span>
                    ) : isCurrent ? (
                      "Seu Plano Atual"
                    ) : (
                      plan.cta
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
