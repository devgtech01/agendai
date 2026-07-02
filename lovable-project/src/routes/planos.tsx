import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — Agendai" },
      { name: "description", content: "Escolha o plano ideal para sua barbearia ou salão. Mensal, semestral ou anual com descontos especiais." },
      { property: "og:title", content: "Planos — Agendai" },
      { property: "og:description", content: "Escolha o plano ideal para sua barbearia ou salão." },
    ],
  }),
  component: PlanosPage,
});

function Navbar() {
  return (
    <header className="px-4 pt-4">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between rounded-xl bg-primary px-6 py-3.5">
        <Link to="/" className="font-display text-2xl text-linen">
          Agend<span className="text-accent">ai</span>
        </Link>
        <ul className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2">
          {[
            { label: "Profissionais", to: "/" },
            { label: "Planos", to: "/planos" },
            { label: "Sobre", to: "/" },
          ].map((l) => (
            <li key={l.label}>
              <Link
                to={l.to}
                className="text-sm"
                style={{ color: "rgba(232,213,183,0.55)" }}
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
            to="/"
            className="text-sm"
            style={{ color: "rgba(232,213,183,0.55)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
          >
            Explorar estabelecimentos
          </Link>
          <button className="press rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
            Agendar
          </button>
        </div>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
        <p className="font-display text-xl text-foreground">
          Agend<span className="text-accent">ai</span>
        </p>
        <p className="text-sm text-muted-foreground">© 2026 Agendai. Feito com ofício.</p>
      </div>
    </footer>
  );
}

const plans = [
  {
    name: "Mensal",
    price: "R$ 34,90",
    period: "/mês",
    description: "Ideal para começar e testar todas as funcionalidades. Primeiro mês grátis.",
    highlight: false,
    badge: "1 Mês Grátis",
    features: [
      "Agendamentos ilimitados",
      "Cadastro de até 3 profissionais",
      "Relatórios básicos",
      "Suporte por e-mail",
    ],
    cta: "Começar agora",
  },
  {
    name: "Semestral",
    price: "R$ 178,44",
    period: " a cada 6 meses",
    description: "Economize 15% e tenha mais previsibilidade para seu negócio.",
    highlight: true,
    badge: "-15%",
    monthlyEquiv: "R$ 29,74",
    features: [
      "Agendamentos ilimitados",
      "Cadastro de até 8 profissionais",
      "Relatórios avançados",
      "Suporte prioritário",
      "Lembretes automáticos por WhatsApp",
    ],
    cta: "Escolher semestral",
  },
  {
    name: "Anual",
    price: "R$ 306,00",
    period: " a cada 12 meses",
    description: "O melhor custo-benefício para quem leva o negócio a sério.",
    highlight: true,
    badge: "-25%",
    monthlyEquiv: "R$ 25,50",
    features: [
      "Agendamentos ilimitados",
      "Profissionais ilimitados",
      "Dashboard completo + previsões",
      "Suporte prioritário",
      "Lembretes automáticos por WhatsApp",
      "Personalização de marca",
    ],
    cta: "Escolher anual",
  },
];

function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-14 text-center">
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
            className={`card-hover relative flex flex-col rounded-2xl border p-6 md:p-8 ${plan.name === "Anual" ? "bg-primary text-linen" : "bg-surface text-foreground"
              }`}
            style={{ borderWidth: "0.5px" }}
          >
            {plan.badge && (
              <span
                className="absolute -top-3 right-6 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: plan.name === "Anual" ? "#C15A2E" : "#C15A2E",
                  color: "#FFFFFF",
                }}
              >
                {plan.badge}
              </span>
            )}

            <div className="mb-6">
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

            <div className="mb-1 flex items-baseline gap-1">
              <span
                className="font-display text-4xl font-medium"
                style={{ color: plan.name === "Anual" ? "#E8D5B7" : "var(--foreground)" }}
              >
                {plan.price}
              </span>
            </div>
            <p
              className="mb-6 text-sm"
              style={{ color: plan.name === "Anual" ? "rgba(232,213,183,0.7)" : "var(--muted-foreground)" }}
            >
              {plan.period}
              {plan.monthlyEquiv && (
                <span className="ml-2 rounded-md bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent-soft-foreground">
                  {plan.monthlyEquiv}/mês
                </span>
              )}
            </p>

            <ul className="mb-8 flex-1 space-y-3">
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
              className={`press w-full rounded-lg py-3 text-sm font-medium ${plan.name === "Anual"
                  ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                  : "border border-accent bg-transparent text-accent hover:bg-accent-soft"
                }`}
            >
              {plan.cta}
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
  );
}

function PlanosPage() {
  return (
    <main>
      <Navbar />
      <PricingSection />
      <Footer />
    </main>
  );
}
