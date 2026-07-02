import { Metadata } from 'next';
import BookingClient from './BookingClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Agendamento | Agendai',
};

export default async function BookPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = await params;
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Minimal */}
      <header style={{ background: 'var(--color-primary)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container flex items-center">
          <Link href="/catalog" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(232,213,183,0.85)', fontSize: '14px' }}>
            <span>← Voltar</span>
          </Link>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
            Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
          </div>
          <div style={{ width: '70px' }}></div> {/* Spacer to center logo */}
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
        <BookingClient serviceId={serviceId} />
      </main>
    </div>
  );
}
