'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/admin');
  };

  // Mock establishments for platform admin
  const recentEstablishments = [
    { id: 1, name: 'Barbearia Vintage', plan: 'Pro', registeredAt: 'Hoje', status: 'Ativo' },
    { id: 2, name: 'Salão Beleza Pura', plan: 'Basic', registeredAt: 'Ontem', status: 'Ativo' },
    { id: 3, name: 'Studio Hair', plan: 'Pro', registeredAt: 'Há 3 dias', status: 'Pendente' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Sidebar / Topnav */}
      <header style={{ background: 'var(--color-primary)', padding: '12px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container flex justify-between items-center">
          <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
            Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'rgba(232,213,183,0.55)', fontSize: '14px' }}>Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: '14px', color: 'rgba(232,213,183,0.85)' }}>Bem-vindo, Admin</span>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(232,213,183,0.55)', color: 'var(--color-linen)' }}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ flex: 1, padding: 'var(--space-10) var(--space-6)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-8)' }}>
          <h1 className="heading-1">Dashboard</h1>
          <Link href="/catalog" className="btn btn-primary" target="_blank">
            Ver Catálogo
          </Link>
        </div>

        {/* Resumo / Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-10)' }}>
          {[
            { label: 'Total de Estabelecimentos', value: '24' },
            { label: 'Agendamentos (Plataforma)', value: '312' },
            { label: 'Receita Estimada', value: 'R$ 15.400,00' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'var(--color-surface)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>{stat.label}</p>
              <h3 style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-text)' }}>{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Lista de Estabelecimentos */}
        <h2 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Estabelecimentos Recentes</h2>
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px', fontWeight: 500, color: 'var(--color-muted)', fontSize: '14px' }}>Estabelecimento</th>
                  <th style={{ padding: '16px', fontWeight: 500, color: 'var(--color-muted)', fontSize: '14px' }}>Plano</th>
                  <th style={{ padding: '16px', fontWeight: 500, color: 'var(--color-muted)', fontSize: '14px' }}>Cadastrado em</th>
                  <th style={{ padding: '16px', fontWeight: 500, color: 'var(--color-muted)', fontSize: '14px' }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: 500, color: 'var(--color-muted)', fontSize: '14px' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentEstablishments.map((est) => (
                  <tr key={est.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px', fontWeight: 500, color: 'var(--color-text)', fontSize: '14px' }}>{est.name}</td>
                    <td style={{ padding: '16px', color: 'var(--color-muted)', fontSize: '14px' }}>{est.plan}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{est.registeredAt}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={est.status === 'Ativo' ? 'badge badge-success' : 'badge badge-warning'}>
                        {est.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button className="btn btn-ghost btn-sm">
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
