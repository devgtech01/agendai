import { getEstablishmentById, getServices } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ establishmentId: string }>;
}

export default async function EstablishmentPage({ params }: PageProps) {
  const { establishmentId } = await params;
  const establishment = await getEstablishmentById(establishmentId);

  if (!establishment) {
    notFound();
  }

  const services = await getServices(establishmentId);

  // Verificar status de faturamento do dono do estabelecimento
  let isOwnerActive = false;
  if (establishment.ownerId) {
    const { supabaseAdmin } = await import('@/lib/supabase-admin');
    const { data: { user: owner } } = await supabaseAdmin.auth.admin.getUserById(establishment.ownerId);
    isOwnerActive = owner?.user_metadata?.plan_status === 'active';
  }

  if (!isOwnerActive) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
        <header style={{ background: 'var(--color-primary)', padding: '12px 16px', borderBottom: '1px solid rgba(232, 213, 183, 0.15)' }}>
          <div className="container flex justify-between items-center" style={{ padding: 0 }}>
            <Link href="/catalog" style={{ textDecoration: 'none', color: 'rgba(232,213,183,0.85)', fontSize: '14px', width: '70px' }}>
              ← Voltar
            </Link>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-linen)', letterSpacing: '0.02em', textAlign: 'center' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
            <div style={{ width: '70px' }} />
          </div>
        </header>

        <main className="container flex flex-col items-center justify-center text-center" style={{ flex: 1, padding: '4rem 1.5rem' }}>
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '3.5rem 2rem', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px', display: 'inline-block', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>🔒</div>
            <h2 className="heading-2" style={{ marginBottom: '12px', fontWeight: 600 }}>Agendamentos Indisponíveis</h2>
            <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '30px' }}>
              O agendamento online para o estabelecimento <strong>{establishment.name}</strong> está temporariamente pausado por motivos administrativos.
            </p>
            <Link href="/catalog" className="btn btn-secondary btn-full" style={{ padding: '12px', fontSize: '14px', fontWeight: 500 }}>
              Voltar ao Catálogo Geral
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Minimal */}
      <header style={{ background: 'var(--color-primary)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(232, 213, 183, 0.15)' }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          <Link href="/catalog" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(232,213,183,0.85)', fontSize: '14px', width: '70px' }}>
            <span>← Voltar</span>
          </Link>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-linen)', letterSpacing: '0.02em', textAlign: 'center' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
          <div style={{ width: '70px' }} /> {/* Spacer para alinhamento centralizado */}
        </div>
      </header>

      {/* Hero Banner do Estabelecimento */}
      <section style={{ 
        background: 'var(--color-primary)', 
        color: 'var(--color-linen)', 
        padding: '3rem 0',
        borderBottom: '1px solid var(--color-border)'
      }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <h1 className="heading-1" style={{ color: '#FFFFFF', marginBottom: '8px' }}>{establishment.name}</h1>
            <p style={{ color: 'rgba(232,213,183,0.75)', fontSize: '15px', maxWidth: '700px' }}>{establishment.description}</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'rgba(232,213,183,0.85)', borderTop: '0.5px solid rgba(232,213,183,0.2)', paddingTop: '16px' }}>
            <div>📍 <strong>Endereço:</strong> {establishment.address}</div>
            <div>📞 <strong>Contato:</strong> {establishment.phone}</div>
          </div>

          {establishment.amenities && establishment.amenities.split(',').filter(Boolean).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
              {establishment.amenities.split(',').filter(Boolean).map(am => {
                let label = '';
                if (am === 'wifi') label = '🛜 Wi-Fi grátis';
                if (am === 'ar') label = '❄️ Ar Condicionado';
                if (am === 'bebida') label = '🥤 Bebida disponível';
                if (am === 'jogos') label = '🎮 Área de Jogos';
                if (!label) return null;
                return (
                  <span 
                    key={am} 
                    style={{ 
                      fontSize: '11px', 
                      color: 'var(--color-primary)', 
                      background: 'var(--color-linen)', 
                      padding: '4px 10px', 
                      borderRadius: '12px',
                      fontWeight: 600
                    }}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lista de Serviços */}
      <main className="container" style={{ flex: 1, padding: '3rem 1.5rem' }}>
        <h2 className="heading-2" style={{ marginBottom: '2rem' }}>Serviços Disponíveis</h2>

        {services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p className="text-muted">Este estabelecimento ainda não possui serviços cadastrados.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 'var(--space-5)' 
          }}>
            {services.map((service) => (
              <div 
                key={service.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '0.5px solid var(--color-border)',
                  borderLeft: '4px solid var(--color-accent)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '170px',
                  transition: 'box-shadow var(--transition-normal), border-color var(--transition-normal)'
                }}
              >
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{service.name}</h3>
                    <span className="badge" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>{service.category}</span>
                  </div>
                  
                  <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, flex: 1, marginBottom: '12px' }}>
                    {service.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--color-border)', paddingTop: '12px', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>⏱ {service.durationMinutes} min</div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-accent)', marginTop: '2px' }}>
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    
                    <Link href={`/book/${service.id}`} className="btn btn-primary btn-sm">
                      Agendar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
