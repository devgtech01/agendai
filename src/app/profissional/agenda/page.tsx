'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getEstablishmentByOwnerId, getBookingsByDate, getServices, Booking, Service, Establishment, Professional } from '@/lib/db';

export default function ProfissionalAgendaPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // States para Férias
  const [vacationStart, setVacationStart] = useState('');
  const [vacationEnd, setVacationEnd] = useState('');
  const [savingVacation, setSavingVacation] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/profissional');
        return;
      }

      if (user.user_metadata?.plan_status !== 'active') {
        router.push('/profissional/settings?tab=billing');
        return;
      }

      const est = await getEstablishmentByOwnerId(user.id);
      if (!est) {
        setLoading(false);
        return;
      }
      setEstablishment(est);

      const servs = await getServices(est.id);
      setServices(servs);

      const { data: profs } = await supabase.from('professionals').select('*').eq('establishment_id', est.id);
      if (profs) {
        const mappedProfs = profs.map(p => ({
          id: p.id,
          establishmentId: p.establishment_id,
          name: p.name,
          bio: p.bio
        }));
        setProfessionals(mappedProfs);
      }

      const bks = await getBookingsByDate(est.id, selectedDate, selectedProfessionalId || undefined);
      setBookings(bks);

      setLoading(false);
    }
    loadDashboard();
  }, [router, selectedDate, selectedProfessionalId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  const handleConcluir = async (bookingId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'Concluido' })
      .eq('id', bookingId)
      .select()
      .single();

    if (!error && data) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'Concluido' } : b)));
    } else {
      alert('Erro ao concluir agendamento.');
    }
  };

  const handleCancelar = async (bookingId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'Cancelado' })
      .eq('id', bookingId)
      .select()
      .single();

    if (!error && data) {
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } else {
      alert('Erro ao cancelar agendamento.');
    }
  };

  // Funções de Bloqueio
  const handleBlockSlot = async (timeStr: string) => {
    if (!establishment || services.length === 0) return;
    try {
      const { data, error } = await supabase.from('bookings').insert([
        {
          establishment_id: establishment.id,
          service_id: services[0].id, // Usa o primeiro serviço para satisfazer FK
          client_name: 'Bloqueio de Horário',
          client_email: 'blocked@agendai.com',
          client_phone: '00000000000',
          date: selectedDate,
          time: timeStr.length === 5 ? `${timeStr}:00` : timeStr,
          status: 'Confirmado'
        }
      ]).select().single();

      if (error) {
        console.error('Erro ao bloquear horário:', error);
        alert('Erro ao bloquear horário.');
      } else {
        const bks = await getBookingsByDate(establishment.id, selectedDate, selectedProfessionalId || undefined);
        setBookings(bks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblockSlot = async (bookingId: string) => {
    if (!establishment) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);
      
      if (error) {
        console.error('Erro ao desbloquear horário:', error);
        alert('Erro ao desbloquear horário.');
      } else {
        const bks = await getBookingsByDate(establishment.id, selectedDate, selectedProfessionalId || undefined);
        setBookings(bks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Funções de Férias
  const handleSaveVacation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishment || services.length === 0 || !vacationStart || !vacationEnd) return;
    if (new Date(vacationStart) > new Date(vacationEnd)) {
      alert('A data de início não pode ser posterior à data de término.');
      return;
    }

    setSavingVacation(true);
    try {
      const start = new Date(vacationStart + 'T12:00:00');
      const end = new Date(vacationEnd + 'T12:00:00');
      
      const datesToBlock = [];
      const current = new Date(start);
      while (current <= end) {
        datesToBlock.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }

      for (const d of datesToBlock) {
        await supabase.from('bookings').insert([
          {
            establishment_id: establishment.id,
            service_id: services[0].id,
            client_name: 'Férias / Recesso',
            client_email: 'vacation@agendai.com',
            client_phone: '00000000000',
            date: d,
            time: '00:00:00',
            status: 'Confirmado'
          }
        ]);
      }

      alert('Férias configuradas com sucesso para o período selecionado!');
      setVacationStart('');
      setVacationEnd('');
      
      const bks = await getBookingsByDate(establishment.id, selectedDate);
      setBookings(bks);
    } catch (err) {
      console.error('Erro ao salvar férias:', err);
      alert('Erro ao configurar férias.');
    } finally {
      setSavingVacation(false);
    }
  };

  const handleRemoveVacation = async () => {
    if (!establishment || !confirm('Deseja remover o recesso deste dia e reativar seus horários de trabalho?')) return;
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('establishment_id', establishment.id)
        .eq('date', selectedDate)
        .eq('client_email', 'vacation@agendai.com');
      
      if (error) {
        alert('Erro ao reativar dia de trabalho.');
      } else {
        alert('Dia de trabalho reativado com sucesso!');
        const bks = await getBookingsByDate(establishment.id, selectedDate);
        setBookings(bks);
      }
    } catch (err) {
      console.error('Erro ao remover recesso:', err);
    }
  };

  const getServiceName = (serviceId: string) => {
    const s = services.find((srv) => srv.id === serviceId);
    return s ? s.name : 'Serviço Removido';
  };

  // --- CÁLCULO DE MÉTRICAS (Filtra bloqueios/férias) ---
  const realBookings = bookings.filter(b => b.clientEmail !== 'blocked@agendai.com' && b.clientEmail !== 'vacation@agendai.com');
  const atendimentosHoje = realBookings.length;
  const ganhosHoje = realBookings.reduce((total, b) => {
    const s = services.find((srv) => srv.id === b.serviceId);
    return total + (s ? Number(s.price) : 0);
  }, 0);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Gera os 7 dias da semana centrados na selectedDate
  const ribbonDays = [];
  const baseDate = new Date(selectedDate + 'T12:00:00');
  for (let i = -3; i <= 3; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isSelected = dateStr === selectedDate;
    ribbonDays.push({
      dateStr,
      dayNumber: d.getDate().toString().padStart(2, '0'),
      dayName: weekdays[d.getDay()],
      isSelected
    });
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">Carregando agenda...</div>;
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div style={{ textAlign: 'center' }}>
          <h2 className="heading-2">Nenhum estabelecimento encontrado</h2>
          <p>Você precisa completar seu cadastro antes de acessar a agenda.</p>
        </div>
      </div>
    );
  }

  // --- GERAÇÃO DA LINHA DO TEMPO DIÁRIA ---
  const openingTime = establishment.openingTime ? establishment.openingTime.slice(0, 5) : '08:00';
  const closingTime = establishment.closingTime ? establishment.closingTime.slice(0, 5) : '19:00';
  const lunchStart = establishment.lunchStart ? establishment.lunchStart.slice(0, 5) : '12:00';
  const lunchEnd = establishment.lunchEnd ? establishment.lunchEnd.slice(0, 5) : '13:00';

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const startMin = timeToMinutes(openingTime);
  const endMin = timeToMinutes(closingTime);
  const lunchStartMin = timeToMinutes(lunchStart);
  const lunchEndMin = timeToMinutes(lunchEnd);
  const hasLunchBreak = lunchStartMin !== lunchEndMin;

  const isVacationDay = bookings.some(b => b.clientEmail === 'vacation@agendai.com');

  // Mapeia os agendamentos ativos (reais e bloqueios rápidos) para a timeline
  const activeBookings = bookings
    .filter(b => b.clientEmail !== 'vacation@agendai.com')
    .map(b => {
      const bStart = timeToMinutes(b.time.slice(0, 5));
      const bService = services.find(s => s.id === b.serviceId);
      const bDuration = bService ? bService.durationMinutes : 30;
      return {
        ...b,
        start: bStart,
        end: bStart + bDuration,
      };
    })
    .sort((a, b) => a.start - b.start);

  const timelineRows = [];
  let currentMin = startMin;
  const gridStep = 30;

  while (currentMin + 30 <= endMin) {
    // 1. Almoço
    if (hasLunchBreak && currentMin >= lunchStartMin && currentMin < lunchEndMin) {
      timelineRows.push({
        type: 'lunch',
        timeStr: minutesToTime(currentMin),
        label: 'Almoço',
        duration: lunchEndMin - currentMin
      });
      currentMin = lunchEndMin;
      continue;
    }

    // 2. Colisão ou agendamento ativo
    const overlappingBooking = activeBookings.find(b => currentMin >= b.start && currentMin < b.end);

    if (overlappingBooking) {
      if (overlappingBooking.start === currentMin) {
        timelineRows.push({
          type: 'booking',
          booking: overlappingBooking,
          timeStr: minutesToTime(currentMin)
        });
      }
      currentMin = overlappingBooking.end;
    } else {
      timelineRows.push({
        type: 'free',
        timeStr: minutesToTime(currentMin)
      });
      currentMin += gridStep;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <style>{`
        .timeline-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-top: var(--space-4);
        }
        @media (min-width: 992px) {
          .timeline-grid {
            grid-template-columns: 2fr 1fr;
          }
        }
        .striped-block {
          background: repeating-linear-gradient(
            45deg,
            #FAF9F6,
            #FAF9F6 10px,
            #F3EFE9 10px,
            #F3EFE9 20px
          );
        }
      `}</style>

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
              <Link href="/profissional/agenda" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text)' }}>Minha Agenda</Link>
              <Link href="/profissional/services" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Meus Serviços</Link>
              <Link href="/profissional/team" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Minha Equipe</Link>
              <Link href="/profissional/settings" style={{ fontSize: '14px', color: 'var(--color-muted)', textDecoration: 'none' }}>Meu Estabelecimento</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '14px', color: 'var(--color-muted)' }}>{establishment.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: 'var(--space-10) var(--space-6)' }}>
        {services.length === 0 && (
          <div style={{
            background: '#FEF3E2',
            border: '1px solid #FCD9A5',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#8B5A0A', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                ⚠️ Configure seus serviços
              </h3>
              <p style={{ fontSize: '14px', color: '#5F5A54', marginTop: '6px', marginBottom: 0, lineHeight: 1.5 }}>
                Seu estabelecimento ainda não possui serviços ativos. Cadastre pelo menos um serviço para que os clientes possam realizar agendamentos.
              </p>
            </div>
            <Link href="/profissional/services" className="btn btn-primary" style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
              Cadastrar Primeiro Serviço
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 className="heading-1">Minha Agenda</h1>
            <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>Controle seus agendamentos diários</p>
          </div>
          <div className="flex gap-4 items-end flex-wrap">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '4px' }}>Profissional</label>
              <select 
                className="input" 
                style={{ padding: '8px 12px', minWidth: '200px' }}
                value={selectedProfessionalId}
                onChange={(e) => setSelectedProfessionalId(e.target.value)}
              >
                <option value="">Todos os profissionais</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '4px' }}>Data da Agenda</label>
              <input 
                type="date" 
                className="input" 
                style={{ padding: '8px 12px', minWidth: '160px' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Resumo / Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Atendimentos no Dia</p>
            <h3 style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-text)' }}>{atendimentosHoje}</h3>
          </div>
          <div style={{ background: 'var(--color-surface)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Ganhos do Dia (Est.)</p>
            <h3 style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-text)' }}>R$ {ganhosHoje.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        {/* Ribbon de Navegação de Dias */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          background: 'var(--color-surface)', 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-lg)', 
          border: '0.5px solid var(--color-border)', 
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          gap: '8px'
        }}>
          {ribbonDays.map((rd, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(rd.dateStr)}
              style={{
                flex: 1,
                minWidth: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 6px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: rd.isSelected ? 'var(--color-accent)' : 'transparent',
                color: rd.isSelected ? '#FFFFFF' : 'var(--color-text)',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                if (!rd.isSelected) e.currentTarget.style.background = 'var(--color-background)';
              }}
              onMouseLeave={(e) => {
                if (!rd.isSelected) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', opacity: rd.isSelected ? 0.9 : 0.6, marginBottom: '4px' }}>
                {rd.dayName}
              </span>
              <span style={{ fontSize: '18px', fontWeight: 600 }}>
                {rd.dayNumber}
              </span>
            </button>
          ))}
        </div>

        {/* Banner de Recesso / Férias */}
        {isVacationDay && (
          <div style={{
            background: '#FEF3E2',
            border: '1px solid #FCD9A5',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '32px' }}>🌴</span>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#8B5A0A', margin: 0 }}>Férias / Recesso Ativo</h3>
            <p style={{ fontSize: '14px', color: '#5F5A54', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
              Seu estabelecimento está configurado como fechado nesta data. Clientes não conseguirão agendar horários hoje.
            </p>
            <button 
              onClick={handleRemoveVacation}
              className="btn btn-primary"
              style={{ marginTop: '8px' }}
            >
              Reativar Dia de Trabalho
            </button>
          </div>
        )}

        {/* Grid Principal da Linha do Tempo e Configurações */}
        <div className="timeline-grid">
          
          {/* Lado Esquerdo: Linha do Tempo */}
          <div>
            <h2 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Linha do Tempo do Dia</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isVacationDay ? (
                <div style={{ 
                  padding: 'var(--space-12)', 
                  textAlign: 'center', 
                  background: 'var(--color-surface)', 
                  borderRadius: 'var(--radius-lg)', 
                  border: '0.5px solid var(--color-border)',
                  color: 'var(--color-muted)' 
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌴</div>
                  <p style={{ fontWeight: 500, fontSize: '16px', color: 'var(--color-text)' }}>Fechado por recesso</p>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>Nenhum atendimento agendado ou disponível para hoje.</p>
                </div>
              ) : (
                timelineRows.map((row, idx) => {
                  if (row.type === 'lunch') {
                    return (
                      <div 
                        key={`lunch-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: '#FFFEE8',
                          borderRadius: 'var(--radius-lg)',
                          border: '0.5px solid #F3ED80',
                          borderLeft: '4px solid #E6D24A',
                          padding: '16px 20px',
                          color: '#70641A'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 600, minWidth: '70px' }}>{row.timeStr}</div>
                        <div style={{ flex: 1, marginLeft: '16px', fontSize: '14px', fontWeight: 500 }}>
                          🍲 Horário de Almoço ({row.duration} min)
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.8 }}>Pausa padrão</div>
                      </div>
                    );
                  }

                  if (row.type === 'free') {
                    return (
                      <div 
                        key={`free-${row.timeStr}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-lg)',
                          border: '1px dashed var(--color-border)',
                          padding: '16px 20px',
                          transition: 'all var(--transition-normal)'
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-muted)', minWidth: '70px' }}>{row.timeStr}</div>
                        <div style={{ flex: 1, marginLeft: '16px', fontSize: '14px', color: 'var(--color-muted)' }}>
                          ✨ Horário Livre
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleBlockSlot(row.timeStr)}
                        >
                          Bloquear
                        </button>
                      </div>
                    );
                  }

                  // Tipo: Booking (Real ou Bloqueado)
                  const apt = row.booking!;
                  const isBlocked = apt.clientEmail === 'blocked@agendai.com';

                  if (isBlocked) {
                    return (
                      <div 
                        key={`blocked-${apt.id}`}
                        className="striped-block"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 'var(--radius-lg)',
                          border: '0.5px solid var(--color-border)',
                          borderLeft: '4px solid #8C8378',
                          padding: '16px 20px',
                        }}
                      >
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', minWidth: '70px' }}>{row.timeStr}</div>
                        <div style={{ flex: 1, marginLeft: '16px' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>
                            🔒 Horário Bloqueado
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            Indisponível para clientes
                          </div>
                        </div>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                          onClick={() => handleUnblockSlot(apt.id)}
                        >
                          Desbloquear
                        </button>
                      </div>
                    );
                  }

                  // Agendamento Real de Cliente
                  const s = services.find((srv) => srv.id === apt.serviceId);
                  const price = s ? Number(s.price) : 0;
                  const duration = s ? s.durationMinutes : 0;
                  
                  let leftBorderColor = 'var(--color-border)';
                  let statusBg = 'var(--color-background)';
                  let statusColor = 'var(--color-muted)';
                  
                  if (apt.status === 'Confirmado') {
                    leftBorderColor = 'var(--color-accent)';
                    statusBg = '#EAF7EC';
                    statusColor = '#2A6B31';
                  } else if (apt.status === 'Concluido') {
                    leftBorderColor = 'var(--color-success)';
                    statusBg = 'var(--color-border)';
                    statusColor = 'var(--color-muted)';
                  } else if (apt.status === 'Pendente') {
                    leftBorderColor = 'var(--color-warning)';
                    statusBg = '#FEF3E2';
                    statusColor = '#8B5A0A';
                  }

                  return (
                    <div 
                      key={apt.id} 
                      style={{ 
                        display: 'flex',
                        background: 'var(--color-surface)', 
                        borderRadius: 'var(--radius-lg)', 
                        border: '0.5px solid var(--color-border)', 
                        borderLeft: `4px solid ${leftBorderColor}`,
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                        transition: 'all var(--transition-normal)',
                      }}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '70px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                          {row.timeStr}
                        </div>
                      </div>

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-text)' }}>
                            {apt.clientName}
                          </span>
                          <a 
                            href={`https://wa.me/55${apt.clientPhone.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              fontSize: '12px', 
                              color: '#25D366', 
                              textDecoration: 'none', 
                              fontWeight: 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            💬 {apt.clientPhone}
                          </a>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span>{getServiceName(apt.serviceId)}</span>
                          <span>•</span>
                          <span>⏱ {duration} min</span>
                          <span>•</span>
                          <span style={{ fontWeight: 500, color: 'var(--color-accent)' }}>R$ {price.toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <span 
                          style={{ 
                            background: statusBg,
                            color: statusColor,
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: 'var(--radius-sm)',
                            border: apt.status === 'Concluido' ? '1px solid var(--color-border)' : 'none'
                          }}
                        >
                          {apt.status}
                        </span>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {apt.status !== 'Concluido' && (
                            <>
                              <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleConcluir(apt.id)}
                                style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                              >
                                Concluir
                              </button>
                              <button 
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleCancelar(apt.id)}
                                style={{ 
                                  height: '36px',
                                  padding: '0 12px', 
                                  fontSize: '13px', 
                                  color: 'var(--color-danger)', 
                                  borderColor: 'var(--color-danger)',
                                  background: 'transparent'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#FCEAEA'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lado Direito: Painel de Férias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              background: 'var(--color-surface)',
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              border: '0.5px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              height: 'fit-content'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', margin: 0 }}>
                🌴 Férias e Recessos
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: '1.5', margin: 0 }}>
                Configure períodos em que seu estabelecimento estará totalmente fechado. Clientes não poderão realizar agendamentos nestas datas.
              </p>
              
              <form onSubmit={handleSaveVacation} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)' }}>Data de Início</label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ padding: '8px 12px' }}
                    value={vacationStart}
                    onChange={(e) => setVacationStart(e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)' }}>Data de Término</label>
                  <input 
                    type="date" 
                    className="input" 
                    style={{ padding: '8px 12px' }}
                    value={vacationEnd}
                    onChange={(e) => setVacationEnd(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '4px' }}
                  disabled={savingVacation}
                >
                  {savingVacation ? 'Agendando...' : 'Bloquear Período'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
