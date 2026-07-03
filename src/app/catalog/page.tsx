import { Metadata } from 'next';
import CatalogClient from './CatalogClient';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Parceiros | Agendai',
  description: 'Escolha o estabelecimento perfeito para você.',
};

export default function CatalogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Premium */}
      <header style={{ background: 'var(--color-primary)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container flex justify-between items-center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
          <Link href="/profissional" style={{ fontSize: '14px', color: 'rgba(232,213,183,0.85)', textDecoration: 'none' }}>
            Sou Profissional
          </Link>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="heading-2" style={{ marginBottom: '1rem' }}>Estabelecimentos Parceiros</h1>
          <p className="text-muted" style={{ fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
            Selecione um estabelecimento abaixo para conhecer os serviços disponíveis e reservar seu horário.
          </p>
        </div>

        <CatalogClient />
      </main>

      <footer style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
          <p style={{ marginBottom: 'var(--space-4)', fontSize: '13px' }}>© {new Date().getFullYear()} Agendai. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)' }}>
            <Link href="/suporte" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '13px' }}>Suporte</Link>
            <Link href="/termos" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '13px' }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '13px' }}>Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
