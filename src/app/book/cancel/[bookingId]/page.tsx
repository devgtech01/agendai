'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getBookingById, getServiceById, getEstablishmentById, updateBookingStatus, Booking, Service, Establishment } from '@/lib/db';

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

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const bk = await getBookingById(bookingId);
        if (!bk) {
          setErrorMsg('Agendamento não encontrado.');
          setLoading(false);
          return;
        }
        
        if (bk.status === 'Cancelado') {
          setSuccess(true);
          setBooking(bk);
          setLoading(false);
          return;
        }

        setBooking(bk);

        const [srv, est] = await Promise.all([
          getServiceById(bk.serviceId),
          getEstablishmentById(bk.establishmentId)
        ]);

        if (srv) setService(srv);
        if (est) setEstablishment(est);
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
      const updated = await updateBookingStatus(bookingId, 'Cancelado');
      if (updated) {
        setSuccess(true);
      } else {
        setErrorMsg('Falha ao cancelar o agendamento. Tente novamente.');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao cancelar o agendamento.');
    } finally {
      setIsCanceling(false);
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
      <header style={{ background: 'var(--color-primary)', padding: '12px 24px' }}>
        <div className="container flex justify-center items-center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="container flex flex-1 items-center justify-center" style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div style={{ 
          background: 'var(--color-surface)', 
          width: '100%', 
          maxWidth: '480px', 
          padding: 'var(--space-8)', 
          borderRadius: 'var(--radius-xl)', 
          border: '0.5px solid var(--color-border)', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
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
              <Link href="/catalog" className="btn btn-primary btn-full">
                Explorar Outros Estabelecimentos
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚠️</div>
              <h2 className="heading-2" style={{ color: 'var(--color-text)', marginBottom: '8px' }}>
                Cancelar Agendamento?
              </h2>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '24px' }}>
                Confirme os dados antes de prosseguir com o cancelamento:
              </p>

              {booking && (
                <div style={{ 
                  background: 'var(--color-background)', 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)', 
                  textAlign: 'left', 
                  marginBottom: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px' 
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
                <button 
                  onClick={handleConfirmCancel} 
                  className="btn btn-full" 
                  disabled={isCanceling}
                  style={{ 
                    background: 'var(--color-danger)', 
                    color: '#FFFFFF',
                    height: '44px',
                    fontWeight: 600
                  }}
                >
                  {isCanceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                </button>
                
                <Link href="/catalog" className="btn btn-ghost btn-full" style={{ height: '44px' }}>
                  Voltar ao Site
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
