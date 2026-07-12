'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  imageUrl: string;
}

interface Establishment {
  id: string;
  name: string;
  address: string;
  openingTime?: string;
  closingTime?: string;
  lunchStart?: string;
  lunchEnd?: string;
  amenities?: string;
}

interface Professional {
  id: string;
  establishmentId: string;
  name: string;
  bio: string;
}

interface Booking {
  id: string;
  establishmentId: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  status: string;
}

export default function BookingClient({ serviceId }: { serviceId: string }) {
  const [service, setService] = useState<Service | null>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0); // 0: Profissional, 1: Date/Time, 2: Client Info, 3: Confirm, 4: Success
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Informações do cliente
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  
  // Horários ocupados na data selecionada
  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  // Buscar serviço e estabelecimento inicial
  useEffect(() => {
    async function fetchData() {
      try {
        const resService = await fetch('/api/services');
        if (resService.ok) {
          const allServices: Service[] = await resService.json();
          const foundService = allServices.find(s => s.id === serviceId);
          if (foundService) {
            setService(foundService);
            
            const estServices = allServices.filter(s => s.establishmentId === foundService.establishmentId);
            setServices(estServices);
            
            // Buscar estabelecimento
            const resEst = await fetch('/api/establishments');
            if (resEst.ok) {
              const establishments: Establishment[] = await resEst.json();
              const foundEst = establishments.find(e => e.id === foundService.establishmentId);
              if (foundEst) setEstablishment(foundEst);
            }
            
            // Buscar profissionais
            const resProfs = await fetch(`/api/professionals?establishmentId=${foundService.establishmentId}`);
            if (resProfs.ok) {
              const profs = await resProfs.json();
              setProfessionals(profs);
              if (profs.length === 0) {
                setStep(1); // Avança direto para Data & Hora se não houver profissionais cadastrados
              }
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados de agendamento:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [serviceId]);

  // Buscar horários ocupados ao mudar a data selecionada
  useEffect(() => {
    if (!selectedDate || !service) return;

    async function fetchBookedSlots() {
      setLoadingSlots(true);
      try {
        const profQuery = selectedProfessionalId ? `&professionalId=${selectedProfessionalId}` : '';
        const res = await fetch(`/api/bookings?establishmentId=${service?.establishmentId}&date=${selectedDate}${profQuery}`);
        if (res.ok) {
          const bookings: Booking[] = await res.json();
          setBookingsForSelectedDate(bookings);
        }
      } catch (err) {
        console.error('Erro ao carregar disponibilidade:', err);
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchBookedSlots();
  }, [selectedDate, service]);

  if (loading) {
    return <div className="text-muted text-center" style={{ padding: '20px' }}>Carregando detalhes do serviço...</div>;
  }

  if (!service || !establishment) {
    return <div className="text-muted text-center" style={{ padding: '20px' }}>Serviço ou estabelecimento não encontrado.</div>;
  }

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const isPastTime = (timeStr: string) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (selectedDate === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return timeToMinutes(timeStr) <= currentMinutes;
    }
    return false;
  };

  const generateSlots = () => {
    if (!establishment || !service) return [];

    // Verificar se a data selecionada é domingo
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const isSunday = dateObj.getDay() === 0;

    const amsList = (establishment.amenities || '').split(',');
    const isSundayActive = amsList.includes('sunday_active');

    if (isSunday && !isSundayActive) {
      return []; // Fechado aos domingos
    }

    const openingTime = establishment.openingTime ? establishment.openingTime.slice(0, 5) : '08:00';
    let closingTime = establishment.closingTime ? establishment.closingTime.slice(0, 5) : '19:00';

    if (isSunday && isSundayActive) {
      const sundayClosingField = amsList.find(a => a.startsWith('sunday_closing_'));
      if (sundayClosingField) {
        closingTime = sundayClosingField.replace('sunday_closing_', '');
      } else {
        closingTime = '12:00'; // Default se não configurado
      }
    }

    const startMin = timeToMinutes(openingTime);
    const endMin = timeToMinutes(closingTime);
    const serviceDur = service.durationMinutes;

    const lunchStartMin = establishment.lunchStart ? timeToMinutes(establishment.lunchStart.slice(0, 5)) : 720;
    const lunchEndMin = establishment.lunchEnd ? timeToMinutes(establishment.lunchEnd.slice(0, 5)) : 780;
    const hasLunchBreak = lunchStartMin !== lunchEndMin;

    const activeBookings = bookingsForSelectedDate
      .map(b => {
        const bStart = timeToMinutes(b.time.slice(0, 5));
        const bService = services.find(s => s.id === b.serviceId);
        const bDuration = bService ? bService.durationMinutes : 30;
        return {
          start: bStart,
          end: bStart + bDuration,
          serviceId: b.serviceId
        };
      })
      .sort((a, b) => a.start - b.start);

    const slots: { time: string; isBooked: boolean }[] = [];
    let currentMin = startMin;
    const gridStep = 30;

    while (currentMin + serviceDur <= endMin) {
      // 1. Verifica se o ponteiro atual cai dentro do horário de almoço
      if (hasLunchBreak && currentMin >= lunchStartMin && currentMin < lunchEndMin) {
        currentMin = lunchEndMin;
        continue;
      }

      // 2. Verifica se o serviço solicitado colidiria com o início do almoço
      if (hasLunchBreak && currentMin < lunchEndMin && currentMin + serviceDur > lunchStartMin) {
        currentMin = lunchEndMin;
        continue;
      }

      // 3. Verifica se o ponteiro atual cai dentro de algum agendamento existente
      const overlappingBooking = activeBookings.find(b => currentMin >= b.start && currentMin < b.end);

      if (overlappingBooking) {
        // Se cai dentro, esse horário de início do agendamento está indisponível
        const bookingStartStr = minutesToTime(overlappingBooking.start);
        if (!slots.some(s => s.time === bookingStartStr)) {
          slots.push({ time: bookingStartStr, isBooked: true });
        }
        // Pula o ponteiro atual para o final deste agendamento
        currentMin = overlappingBooking.end;
        continue;
      }

      // Verifica se o serviço solicitado colidiria com algum agendamento seguinte
      const nextBookingConflict = activeBookings.find(b => currentMin < b.end && currentMin + serviceDur > b.start);

      if (nextBookingConflict) {
        const slotTimeStr = minutesToTime(currentMin);
        if (!slots.some(s => s.time === slotTimeStr)) {
          slots.push({ time: slotTimeStr, isBooked: true });
        }
        currentMin += gridStep;
      } else {
        const slotTimeStr = minutesToTime(currentMin);
        if (!slots.some(s => s.time === slotTimeStr)) {
          slots.push({ time: slotTimeStr, isBooked: false });
        }
        currentMin += gridStep;
      }
    }

    return slots.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  };

  const isVacationDay = bookingsForSelectedDate.some(b => b.clientEmail === 'vacation@agendai.com');
  const availableSlots = isVacationDay ? [] : generateSlots();

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId: service.establishmentId,
          serviceId: service.id,
          professionalId: selectedProfessionalId || null,
          clientName,
          clientEmail,
          clientPhone,
          date: selectedDate,
          time: selectedTime
        })
      });

      if (res.ok) {
        setStep(4);
      } else {
        const errData = await res.json();
        setErrorMessage(errData.error || 'Erro ao agendar. Tente novamente.');
      }
    } catch (err) {
      setErrorMessage('Erro na comunicação com o servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '600px', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
      {step < 4 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {professionals.length > 0 && (
              <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 0 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
            )}
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 1 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 2 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: step >= 3 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-muted)' }}>
            {professionals.length > 0 && (
              <span style={{ color: step >= 0 ? 'var(--color-accent)' : '', fontWeight: step >= 0 ? 500 : 400 }}>Equipe</span>
            )}
            <span style={{ color: step >= 1 ? 'var(--color-accent)' : '', fontWeight: step >= 1 ? 500 : 400 }}>Data & Hora</span>
            <span style={{ color: step >= 2 ? 'var(--color-accent)' : '', fontWeight: step >= 2 ? 500 : 400 }}>Dados</span>
            <span style={{ color: step >= 3 ? 'var(--color-accent)' : '', fontWeight: step >= 3 ? 500 : 400 }}>Confirmação</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {/* ETAPA 0: SELEÇÃO DE EQUIPE */}
      {step === 0 && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div>
            <span className="badge badge-neutral" style={{ marginBottom: '8px' }}>{establishment.name}</span>
            <h2 className="heading-2" style={{ marginBottom: '4px' }}>{service.name}</h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>Selecione o profissional de sua preferência.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            {professionals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                <p className="text-muted" style={{ fontSize: '14px' }}>Ainda não há profissionais cadastrados neste estabelecimento.</p>
                <button 
                  className="btn btn-primary btn-full" 
                  style={{ marginTop: 'var(--space-4)' }}
                  onClick={() => { setSelectedProfessionalId(''); setStep(1); }}
                >
                  Continuar sem selecionar
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => { setSelectedProfessionalId(''); setStep(1); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    borderRadius: '8px',
                    border: selectedProfessionalId === '' ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                    background: selectedProfessionalId === '' ? '#FEF3E2' : 'var(--color-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>Qualquer Profissional</h4>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-muted)' }}>O próximo profissional disponível</p>
                  </div>
                </button>

                {professionals.map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => { setSelectedProfessionalId(prof.id); setStep(1); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: selectedProfessionalId === prof.id ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      background: selectedProfessionalId === prof.id ? '#FEF3E2' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>👤</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{prof.name}</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-muted)' }}>{prof.bio}</p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>

          {professionals.length > 0 && (
            <button 
              className="btn btn-primary btn-full" 
              style={{ marginTop: 'var(--space-2)' }}
              onClick={() => setStep(1)}
            >
              Continuar
            </button>
          )}
        </div>
      )}

      {/* ETAPA 1: SELEÇÃO DE DATA E HORA */}
      {step === 1 && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <button 
                onClick={() => {
                  if (professionals.length === 0) {
                    router.push(`/catalog/${service.establishmentId}`);
                  } else {
                    setStep(0);
                  }
                }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <span style={{ fontSize: '16px' }}>←</span>
              </button>
              <span className="badge badge-neutral">{establishment.name}</span>
            </div>
            <h2 className="heading-2" style={{ marginBottom: '4px' }}>{service.name}</h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Selecione o melhor dia e horário para o seu agendamento 
              {selectedProfessionalId ? ` com ${professionals.find(p => p.id === selectedProfessionalId)?.name || 'o profissional'}` : ''}.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="input-label">Data</label>
            <input 
              type="date" 
              className="input"
              value={selectedDate}
              min={new Date().toISOString().split('T')[0]} // Impede datas passadas
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(''); // Reseta horário ao mudar data
              }}
            />
          </div>

          {selectedDate && (
            <div className="flex flex-col gap-2">
              <label className="input-label">
                {loadingSlots ? 'Consultando disponibilidade...' : 'Horários Disponíveis'}
              </label>
              
              {isVacationDay ? (
                <div style={{
                  padding: '24px 16px',
                  background: '#FEF3E2',
                  border: '1.5px dashed #FCD9A5',
                  borderRadius: 'var(--radius-lg)',
                  color: '#8B5A0A',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '1.5'
                }}>
                  🌴 O estabelecimento está fechado nesta data devido a férias/recesso. Por favor, selecione outro dia.
                </div>
              ) : selectedDate && new Date(selectedDate + 'T00:00:00').getDay() === 0 && !(establishment.amenities || '').split(',').includes('sunday_active') ? (
                <div style={{
                  padding: '24px 16px',
                  background: '#FEF3E2',
                  border: '1.5px dashed #FCD9A5',
                  borderRadius: 'var(--radius-lg)',
                  color: '#8B5A0A',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '1.5'
                }}>
                  📅 Este estabelecimento não funciona aos domingos. Por favor, selecione outro dia.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                  {availableSlots.map(({ time, isBooked }) => {
                    const isPast = isPastTime(time);
                    const isDisabled = isBooked || isPast;
                    return (
                      <button
                        key={time}
                        disabled={isDisabled || loadingSlots}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '10px 0',
                          textAlign: 'center',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: selectedTime === time ? '1.5px solid var(--color-primary)' : '0.5px solid var(--color-border)',
                          background: selectedTime === time 
                            ? 'var(--color-primary)' 
                            : isDisabled 
                              ? '#EDEAE5' 
                              : 'var(--color-surface)',
                          color: selectedTime === time 
                            ? 'var(--color-linen)' 
                            : isDisabled 
                              ? 'var(--color-muted)' 
                              : 'var(--color-text)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.5 : 1,
                          transition: 'all var(--transition-normal)',
                          position: 'relative'
                        }}
                      >
                        {time}
                        {isBooked && (
                          <span style={{ display: 'block', fontSize: '9px', fontWeight: 400, color: 'var(--color-danger)' }}>
                            Ocupado
                          </span>
                        )}
                        {isPast && !isBooked && (
                          <span style={{ display: 'block', fontSize: '9px', fontWeight: 400, color: 'var(--color-muted)' }}>
                            Passou
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {availableSlots.length === 0 && (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--color-danger)', fontSize: '13px', padding: '10px' }}>
                      Nenhum horário disponível para a duração deste serviço nesta data.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            className="btn btn-primary btn-full" 
            style={{ marginTop: 'var(--space-4)' }}
            disabled={!selectedDate || !selectedTime || loadingSlots || isVacationDay}
            onClick={() => setStep(2)}
          >
            Continuar
          </button>
        </div>
      )}

      {/* ETAPA 2: DADOS DO CLIENTE */}
      {step === 2 && (
        <div className="animate-fade-in flex flex-col gap-6">
          <div>
            <h2 className="heading-2" style={{ marginBottom: '4px' }}>Seus Dados de Contato</h2>
            <p className="text-muted" style={{ fontSize: '14px' }}>Precisamos de algumas informações para confirmar sua reserva.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="input-label">Nome Completo</label>
            <input 
              type="text" 
              className="input"
              value={clientName}
              placeholder="Ex: João da Silva"
              onChange={(e) => setClientName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="input-label">E-mail</label>
            <input 
              type="email" 
              className="input"
              value={clientEmail}
              placeholder="Ex: joao@email.com"
              onChange={(e) => setClientEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="input-label">Telefone / WhatsApp</label>
            <input 
              type="tel" 
              className="input"
              value={clientPhone}
              placeholder="Ex: (11) 99999-9999"
              onChange={(e) => setClientPhone(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-4" style={{ marginTop: 'var(--space-4)' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Voltar</button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 2 }}
              disabled={!clientName || !clientEmail || !clientPhone}
              onClick={() => setStep(3)}
            >
              Revisar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 3: REVISAR E CONFIRMAR */}
      {step === 3 && (
        <div className="animate-fade-in flex flex-col gap-6">
          <h2 className="heading-2">Revisar e Confirmar</h2>
          
          <div style={{ background: '#F7F5F2', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Estabelecimento</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{establishment.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Serviço</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{service.name} ({service.durationMinutes} min)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Profissional</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>
                {selectedProfessionalId ? professionals.find(p => p.id === selectedProfessionalId)?.name || 'Qualquer Profissional' : 'Qualquer Profissional'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Data</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{selectedDate.split('-').reverse().join('/')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Horário</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{selectedTime} hs</span>
            </div>
            
            <hr style={{ borderTop: '0.5px solid var(--color-border)', margin: '4px 0' }} />
            
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>Cliente</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ fontSize: '13px' }}>WhatsApp</span>
              <span style={{ fontWeight: 500, fontSize: '14px' }}>{clientPhone}</span>
            </div>

            <hr style={{ borderTop: '0.5px solid var(--color-border)', margin: '4px 0' }} />

            <div className="flex justify-between items-center">
              <span style={{ fontWeight: 500 }}>Total</span>
              <span style={{ fontWeight: 500, color: 'var(--color-accent)', fontSize: '18px' }}>R$ {service.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-ghost" style={{ flex: 1 }} disabled={submitting} onClick={() => setStep(2)}>Voltar</button>
            <button className="btn btn-dark" style={{ flex: 2 }} disabled={submitting} onClick={handleSubmitBooking}>
              {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
            </button>
          </div>
        </div>
      )}

      {/* ETAPA 4: SUCESSO */}
      {step === 4 && (
        <div className="animate-fade-in flex flex-col items-center text-center gap-6" style={{ padding: 'var(--space-6) 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '8px' }}>
            ✓
          </div>
          <div>
            <h2 className="heading-2" style={{ marginBottom: '8px' }}>Agendamento Confirmado!</h2>
            <p className="text-muted" style={{ fontSize: '14px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
              Parabéns, <strong>{clientName}</strong>! Seu horário para o serviço <strong>{service.name}</strong> na <strong>{establishment.name}</strong> foi reservado para o dia <strong>{selectedDate.split('-').reverse().join('/')}</strong> às <strong>{selectedTime}</strong>.
            </p>

            {/* Aviso destacado de confirmação por e-mail e Spam */}
            <div style={{ marginTop: '20px', padding: '16px', background: '#FEF3E2', border: '1px solid rgba(193, 90, 46, 0.25)', borderRadius: '12px', fontSize: '13px', color: '#8B5A0A', textAlign: 'left', maxWidth: '440px', margin: '20px auto 0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: '#C15A2E', marginBottom: '6px' }}>
                📧 Confirmação enviada para o seu e-mail!
              </div>
              <p style={{ margin: 0, lineHeight: 1.5, color: '#5F5A54' }}>
                Enviamos todos os detalhes do seu agendamento para <strong>{clientEmail}</strong>.<br />
                <span style={{ fontSize: '12px', color: '#8C8378', display: 'block', marginTop: '6px' }}>
                  💡 <em>Caso não encontre na caixa de entrada principal, por favor verifique sua pasta de <strong>Spam / Lixo Eletrônico</strong>.</em>
                </span>
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => router.push(`/catalog/${service.establishmentId}`)} style={{ marginTop: '16px' }}>
            Voltar ao Estabelecimento
          </button>
        </div>
      )}
    </div>
  );
}
