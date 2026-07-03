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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Minimal */}
      <header style={{ background: 'var(--color-primary)', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(232, 213, 183, 0.15)' }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          <Link href="/catalog" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(232,213,183,0.85)', fontSize: '13px' }}>
            <span>← <span className="hidden sm:inline">Todos </span>Estabelecimentos</span>
          </Link>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
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
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow var(--transition-normal), border-color var(--transition-normal)'
                }}
              >
                <div style={{ 
                  height: '100px', 
                  backgroundImage: `url(${service.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.9
                }} />
                
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text)' }}>{service.name}</h3>
                    {service.price >= 90 && <span className="badge badge-popular">Popular</span>}
                  </div>
                  
                  <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, flex: 1, marginBottom: '12px' }}>
                    {service.description}
                  </p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid var(--color-border)', paddingTop: '12px', marginTop: 'auto' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{service.durationMinutes} min · {service.category}</div>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-accent)', marginTop: '2px' }}>
                        R$ {service.price.toFixed(2)}
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
