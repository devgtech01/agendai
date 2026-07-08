'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProfissionalHeader from '@/components/ProfissionalHeader';
import { getEstablishmentByOwnerId, getBookings, getServices, Booking, Service, Establishment } from '@/lib/db';

export default function ProfissionalDashboardPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/profissional');
          return;
        }



        const est = await getEstablishmentByOwnerId(user.id);
        if (!est) {
          return;
        }
        setEstablishment(est);

        // Carregar todos os serviços e todos os agendamentos do estabelecimento
        const servs = await getServices(est.id);
        setServices(servs);

        const bks = await getBookings(est.id);
        setBookings(bks);

        const { data: profs } = await supabase.from('professionals').select('*').eq('establishment_id', est.id);
        if (profs) setProfessionals(profs);
      } catch (err) {
        console.error('Erro ao carregar analíticos do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  // --- CÁLCULO DAS MÉTRICAS ---
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Início e fim da semana atual (segunda a domingo)
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Vetores de meses e dias
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Estados dos gráficos
  const monthlyRevenue = Array(12).fill(0);
  const weekdayClientCount = Array(7).fill(0);
  const serviceStats: { [key: string]: { name: string; count: number; revenue: number } } = {};
  const teamStats: { [key: string]: { name: string; count: number; revenue: number } } = {};

  // Acumuladores de períodos
  let clientsDay = 0, revenueDay = 0;
  let clientsWeek = 0, revenueWeek = 0;
  let clientsMonth = 0, revenueMonth = 0;
  let clientsYear = 0, revenueYear = 0;

  // Previsão para a semana (próximos 7 dias)
  const forecastDays: { dateStr: string; label: string; dateFormatted: string; count: number; revenue: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dateFormatted = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    
    let label = '';
    if (i === 0) label = 'Hoje';
    else if (i === 1) label = 'Amanhã';
    else label = weekdays[d.getDay()];

    forecastDays.push({
      dateStr,
      label,
      dateFormatted,
      count: 0,
      revenue: 0
    });
  }

  // Processamento dos dados
  bookings.forEach((b) => {
    if (b.clientEmail === 'blocked@agendai.com' || b.clientEmail === 'vacation@agendai.com') {
      return;
    }
    const s = services.find((srv) => srv.id === b.serviceId);
    const price = s ? Number(s.price) : 0;
    const sName = s ? s.name : 'Serviço Removido';

    const bDate = new Date(b.date + 'T00:00:00');
    const bYear = bDate.getFullYear();
    const bMonth = bDate.getMonth();
    const bDay = bDate.getDay();

    const isConcluido = b.status === 'Concluido';
    const isAtivo = b.status === 'Concluido' || b.status === 'Confirmado';
    
    // Profissional Name
    let pName = 'Qualquer / Não Atribuído';
    if (b.professionalId) {
      const prof = professionals.find(p => p.id === b.professionalId);
      if (prof) pName = prof.name;
    }

    if (isAtivo) {
      // 1. Receita mensal (ano corrente)
      if (bYear === today.getFullYear()) {
        if (isConcluido) {
          monthlyRevenue[bMonth] += price;
        }
      }

      // 2. Fluxo de clientes semanal (ano corrente)
      if (bYear === today.getFullYear()) {
        weekdayClientCount[bDay]++;
      }

      // 3. Ranking de serviços
      if (!serviceStats[b.serviceId]) {
        serviceStats[b.serviceId] = { name: sName, count: 0, revenue: 0 };
      }
      serviceStats[b.serviceId].count++;
      if (isConcluido) {
        serviceStats[b.serviceId].revenue += price;
      }

      // 3.5. Ranking de Equipe
      if (!teamStats[pName]) {
        teamStats[pName] = { name: pName, count: 0, revenue: 0 };
      }
      teamStats[pName].count++;
      if (isConcluido) {
        teamStats[pName].revenue += price;
      }

      // 4. Métricas por períodos
      // Dia
      if (b.date === todayStr) {
        clientsDay++;
        if (isConcluido) revenueDay += price;
      }
      // Semana
      if (bDate >= startOfWeek && bDate <= endOfWeek) {
        clientsWeek++;
        if (isConcluido) revenueWeek += price;
      }
      // Mês
      if (bMonth === today.getMonth() && bYear === today.getFullYear()) {
        clientsMonth++;
        if (isConcluido) revenueMonth += price;
      }
      // Ano
      if (bYear === today.getFullYear()) {
        clientsYear++;
        if (isConcluido) revenueYear += price;
      }
    }

    // 5. Previsão de Agendamentos (Confirmados e Pendentes)
    if (b.status === 'Confirmado' || b.status === 'Pendente') {
      const fcItem = forecastDays.find((f) => f.dateStr === b.date);
      if (fcItem) {
        fcItem.count++;
        fcItem.revenue += price;
      }
    }
  });

  // Ordenar serviços mais vendidos
  const sortedServices = Object.values(serviceStats)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalServicesCount = sortedServices.reduce((sum, s) => sum + s.count, 0) || 1;

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">Carregando painel de análises...</div>;
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-2">Nenhum estabelecimento encontrado</h2>
          <p>Você precisa completar seu cadastro antes de ver as análises.</p>
        </div>
      </div>
    );
  }

  // Parâmetros de escala para gráficos SVG
  const maxRevenue = Math.max(...monthlyRevenue, 100);
  const maxWeekdayClients = Math.max(...weekdayClientCount, 5);

  // Geração de pontos para o gráfico de linha de faturamento
  const linePoints = monthlyRevenue.map((val, idx) => {
    const x = (idx / 11) * 380 + 40;
    const y = 160 - (val / maxRevenue) * 120;
    return { x, y, val };
  });

  const pathD = linePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${linePoints[11].x} 160 L ${linePoints[0].x} 160 Z`;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <ProfissionalHeader establishmentName={establishment.name} />

      <main className="container" style={{ flex: 1, padding: 'var(--space-8) var(--space-4) calc(80px + var(--space-8)) var(--space-4)' }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Acompanhe os resultados e o crescimento do seu negócio</p>
        </div>

        {/* --- CARDS DE RESUMO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
          
          {/* Card Clientes */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              Clientes Atendidos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Hoje</span>
                <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{clientsDay}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Esta Semana</span>
                <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{clientsWeek}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Mês</span>
                <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{clientsMonth}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Ano</span>
                <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)' }}>{clientsYear}</p>
              </div>
            </div>
          </div>

          {/* Card Faturamento */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              Receita Faturada
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Hoje</span>
                <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)' }}>R$ {revenueDay.toFixed(2).replace('.', ',')}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Esta Semana</span>
                <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)' }}>R$ {revenueWeek.toFixed(2).replace('.', ',')}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Mês</span>
                <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)' }}>R$ {revenueMonth.toFixed(2).replace('.', ',')}</p>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Ano</span>
                <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)' }}>R$ {revenueYear.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>
          </div>

        </div>

        {/* --- SEÇÃO DE GRÁFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
          
          {/* Gráfico 1 - Receita Mensal */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px' }}>
            Evolução do Faturamento Mensal (R$)
            </h3>
            <div style={{ position: 'relative', width: '100%' }}>
              <svg viewBox="0 0 440 180" className="svg-responsive" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', margin: '0 auto' }}>
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="40" x2="420" y2="40" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="420" y2="100" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="40" y1="160" x2="420" y2="160" stroke="var(--color-border)" strokeWidth="0.5" />

                {/* Area under the line */}
                {monthlyRevenue.some(v => v > 0) && (
                  <path d={areaD} fill="url(#gradient-area)" />
                )}

                {/* Line Path */}
                {monthlyRevenue.some(v => v > 0) && (
                  <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
                )}

                {/* Dots & Tooltip labels */}
                {linePoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="4.5" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="2" />
                    {p.val > 0 && (
                      <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="600" fill="var(--color-text)" textAnchor="middle">
                        {Math.round(p.val)}
                      </text>
                    )}
                    {/* Eixo X labels */}
                    <text x={p.x} y="174" fontSize="10" fill="var(--color-muted)" textAnchor="middle">
                      {months[idx]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Gráfico 2 - Fluxo Semanal */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px' }}>
            Fluxo de Clientes por Dia da Semana (Total)
            </h3>
            <div style={{ position: 'relative', width: '100%' }}>
              <svg viewBox="0 0 390 180" className="svg-responsive" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', margin: '0 auto' }}>
                {/* Grid Lines */}
                <line x1="30" y1="30" x2="380" y2="30" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="30" y1="95" x2="380" y2="95" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                <line x1="30" y1="160" x2="380" y2="160" stroke="var(--color-border)" strokeWidth="0.5" />

                {/* Bars */}
                {weekdayClientCount.map((val, idx) => {
                  const barWidth = 28;
                  const x = idx * 50 + 40;
                  const barHeight = (val / maxWeekdayClients) * 120;
                  const y = 160 - barHeight;

                  return (
                    <g key={idx}>
                      {/* Bar Background shadow */}
                      <rect x={x} y="30" width={barWidth} height="130" fill="var(--color-background)" opacity="0.1" rx="4" />
                      {/* Active bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        fill="var(--color-primary)" 
                        rx="4" 
                      />
                      {/* Count text */}
                      {val > 0 && (
                        <text x={x + barWidth / 2} y={y - 6} fontSize="10" fontWeight="600" fill="var(--color-text)" textAnchor="middle">
                          {val}
                        </text>
                      )}
                      {/* Label */}
                      <text x={x + barWidth / 2} y="174" fontSize="10" fill="var(--color-muted)" textAnchor="middle">
                        {weekdays[idx]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

        </div>

        {/* --- FORECAST & RANKING DE SERVIÇOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Previsão para a Semana */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px' }}>
            Previsão de Agendamentos (Próximos 7 Dias)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {forecastDays.map((f, idx) => {
                const hasAppts = f.count > 0;
                return (
                  <div key={idx} className="bg-tag-bg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text)' }}>{f.label}</span>{" "}
                      <span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--color-muted)' }}>({f.dateFormatted})</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: hasAppts ? 600 : 400, fontSize: '12px', color: hasAppts ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                        {f.count === 0 ? 'Nenhum agendado' : `${f.count} ${f.count === 1 ? 'agendamento' : 'agendamentos'}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ranking de Serviços */}
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '16px' }}>
            Serviços Mais Procurados
            </h3>
            
            {sortedServices.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                Nenhum serviço agendado até o momento.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {sortedServices.map((srv, idx) => {
                  const percentage = Math.round((srv.count / totalServicesCount) * 100);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                          {idx + 1}. {srv.name}
                        </span>
                        <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>
                          {srv.count} agendamentos ({percentage}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--color-background)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: 'var(--color-accent)', 
                            borderRadius: '99px' 
                          }} 
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 500, marginTop: '2px' }}>
                        Faturou: R$ {srv.revenue.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* --- RANKING E DESEMPENHO DA EQUIPE --- */}
        {(() => {
          const sortedTeam = Object.values(teamStats).sort((a, b) => b.revenue - a.revenue);
          const totalTeamRevenue = sortedTeam.reduce((acc, p) => acc + p.revenue, 0) || 1;
          const medals = ['🥇 1º Lugar', '🥈 2º Lugar', '🥉 3º Lugar'];

          return (
            <div style={{ 
              background: 'var(--color-surface)', 
              padding: 'var(--space-6)', 
              borderRadius: 'var(--radius-xl)', 
              border: '0.5px solid var(--color-border)', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)', 
              marginTop: 'var(--space-6)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏆 Desempenho & Ranking da Equipe
                  </h3>
                  <p className="text-muted" style={{ fontSize: '13px', margin: '4px 0 0 0' }}>
                    Métricas detalhadas de faturamento, atendimentos e ticket médio por profissional.
                  </p>
                </div>
                <div style={{ background: '#FAF9F6', border: '1px solid var(--color-border)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--color-muted)' }}>
                  Total da Equipe: <strong style={{ color: 'var(--color-success)', fontSize: '14px' }}>R$ {totalTeamRevenue.toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>

              {sortedTeam.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', background: '#FAF9F6', borderRadius: '12px', border: '1px dashed var(--color-border)' }}>
                  <p className="text-muted" style={{ margin: 0, fontSize: '14px' }}>
                    Nenhum atendimento atribuído a profissionais foi concluído ainda.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sortedTeam.map((prof, idx) => {
                    const sharePercentage = Math.round((prof.revenue / totalTeamRevenue) * 100);
                    const ticketMedio = prof.count > 0 ? (prof.revenue / prof.count) : 0;
                    const rankBadge = medals[idx] || `${idx + 1}º Lugar`;

                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: '16px 20px', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: '12px', 
                          background: idx === 0 ? '#FEFBF6' : 'var(--color-surface)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Linha Superior: Info + Faturamento */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: idx === 0 ? '#FEF3E2' : 'var(--color-background)',
                              border: idx === 0 ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: 600,
                              color: 'var(--color-primary)'
                            }}>
                              {prof.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
                                  {prof.name}
                                </h4>
                                <span style={{ 
                                  fontSize: '11px', 
                                  fontWeight: 600, 
                                  padding: '2px 8px', 
                                  borderRadius: '12px', 
                                  background: idx === 0 ? '#FEF3E2' : '#F3EFE9', 
                                  color: idx === 0 ? '#8B5A0A' : 'var(--color-muted)' 
                                }}>
                                  {rankBadge}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                                Participação no Faturamento: <strong>{sharePercentage}%</strong>
                              </span>
                            </div>
                          </div>

                          {/* Valores numéricos em destaque */}
                          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Atendimentos</div>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{prof.count} clientes</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ticket Médio</div>
                              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '100px' }}>
                              <div style={{ fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Receita Total</div>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>
                                R$ {prof.revenue.toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Barra de Progresso de Participação */}
                        <div style={{ width: '100%', height: '6px', background: 'var(--color-background)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${sharePercentage}%`, 
                              height: '100%', 
                              background: idx === 0 ? 'var(--color-primary)' : 'var(--color-accent)', 
                              borderRadius: '99px',
                              transition: 'width 0.4s ease'
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

      </main>
    </div>
  );
}
