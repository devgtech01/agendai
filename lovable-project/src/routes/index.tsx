import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Star, Check, Calendar, Clock, Sparkles, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agendai — Agendamento para barbearias e salões" },
      { name: "description", content: "A simplicidade da organização profissional que sua empresa precisa. Gestão de agenda, profissionais e clientes em um só lugar." },
      { property: "og:title", content: "Agendai — Agendamento para barbearias e salões" },
      { property: "og:description", content: "A simplicidade da organização profissional que sua empresa precisa." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Landing,
});

function Navbar() {
  return (
    <header className="px-4 pt-4">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between rounded-xl bg-primary px-6 py-3.5">
        <a href="#" className="font-display text-2xl text-linen">
          Agend<span className="text-accent">ai</span>
        </a>
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
          <a
            href="#"
            className="text-sm"
            style={{ color: "rgba(232,213,183,0.55)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
          >
            Explorar estabelecimentos
          </a>
          <button className="press rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover">
            Agendar
          </button>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent-soft-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Novo · Agenda inteligente
        </span>
        <h1 className="font-display mt-6 text-5xl tracking-tight text-foreground md:text-6xl lg:text-7xl" style={{ letterSpacing: "-0.03em" }}>
          A simplicidade da organização profissional que sua empresa precisa
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Centralize sua agenda, profissionais e clientes em uma plataforma feita para barbearias clássicas e salões que valorizam o seu cliente
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button className="press w-full rounded-lg bg-accent px-7 py-3.5 text-base font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto">
            Começar agora
          </button>
          <button className="press w-full rounded-lg border border-accent bg-transparent px-7 py-3.5 text-base font-medium text-accent hover:bg-accent-soft sm:w-auto">
            Ver demonstração
          </button>
        </div>
      </div>
    </section>
  );
}

const establishments = [
  { name: "Barbearia Vintage", type: "Barbearia clássica", address: "São Paulo, SP", rating: 4.9, reviews: 124, badge: true, image: "BV" },
  { name: "Salão Elegance", type: "Salão de beleza", address: "Rio de Janeiro, RJ", rating: 4.8, reviews: 89, badge: false, image: "SE" },
  { name: "The Grooming Club", type: "Barbearia premium", address: "Curitiba, PR", rating: 4.9, reviews: 156, badge: true, image: "TG" },
  { name: "Studio Beleza Pura", type: "Salão completo", address: "Belo Horizonte, MG", rating: 4.7, reviews: 67, badge: false, image: "SB" },
];

function Services() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-accent">Profissionais</p>
          <h2 className="font-display mt-2 text-4xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Vitrine de profissionais
          </h2>
        </div>
        <p className="max-w-md text-muted-foreground">
          Encontre os melhores estabelecimentos da sua cidade, organize e agende em poucos toques.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {establishments.map(({ name, type, address, rating, reviews, badge, image }) => (
          <article
            key={name}
            className="card-hover overflow-hidden rounded-xl border bg-surface"
            style={{ borderWidth: "0.5px" }}
          >
            <div className="flex h-32 items-center justify-center bg-primary">
              <span className="font-display text-4xl text-linen opacity-60">{image}</span>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                  {name}
                </h3>
                {badge && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-soft-foreground">
                    Destaque
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{type}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {address}
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-medium text-foreground">{rating}</span>
                <span className="text-sm text-muted-foreground">({reviews} avaliações)</span>
              </div>
              <button className="press w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-linen hover:opacity-90">
                Ver disponibilidade
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const pros = [
  { initials: "RM", name: "Rafael Moraes", role: "Barbeiro master · 12 anos", rating: 4.9, reviews: 312, tags: ["Fade", "Barba", "Navalhado"], bg: "#C15A2E" },
  { initials: "JS", name: "Júlia Sant'Ana", role: "Cabeleireira sênior · 8 anos", rating: 4.8, reviews: 248, tags: ["Coloração", "Corte", "Escova"], bg: "#A34A22" },
  { initials: "LC", name: "Lucas Carvalho", role: "Barbeiro · 6 anos", rating: 5.0, reviews: 187, tags: ["Degradê", "Pigmentação"], bg: "#8B3D1B" },
];

function Professionals() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-12">
        <p className="text-sm font-medium text-accent">Equipe</p>
        <h2 className="font-display mt-2 text-4xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
          Nossos profissionais
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pros.map((p) => (
          <article key={p.name} className="card-hover rounded-xl border bg-surface p-6" style={{ borderWidth: "0.5px" }}>
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center text-lg font-semibold text-linen"
                style={{ borderRadius: "50%", backgroundColor: p.bg }}
              >
                {p.initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.role}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <span className="font-medium text-foreground">{p.rating}</span>
              <span className="text-muted-foreground">({p.reviews} avaliações)</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="rounded-md bg-tag-bg px-2.5 py-1 text-xs font-medium text-tag-fg">
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const steps = ["Serviço", "Profissional", "Horário", "Confirmação"];
const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const selectedSlot = "10:30";

function BookingDemo() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm font-medium text-accent">Demonstração</p>
        <h2 className="font-display mt-2 text-4xl text-foreground md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
          Agendar em três toques
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Uma experiência fluida do início ao fim — para você e para o seu cliente.
        </p>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl border bg-surface p-6 md:p-10" style={{ borderWidth: "0.5px" }}>
        {/* Step bar */}
        <div className="flex items-center gap-2 md:gap-3">
          {steps.map((s, i) => {
            const isDone = i < 2;
            const isActive = i === 2;
            return (
              <div key={s} className="flex flex-1 items-center gap-2 md:gap-3">
                <div className="flex flex-1 items-center gap-2 md:gap-3">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: isDone ? "#C15A2E" : isActive ? "#1A1A2E" : "#E4E1DC",
                      color: isDone || isActive ? "#E8D5B7" : "#8C8378",
                    }}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className="hidden text-sm font-medium sm:inline"
                    style={{ color: isActive ? "#1A1A2E" : isDone ? "#C15A2E" : "#8C8378" }}
                  >
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="h-px flex-1" style={{ backgroundColor: isDone ? "#C15A2E" : "#E4E1DC" }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Date header */}
        <div className="mt-10 flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Selecione um horário</p>
              <p className="font-medium text-foreground">Quinta-feira, 12 de junho</p>
            </div>
          </div>
          <span className="hidden rounded-md bg-tag-bg px-3 py-1 text-xs font-medium text-tag-fg sm:inline">
            12 slots disponíveis
          </span>
        </div>

        {/* Slot grid */}
        <div className="mt-6 grid grid-cols-3 gap-3 md:grid-cols-4">
          {slots.map((s) => {
            const isSelected = s === selectedSlot;
            return (
              <button
                key={s}
                className="press rounded-lg py-3 text-sm font-medium"
                style={{
                  backgroundColor: isSelected ? "#1A1A2E" : "#FFFFFF",
                  color: isSelected ? "#E8D5B7" : "#2E2B25",
                  border: isSelected ? "none" : "1px solid #E4E1DC",
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Selecionado: <span className="font-medium text-foreground">Corte clássico · {selectedSlot}</span>
          </p>
          <button className="press w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto">
            Confirmar agendamento
          </button>
        </div>
      </div>
    </section>
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

function Dashboard() {
  const revenueData = [12, 15, 14, 18, 22, 28, 26, 24, 21, 19, 17, 16];
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const weekData = [
    { day: "Dom", value: 8 },
    { day: "Seg", value: 15 },
    { day: "Ter", value: 22 },
    { day: "Qua", value: 18 },
    { day: "Qui", value: 25 },
    { day: "Sex", value: 35 },
    { day: "Sáb", value: 42 },
  ];
  const maxWeek = 42;
  const maxRev = 28;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm font-medium text-accent">Para profissionais</p>
        <h2 className="font-display mt-2 text-4xl text-foreground md:text-5xl" style={{ letterSpacing: "-0.02em" }}>
          Tenha o controle do seu negócio na palma da mão
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Acompanhe clientes, receita, agendamentos e os serviços mais procurados em um painel pensado para barbearias e salões.
        </p>
      </div>

      <div className="mx-auto max-w-6xl rounded-2xl border bg-surface p-6 md:p-8" style={{ borderWidth: "0.5px" }}>
        {/* Header */}
        <div className="mb-8">
          <h3 className="font-display text-2xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Dashboard
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe os resultados e o crescimento do seu negócio</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Clientes Atendidos */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Users className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Clientes Atendidos</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hoje", value: "8" },
                { label: "Esta Semana", value: "42" },
                { label: "Este Mês", value: "178" },
                { label: "Este Ano", value: "1.247" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-2xl text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Receita Faturada */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <DollarSign className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Receita Faturada</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hoje", value: "R$ 1.240,00" },
                { label: "Esta Semana", value: "R$ 7.580,00" },
                { label: "Este Mês", value: "R$ 32.450,00" },
                { label: "Este Ano", value: "R$ 248.900,00" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-2xl text-accent">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evolução do Faturamento */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <TrendingUp className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Evolução do Faturamento Mensal (R$ mil)</h4>
            </div>
            <div className="relative h-32">
              <svg viewBox="0 0 360 110" className="h-full w-full" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#C15A2E"
                  strokeWidth="1.5"
                  points={revenueData
                    .map((v, i) => `${(i * 360) / 11},${100 - (v / maxRev) * 80}`)
                    .join(" ")}
                />
                {revenueData.map((v, i) => {
                  const x = (i * 360) / 11;
                  const y = 100 - (v / maxRev) * 80;
                  const isPeak = v === maxRev;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={isPeak ? 3 : 2} fill="#C15A2E" />
                      {isPeak && (
                        <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill="#2E2B25" fontWeight="600">
                          {v}k
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              {months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Fluxo de Clientes */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <BarChart3 className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Fluxo de Clientes por Dia da Semana</h4>
            </div>
            <div className="flex h-32 items-end justify-between gap-2 px-2">
              {weekData.map((d) => {
                const barHeight = d.value > 0 ? (d.value / maxWeek) * 96 : 4;
                return (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    {d.value > 0 && <span className="text-[10px] font-medium text-foreground">{d.value}</span>}
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: d.value > 0 ? "#1A1A2E" : "#E4E1DC",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Previsão de Agendamentos */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Previsão de Agendamentos (Próximos 7 Dias)</h4>
            </div>
            <ul className="space-y-2">
              {[
                { label: "Hoje", date: "08/06", appts: "4 agendamentos", highlight: true },
                { label: "Amanhã", date: "09/06", appts: "6 agendamentos", highlight: false },
                { label: "Qua", date: "10/06", appts: "3 agendamentos", highlight: false },
                { label: "Qui", date: "11/06", appts: "7 agendamentos", highlight: true },
                { label: "Sex", date: "12/06", appts: "5 agendamentos", highlight: false },
                { label: "Sáb", date: "13/06", appts: "9 agendamentos", highlight: true },
                { label: "Dom", date: "14/06", appts: "2 agendamentos", highlight: false },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded-md bg-tag-bg px-3 py-2 text-xs">
                  <span className="font-medium text-foreground">
                    {item.label} <span className="text-muted-foreground">({item.date})</span>
                  </span>
                  <span className={item.highlight ? "font-semibold text-accent" : "text-muted-foreground"}>
                    {item.appts}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Serviços Mais Procurados */}
          <div className="rounded-xl border bg-white p-5" style={{ borderWidth: "0.5px" }}>
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <h4 className="text-sm font-semibold text-foreground">Serviços Mais Procurados</h4>
            </div>
            <div className="space-y-5">
              {[
                { name: "1. Corte Degradê", count: "78 agendamentos (35%)", pct: 85, rev: "R$ 7.800,00" },
                { name: "2. Corte + Barba", count: "52 agendamentos (23%)", pct: 65, rev: "R$ 9.360,00" },
                { name: "3. Barba Modelada", count: "38 agendamentos (17%)", pct: 50, rev: "R$ 3.800,00" },
                { name: "4. Coloração", count: "25 agendamentos (11%)", pct: 35, rev: "R$ 5.000,00" },
                { name: "5. Hidratação", count: "18 agendamentos (8%)", pct: 25, rev: "R$ 2.160,00" },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-accent">{s.name}</span>
                    <span className="text-muted-foreground">{s.count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-tag-bg">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${s.pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">Faturou: {s.rev}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <Professionals />
      <Dashboard />
      <BookingDemo />
      <Footer />
    </main>
  );
}
