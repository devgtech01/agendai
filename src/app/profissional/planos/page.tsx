'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full navbar-premium">
      <nav className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-2xl text-linen" style={{ textDecoration: 'none' }}>
          Agend<span className="text-accent">ai</span>
        </Link>
        <ul className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {[
            { label: "Para Profissionais", href: "/profissional" },
            { label: "Planos", href: "/profissional/planos" },
            { label: "Sobre", href: "/#booking-demo" },
          ].map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm nav-link-animated"
                style={{ color: "rgba(232,213,183,0.55)", textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/catalog"
            className="press rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            style={{ textDecoration: 'none' }}
          >
            Agendar
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-12 mt-auto">
      <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row" style={{ borderColor: 'rgba(232, 213, 183, 0.1)' }}>
        <p className="font-display text-xl text-foreground">
          Agend<span className="text-accent">ai</span>
        </p>
        <p className="text-sm text-muted-foreground">© 2026 Agendai. Feito com ofício.</p>
      </div>
    </footer>
  );
}

export default function PlanosPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    checkUser();
  }, []);

  const selectPlanAndProceed = async (planKey: string) => {
    setLoadingPlan(planKey);
    setSelectedPlan(planKey);
    // Salvar plano no sessionStorage para validação de segurança no formulário de cadastro
    sessionStorage.setItem('selectedPlan', planKey);

    if (currentUser) {
      // Se o usuário já estiver logado, redireciona diretamente para o checkout (Stripe ou Simulado)
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
    } else {
      // Redirecionar para o cadastro
      router.push('/profissional/register');
    }
    setLoadingPlan(null);
  };

  const plans = [
    {
      key: "mensal",
      name: "Mensal",
      price: "R$ 34,90",
      period: "/mês",
      description: "Ideal para começar e testar todas as funcionalidades. Primeiro mês grátis.",
      highlight: false,
      badge: "1 Mês Grátis",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Começar agora",
    },
    {
      key: "semestral",
      name: "Semestral",
      price: "R$ 178,44",
      period: " a cada 6 meses",
      description: "Economize 15% e tenha mais previsibilidade para seu negócio.",
      highlight: true,
      badge: "-15%",
      monthlyEquiv: "R$ 29,74",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Escolher semestral",
    },
    {
      key: "anual",
      name: "Anual",
      price: "R$ 306,00",
      period: " a cada 12 meses",
      description: "O melhor custo-benefício para quem leva o negócio a sério.",
      highlight: true,
      badge: "-25%",
      monthlyEquiv: "R$ 25,50",
      features: [
        "Agendamentos ilimitados",
        "Relatórios com dashboard",
        "Controle financeiro",
        "Previsões de agendamento",
        "Suporte humanizado",
      ],
      cta: "Escolher anual",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-20">
          <div className="text-center" style={{ marginBottom: "56px" }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent-soft-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Planos flexíveis
            </span>
            <h1 className="font-display mt-6 text-5xl tracking-tight text-foreground md:text-6xl" style={{ letterSpacing: "-0.03em" }}>
              Escolha o plano ideal
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Gestão profissional da sua agenda a partir de R$ 25,50/mês. Sem taxa de setup, cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`card-hover relative flex flex-col rounded-2xl border p-6 md:p-8 ${
                  plan.name === "Anual" ? "bg-primary text-linen" : "bg-surface text-foreground"
                }`}
                style={{ borderWidth: "0.5px" }}
              >
                {plan.badge && (
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
                    style={{ color: plan.name === "Anual" ? "#E8D5B7" : "var(--foreground)" }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: plan.name === "Anual" ? "rgba(232,213,183,0.7)" : "var(--muted-foreground)" }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1" style={{ marginBottom: "4px" }}>
                  <span
                    className="font-display text-4xl font-medium"
                    style={{ color: plan.name === "Anual" ? "#E8D5B7" : "var(--foreground)" }}
                  >
                    {plan.price}
                  </span>
                </div>
                <p
                  className="text-sm"
                  style={{ 
                    marginBottom: "24px", 
                    color: plan.name === "Anual" ? "rgba(232,213,183,0.7)" : "var(--muted-foreground)" 
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
                        style={{ color: plan.name === "Anual" ? "#C15A2E" : "var(--accent)" }}
                      />
                      <span style={{ color: plan.name === "Anual" ? "rgba(232,213,183,0.9)" : "var(--foreground)" }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => selectPlanAndProceed(plan.key)}
                  disabled={loadingPlan !== null}
                  className={`press w-full py-3 rounded-lg text-sm font-medium text-center ${
                    plan.name === "Anual"
                      ? "btn-premium-primary"
                      : "btn-premium-secondary"
                  }`}
                  style={{ opacity: loadingPlan !== null ? 0.7 : 1, cursor: loadingPlan !== null ? 'not-allowed' : 'pointer' }}
                >
                  {loadingPlan === plan.key ? 'Processando...' : plan.cta}
                </button>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Precisa de mais? <span className="font-medium text-foreground">Fale conosco</span> para um plano sob medida.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
