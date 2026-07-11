'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Menu,
  X,
  Scissors,
  Award,
  Calendar,
  ChevronRight
} from 'lucide-react';
import './landing.css';

const geoData: Record<string, { cidades: string[]; bairros: Record<string, string[]> }> = {
  BA: { 
    cidades: ['Salvador', 'Feira de Santana'], 
    bairros: { 
      'Salvador': ['Barra', 'Rio Vermelho', 'Pituba'], 
      'Feira de Santana': ['Centro', 'Tomba'] 
    } 
  },
  SP: { 
    cidades: ['São Paulo', 'Campinas'], 
    bairros: { 
      'São Paulo': ['Pinheiros', 'Moema', 'Vila Madalena'], 
      'Campinas': ['Cambuí', 'Taquaral'] 
    } 
  },
  RJ: { 
    cidades: ['Rio de Janeiro', 'Niterói'], 
    bairros: { 
      'Rio de Janeiro': ['Copacabana', 'Ipanema', 'Tijuca'], 
      'Niterói': ['Icaraí', 'Centro'] 
    } 
  }
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFeatureTab, setActiveFeatureTab] = useState<'gestao' | 'cliente'>('gestao');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isTeamSwitchOn, setIsTeamSwitchOn] = useState(false);
  const [geoEstado, setGeoEstado] = useState('');
  const [geoCidade, setGeoCidade] = useState('');
  const [geoBairro, setGeoBairro] = useState('');

  // Cálculo da barra de progresso (onboarding)
  const progressPct = (onboardingStep / 3) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F5F2]" style={{ overflowX: 'hidden' }}>
      {/* =========================================================================
                                     HEADER ATUAL
         ========================================================================= */}
      <header className="sticky top-0 z-50 w-full navbar-premium" style={{ background: 'rgba(26,26,46,0.92)', borderBottom: '1px solid rgba(232,213,183,0.1)' }}>
        <nav className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl text-linen" style={{ textDecoration: 'none', fontWeight: 'bold' }}>
            Agend<span className="text-accent">ai</span>
          </Link>
          
          <ul className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <Link
                href="/profissional"
                className="text-sm font-medium nav-link-animated"
                style={{ color: "rgba(232,213,183,0.55)", textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
              >
                Para Profissionais
              </Link>
            </li>
            <li>
              <Link
                href="/profissional/planos"
                className="text-sm font-medium nav-link-animated"
                style={{ color: "rgba(232,213,183,0.55)", textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
              >
                Planos
              </Link>
            </li>
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/catalog" className="btn-premium-primary rounded-lg px-5 py-2.5 text-sm font-medium" style={{ textDecoration: 'none' }}>
              Agendar
            </Link>
          </div>

          {/* Botão de Menu Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-1 bg-transparent border-0 cursor-pointer text-linen"
            style={{ outline: 'none' }}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Menu Drawer Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden border-t animate-fade-in"
            style={{ 
              background: 'linear-gradient(180deg, #1A1A2E 0%, #151525 100%)',
              borderColor: 'rgba(232, 213, 183, 0.15)',
              padding: '16px 20px 24px 20px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/profissional"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(232, 213, 183, 0.1)',
                  color: '#E8D5B7',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(193, 90, 46, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C15A2E' }}>
                    <Scissors size={18} />
                  </div>
                  <span>Para Profissionais</span>
                </div>
                <ChevronRight size={18} style={{ opacity: 0.5 }} />
              </Link>

              <Link
                href="/profissional/planos"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(232, 213, 183, 0.1)',
                  color: '#E8D5B7',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(232, 213, 183, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8D5B7' }}>
                    <Award size={18} />
                  </div>
                  <span>Planos e Preços</span>
                </div>
                <ChevronRight size={18} style={{ opacity: 0.5 }} />
              </Link>

              <div style={{ height: '1px', background: 'rgba(232, 213, 183, 0.12)', margin: '6px 0' }} />

              <Link 
                href="/catalog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-premium-primary"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  padding: '14px 0',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(193, 90, 46, 0.3)'
                }} 
              >
                <Calendar size={18} />
                <span>Agendar Horário</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
                                     CORPO PRINCIPAL
         ========================================================================= */}
      <main className="flex-grow">
        {/* HERO */}
        <section className="hero">
          <div className="landing-container hero-grid">
            <div>
              <span className="eyebrow">✦ Feito para barbearias, salões e clínicas de estética</span>
              <h1 className="landing-title">Seu salão ou barbearia no <em>piloto automático.</em></h1>
              <p className="lead">O Agendai é o sistema de agendamento e gestão completo que reduz faltas, organiza sua equipe e maximiza o faturamento do seu estabelecimento. Teste grátis hoje.</p>
              <div className="hero-ctas">
                <Link href="/profissional/register" className="btn btn-primary">
                  Começar Teste Gratuito de 30 dias →
                </Link>
                <a href="#funcionalidades" className="btn btn-ghost">Ver como funciona</a>
              </div>
              <p className="hero-note">Sem fidelidade · Cancele quando quiser</p>
            </div>
            <div className="phone-stage">
              <div className="float-card c1"><span className="ico">💈</span><div>Novo agendamento<small>Corte + Barba · 14:30</small></div></div>
              <div className="phone-frame">
                <div className="phone-screen" style={{ background: 'none', display: 'block', padding: 0 }}>
                  <img 
                    src="/imagem_agendai_modelo.png" 
                    alt="Plataforma Agendai" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '34px' }} 
                  />
                </div>
              </div>
              <div className="float-card c2"><span className="ico">⭐</span><div>Avaliação recebida<small>5.0 · Ana P.</small></div></div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features landing-sec" id="funcionalidades">
          <div className="landing-container">
            <div className="section-head">
              <span className="eyebrow">O que você ganha</span>
              <h2 className="landing-h2">Tudo o que o seu negócio precisa, num só lugar</h2>
              <p>Duas frentes trabalhando juntas: a gestão que organiza seu dia a dia e a experiência que fideliza seus clientes.</p>
            </div>

            <div className="feature-tabs">
              <button 
                className={`feature-tab ${activeFeatureTab === 'gestao' ? 'active' : ''}`} 
                onClick={() => setActiveFeatureTab('gestao')}
              >
                Gestão do Estabelecimento
              </button>
              <button 
                className={`feature-tab ${activeFeatureTab === 'cliente' ? 'active' : ''}`} 
                onClick={() => setActiveFeatureTab('cliente')}
              >
                Experiência do Cliente
              </button>
            </div>

            {/* PAINEL GESTÃO */}
            <div className={`feature-panel ${activeFeatureTab === 'gestao' ? 'active' : ''}`} id="panel-gestao">
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="ico">📊</div>
                  <h4 className="landing-h4">Dashboard Financeiro</h4>
                  <p>Faturamento diário, semanal, mensal e anual em gráficos interativos e elegantes, sempre à mão.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">🗺️</div>
                  <h4 className="landing-h4">Ajustes com API do IBGE</h4>
                  <p>Digite o Estado e o sistema sugere cidades e bairros corretos automaticamente, sem erro de cadastro.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">🎧</div>
                  <h4 className="landing-h4">Suporte Integrado</h4>
                  <p>Painel de chamados com prioridades para resolver dúvidas rapidamente, direto por e-mail.</p>
                </div>

                {/* Demo Onboarding */}
                <div className="demo-card">
                  <div>
                    <h4 className="landing-h4" style={{ color: '#fff' }}>Onboarding guiado passo a passo</h4>
                    <p>Configure Endereço, Horários de Funcionamento e Serviços em poucos cliques. Veja o progresso em tempo real.</p>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${Math.max(progressPct, 5)}%` }}></div>
                    </div>
                    <div className="progress-steps">
                      <span className="step done">Endereço</span>
                      <span className={`step ${onboardingStep >= 1 ? 'done' : ''}`}>Horários</span>
                      <span className={`step ${onboardingStep >= 2 ? 'done' : ''}`}>Serviços</span>
                      <span className={`step ${onboardingStep >= 3 ? 'done' : ''}`}>Pronto</span>
                    </div>
                    <div className="demo-btn-row">
                      <button className="demo-btn" onClick={() => setOnboardingStep(0)}>Reiniciar</button>
                      <button 
                        className="demo-btn primary" 
                        onClick={() => setOnboardingStep(prev => prev < 3 ? prev + 1 : prev)}
                      >
                        Avançar etapa →
                      </button>
                    </div>
                  </div>
                  <div className="onboard-visual">
                    <div className="onboard-row">
                      <span className="onboard-check done">✓</span> Endereço do estabelecimento
                    </div>
                    <div className={`onboard-row ${onboardingStep < 1 ? 'muted' : ''}`}>
                      <span className={`onboard-check ${onboardingStep >= 1 ? 'done' : ''}`}>
                        {onboardingStep >= 1 ? '✓' : '·'}
                      </span> 
                      Horários de funcionamento
                    </div>
                    <div className={`onboard-row ${onboardingStep < 2 ? 'muted' : ''}`}>
                      <span className={`onboard-check ${onboardingStep >= 2 ? 'done' : ''}`}>
                        {onboardingStep >= 2 ? '✓' : '·'}
                      </span> 
                      Serviços obrigatórios
                    </div>
                    <div className={`onboard-row ${onboardingStep < 3 ? 'muted' : ''}`}>
                      <span className={`onboard-check ${onboardingStep >= 3 ? 'done' : ''}`}>
                        {onboardingStep >= 3 ? '✓' : '·'}
                      </span> 
                      Estabelecimento pronto para agendar
                    </div>
                  </div>
                </div>

                {/* Toggle equipe */}
                <div className="toggle-block">
                  <div className="txt">
                    <h4 className="landing-h4">Controle flexível de equipe</h4>
                    <p>Deseja adicionar membros à equipe? Ative para liberar cadastro de profissionais, ticket médio e ranking de faturamento individual.</p>
                  </div>
                  <div 
                    className={`switch ${isTeamSwitchOn ? 'on' : ''}`} 
                    onClick={() => setIsTeamSwitchOn(!isTeamSwitchOn)}
                  >
                    <div className="knob"></div>
                  </div>

                  <div className={`team-reveal ${isTeamSwitchOn ? 'open' : ''}`}>
                    <div className="team-grid">
                      <div className="team-member"><div className="avatar">JP</div><div><div className="name">João Pedro</div><div className="rev">R$ 4.280 no mês</div></div><div className="rank">🥇</div></div>
                      <div className="team-member"><div className="avatar">CM</div><div><div className="name">Camila M.</div><div className="rev">R$ 3.910 no mês</div></div><div className="rank">🥈</div></div>
                      <div className="team-member"><div className="avatar">RS</div><div><div className="name">Rafael S.</div><div className="rev">R$ 3.402 no mês</div></div><div className="rank">🥉</div></div>
                    </div>
                  </div>
                </div>

                {/* IBGE demo */}
                <div className="geo-block">
                  <div className="txt">
                    <h4 className="landing-h4">Preenchimento preditivo com o IBGE</h4>
                    <p>Selecione o Estado e veja Cidade e Bairro se ajustarem automaticamente — sem digitar endereço errado.</p>
                  </div>
                  <div className="geo-row">
                    <select 
                      className="geo-select" 
                      value={geoEstado} 
                      onChange={(e) => {
                        setGeoEstado(e.target.value);
                        setGeoCidade('');
                        setGeoBairro('');
                      }}
                    >
                      <option value="">Estado</option>
                      <option value="BA">Bahia</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                    </select>

                    <select 
                      className="geo-select" 
                      value={geoCidade} 
                      disabled={!geoEstado}
                      onChange={(e) => {
                        setGeoCidade(e.target.value);
                        setGeoBairro('');
                      }}
                    >
                      <option value="">Cidade</option>
                      {geoEstado && geoData[geoEstado]?.cidades.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <select 
                      className="geo-select" 
                      value={geoBairro} 
                      disabled={!geoCidade}
                      onChange={(e) => setGeoBairro(e.target.value)}
                    >
                      <option value="">Bairro</option>
                      {geoEstado && geoCidade && geoData[geoEstado]?.bairros[geoCidade]?.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* PAINEL CLIENTE */}
            <div className={`feature-panel ${activeFeatureTab === 'cliente' ? 'active' : ''}`} id="panel-cliente">
              <div className="feature-grid">
                <div className="feature-card">
                  <div className="ico">🏪</div>
                  <h4 className="landing-h4">Vitrine exclusiva</h4>
                  <p>Página personalizada com fotos, endereço completo e todos os serviços do seu estabelecimento.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">🔎</div>
                  <h4 className="landing-h4">Filtros geográficos em cascata</h4>
                  <p>Clientes encontram você buscando por Estado, Cidade e Bairro de forma simples e inteligente.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">⏰</div>
                  <h4 className="landing-h4">Lembrete de 2h antes</h4>
                  <p>E-mail automático responsivo com botão de cancelamento rápido, liberando a vaga na hora.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">⭐</div>
                  <h4 className="landing-h4">Portal de avaliação</h4>
                  <p>Clientes avaliam de 1 a 5 estrelas após o atendimento, alimentando o ranking dos profissionais.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">📅</div>
                  <h4 className="landing-h4">Agendamento 24/7</h4>
                  <p>Sem depender de WhatsApp: seus clientes marcam horário a qualquer momento, de qualquer lugar.</p>
                </div>
                <div className="feature-card">
                  <div className="ico">✉️</div>
                  <h4 className="landing-h4">Comunicação via Resend</h4>
                  <p>E-mails transacionais entregues com confiabilidade, do agendamento à confirmação.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARATIVO */}
        <section className="compare landing-sec" id="comparativo">
          <div className="landing-container">
            <div className="section-head">
              <span className="eyebrow">Antes e depois</span>
              <h2 className="landing-h2">O tempo que você recupera com o Agendai</h2>
              <p>A diferença entre administrar no improviso e administrar com controle.</p>
            </div>
            <div className="compare-grid">
              <div className="compare-card before">
                <h3 className="landing-h3">Sem Agendai</h3>
                <ul className="compare-list">
                  <li><span className="mark">✕</span> WhatsApp congestionado de mensagens e áudios</li>
                  <li><span className="mark">✕</span> No-shows sem aviso, horário perdido</li>
                  <li><span className="mark">✕</span> Caixa controlado em caderno ou planilha solta</li>
                  <li><span className="mark">✕</span> Nenhuma visão clara do desempenho da equipe</li>
                  <li><span className="mark">✕</span> Clientes esperando resposta para agendar</li>
                </ul>
              </div>
              <div className="compare-card after">
                <h3 className="landing-h3">Com Agendai</h3>
                <ul className="compare-list">
                  <li><span className="mark">✓</span> Agendamentos abertos 24 horas por dia</li>
                  <li><span className="mark">✓</span> Lembrete automático 2h antes reduz faltas</li>
                  <li><span className="mark">✓</span> Caixa e faturamento sob controle em tempo real</li>
                  <li><span className="mark">✓</span> Ranking de equipe e ticket médio automáticos</li>
                  <li><span className="mark">✓</span> Cliente agenda sozinho, sem fricção</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing landing-sec" id="planos">
          <div className="landing-container">
            <div className="section-head">
              <span className="eyebrow">Planos</span>
              <h2 className="landing-h2">Um plano completo, no período que fizer sentido pra você</h2>
              <p>Todos os benefícios inclusos em qualquer período. Quanto mais tempo, maior o desconto.</p>
            </div>

            <div className="plans-grid">
              <div className="plan-card">
                <div className="plan-name">Mensal</div>
                <div className="plan-price">R$34,90<span>/mês</span></div>
                <p className="plan-desc">Flexibilidade total, mês a mês.</p>
                <ul className="plan-features">
                  <li><span className="mark">✓</span> Agendamento ilimitado</li>
                  <li><span className="mark">✓</span> Relatórios com dashboard</li>
                  <li><span className="mark">✓</span> Controle financeiro</li>
                  <li><span className="mark">✓</span> Previsões de agendamento</li>
                  <li><span className="mark">✓</span> Suporte humanizado</li>
                </ul>
                <Link href="/profissional/register" className="btn plan-cta" style={{ textDecoration: 'none' }}>
                  Começar teste grátis
                </Link>
              </div>

              <div className="plan-card featured">
                <span className="plan-badge">Economize 15%</span>
                <div className="plan-name">Semestral</div>
                <div className="plan-price">R$174,88<span>/semestre</span></div>
                <p className="plan-desc">Equivale a R$29,15/mês — 15% mais barato que o mensal.</p>
                <ul className="plan-features">
                  <li><span className="mark">✓</span> Agendamento ilimitado</li>
                  <li><span className="mark">✓</span> Relatórios com dashboard</li>
                  <li><span className="mark">✓</span> Controle financeiro</li>
                  <li><span className="mark">✓</span> Previsões de agendamento</li>
                  <li><span className="mark">✓</span> Suporte humanizado</li>
                </ul>
                <Link href="/profissional/register" className="btn btn-primary plan-cta" style={{ textDecoration: 'none' }}>
                  Começar teste grátis
                </Link>
              </div>

              <div className="plan-card">
                <span className="plan-badge" style={{ background: 'var(--primary)' }}>Economize 25%</span>
                <div className="plan-name">Anual</div>
                <div className="plan-price">R$306,00<span>/ano</span></div>
                <p className="plan-desc">Equivale a R$25,50/mês — 25% mais barato que o mensal.</p>
                <ul className="plan-features">
                  <li><span className="mark">✓</span> Agendamento ilimitado</li>
                  <li><span className="mark">✓</span> Relatórios com dashboard</li>
                  <li><span className="mark">✓</span> Controle financeiro</li>
                  <li><span className="mark">✓</span> Previsões de agendamento</li>
                  <li><span className="mark">✓</span> Suporte humanizado</li>
                </ul>
                <Link href="/profissional/register" className="btn plan-cta" style={{ textDecoration: 'none' }}>
                  Começar teste grátis
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="landing-sec">
          <div className="landing-container">
            <div className="final-cta">
              <h2 className="landing-h2" style={{ color: '#fff' }}>Pronto para colocar sua agenda no piloto automático?</h2>
              <p>Comece o teste gratuito de 30 dias agora — sem fidelidade.</p>
              <div className="hero-ctas" style={{ justifyContent: 'center' }}>
                <Link href="/profissional/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Começar Teste Gratuito de 30 dias →
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
                                     FOOTER ATUALIZADO
         ========================================================================= */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href="/" className="logo" style={{ textDecoration: 'none' }}><span className="dot"></span>Agendai</Link>
              <p>Sistema de agendamento e gestão completo para barbearias, salões de beleza, clínicas de estética e profissionais independentes.</p>
            </div>
            <div className="footer-col">
              <h5>Produto</h5>
              <ul style={{ padding: 0 }}>
                <li><a href="#funcionalidades">Funcionalidades</a></li>
                <li><a href="#planos">Planos</a></li>
                <li><a href="#comparativo">Resultados</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Legal</h5>
              <ul style={{ padding: 0 }}>
                <li><Link href="/termos">Termos de Uso</Link></li>
                <li><Link href="/privacidade">Política de Privacidade</Link></li>
                <li><Link href="/suporte">Central de Ajuda</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h5>Contato</h5>
              <ul style={{ padding: 0 }}>
                <li><a href="/suporte">Suporte</a></li>
                <li><Link href="/suporte">Central de Ajuda</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Agendai. Todos os direitos reservados.</span>
            <div className="trust-badges">
              <span className="stripe-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: '16px', height: '16px' }}>
                  <path d="M12 2L3 6v6c0 5.2 3.8 9.7 9 11 5.2-1.3 9-5.8 9-11V6l-9-4z" fill="#635BFF"/>
                  <path d="M9.5 12.2l1.8 1.8 3.7-3.9" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="stripe-copy">Pagamento 100% seguro via</span>
                <span className="stripe-wordmark">Stripe</span>
              </span>
              <span className="badge-sec">✓ Sem fidelidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
