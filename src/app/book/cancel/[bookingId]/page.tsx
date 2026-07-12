'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Booking, Service, Establishment } from '@/lib/db';
import { Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default function CancelBookingPage({ params }: PageProps) {
  const { bookingId } = use(params);
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isCanceling, setIsCanceling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estados de Avaliação
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMsg, setRatingMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/bookings/cancel?id=${bookingId}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setErrorMsg(errData.error || 'Agendamento não encontrado.');
          setLoading(false);
          return;
        }

        const data = await res.json();
        if (data.booking) {
          setBooking(data.booking);
          if (data.booking.rating) {
            setUserRating(data.booking.rating);
            setRatingSubmitted(true);
          }
          if (data.booking.status === 'Cancelado') {
            setSuccess(true);
          }
        }
        if (data.service) setService(data.service);
        if (data.establishment) setEstablishment(data.establishment);
      } catch (err) {
        console.error('Erro ao carregar dados do agendamento:', err);
        setErrorMsg('Erro ao carregar informações.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookingId]);

  const handleConfirmCancel = async () => {
    setIsCanceling(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId })
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Falha ao cancelar o agendamento. Tente novamente.');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao cancelar o agendamento.');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleRate = async (starCount: number) => {
    if (ratingSubmitted || isSubmittingRating) return;
    setIsSubmittingRating(true);
    setRatingMsg('');

    try {
      const res = await fetch('/api/bookings/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating: starCount })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUserRating(starCount);
        setRatingSubmitted(true);
        setRatingMsg(`Obrigado pela sua avaliação de ${starCount} estrela(s)! ⭐`);
      } else {
        setRatingMsg(data.error || 'Erro ao registrar avaliação.');
      }
    } catch (err) {
      setRatingMsg('Ocorreu um erro ao enviar sua avaliação.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-muted">Carregando detalhes do agendamento...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {/* Header Premium */}
      <header style={{ background: 'var(--color-primary)', padding: '14px 24px' }}>
        <div className="container flex justify-center items-center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container flex flex-1 items-center justify-center" style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div style={{ 
          background: 'var(--color-surface)', 
          width: '100%', 
          maxWidth: '520px', 
          padding: 'var(--space-8)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--color-border)', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }} className="animate-slide-up">
          
          {success ? (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 className="heading-2" style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
                Agendamento Cancelado!
              </h2>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
                O cancelamento foi processado com sucesso. O estabelecimento foi notificado.
              </p>
              <Link href="/catalog" className="btn btn-primary btn-full" style={{ textDecoration: 'none' }}>
                Explorar Outros Estabelecimentos
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="heading-2" style={{ color: 'var(--color-text)', marginBottom: '8px', fontSize: '22px' }}>
                Detalhes do Agendamento
              </h2>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '20px' }}>
                Acompanhe o status do seu horário ou cancele se necessário.
              </p>

              {booking && (
                <div style={{ 
                  background: 'var(--color-background)', 
                  padding: '18px', 
                  borderRadius: '16px', 
                  textAlign: 'left', 
                  marginBottom: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                    💈 <strong>Local:</strong> {establishment ? establishment.name : 'Carregando...'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                    ✂️ <strong>Serviço:</strong> {service ? service.name : 'Carregando...'}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                    📅 <strong>Data:</strong> {booking.date.split('-').reverse().join('/')}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                    ⏱ <strong>Horário:</strong> {booking.time.slice(0, 5)}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📌 <strong>Status:</strong> 
                    <span style={{ 
                      padding: '2px 10px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: 600,
                      background: booking.status === 'Confirmado' ? '#EAF7EC' : booking.status === 'Concluido' ? '#E8F1FF' : '#FCEAEA',
                      color: booking.status === 'Confirmado' ? '#2A6B31' : booking.status === 'Concluido' ? '#1D4ED8' : '#C53030'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              )}

              {/* SEÇÃO DE AVALIAÇÃO COM ESTRELAS (1 A 5) */}
              {booking?.status === 'Concluido' && (
                <div 
                  style={{ 
                    background: 'var(--color-surface)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '16px', 
                    padding: '20px', 
                    marginBottom: '24px',
                    textAlign: 'center'
                  }}
                >
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px 0' }}>
                    ⭐ Avaliar Atendimento
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '0 0 16px 0' }}>
                    Como foi sua experiência neste serviço? Selecione de 1 a 5 estrelas.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = (hoverRating || userRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(star)}
                          onMouseEnter={() => !ratingSubmitted && setHoverRating(star)}
                          onMouseLeave={() => !ratingSubmitted && setHoverRating(0)}
                          disabled={ratingSubmitted || isSubmittingRating}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: ratingSubmitted ? 'default' : 'pointer',
                            padding: '4px',
                            transition: 'transform 0.15s ease',
                            transform: active ? 'scale(1.15)' : 'scale(1)',
                            outline: 'none'
                          }}
                          title={`${star} Estrela${star > 1 ? 's' : ''}`}
                        >
                          <Star 
                            className="h-8 w-8" 
                            style={{
                              fill: active ? 'var(--color-accent)' : 'transparent',
                              color: active ? 'var(--color-accent)' : 'var(--color-border)',
                              strokeWidth: active ? 1.5 : 1.5
                            }} 
                          />
                        </button>
                      );
                    })}
                  </div>

                  {ratingMsg && (
                    <div style={{ fontSize: '13px', color: 'var(--color-accent)', fontWeight: 500, marginTop: '8px' }}>
                      {ratingMsg}
                    </div>
                  )}
                </div>
              )}

              {errorMsg && (
                <div style={{ 
                  color: 'var(--color-danger)', 
                  background: '#FCEAEA', 
                  border: '1px solid #F3C3C3',
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  fontSize: '13px', 
                  marginBottom: '16px' 
                }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {booking?.status !== 'Concluido' && (
                  <button 
                    onClick={handleConfirmCancel} 
                    className="btn btn-full" 
                    disabled={isCanceling}
                    style={{ 
                      background: 'var(--color-danger)', 
                      color: '#FFFFFF',
                      height: '44px',
                      fontWeight: 600,
                      borderRadius: '12px'
                    }}
                  >
                    {isCanceling ? 'Cancelando...' : 'Cancelar Agendamento'}
                  </button>
                )}
                
                <Link href="/catalog" className="btn btn-ghost btn-full" style={{ height: '44px', textDecoration: 'none', borderRadius: '12px' }}>
                  Voltar ao Catálogo
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
