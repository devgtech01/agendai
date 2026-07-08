'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getEstablishmentByOwnerId, getProfessionals, addProfessional, deleteProfessional, Professional, Establishment } from '@/lib/db';
import ProfissionalHeader from '@/components/ProfissionalHeader';

export default function ProfissionalTeamPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadTeam() {
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

        const team = await getProfessionals(est.id);
        setProfessionals(team);
      } catch (err) {
        console.error('Erro ao carregar equipe:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  const handleAddProfessional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishment) return;

    setIsSubmitting(true);
    const newProf = await addProfessional({
      establishmentId: establishment.id,
      name: newName,
      bio: newBio,
    });

    if (newProf) {
      setProfessionals((prev) => [...prev, newProf]);
      setNewName('');
      setNewBio('');
    } else {
      alert('Erro ao cadastrar profissional. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteProfessional = async (profId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe? Os agendamentos dele poderão ser afetados.')) return;

    const success = await deleteProfessional(profId);
    if (success) {
      setProfessionals((prev) => prev.filter((p) => p.id !== profId));
    } else {
      alert('Erro ao remover profissional. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">Carregando equipe...</div>;
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <h2 className="heading-2">Você precisa criar seu estabelecimento primeiro.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <ProfissionalHeader establishmentName={establishment.name} />

      <main className="container flex-1" style={{ padding: 'var(--space-8) var(--space-4) calc(80px + var(--space-8)) var(--space-4)', display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Sessão de Adicionar Profissional */}
        <section style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)' }}>
          <h2 className="heading-2" style={{ marginBottom: 'var(--space-2)' }}>Adicionar Membro à Equipe</h2>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: 'var(--space-5)' }}>
            Cadastre os profissionais que trabalham no seu estabelecimento para que seus clientes possam escolhê-los (em breve no fluxo de agendamento 2.0).
          </p>
          <form onSubmit={handleAddProfessional} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Nome do Profissional</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: João da Silva"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Especialidade / Biografia Curta</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: Especialista em degradê e barba."
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '8px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Cadastrar Profissional'}
            </button>

          </form>
        </section>

        {/* Lista de Profissionais Cadastrados */}
        <section>
          <h2 className="heading-2" style={{ marginBottom: 'var(--space-6)' }}>Sua Equipe Atual</h2>
          
          {professionals.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-10)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              Nenhum profissional cadastrado na sua equipe.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {professionals.map((prof) => (
                <div key={prof.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>👤</span>
                      <h4 style={{ fontWeight: 600, fontSize: '16px', color: 'var(--color-text)', margin: 0 }}>{prof.name}</h4>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0, paddingLeft: '28px' }}>
                      {prof.bio}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleDeleteProfessional(prof.id)} 
                    style={{ 
                      background: 'transparent', 
                      border: '1px solid var(--color-danger)', 
                      color: 'var(--color-danger)', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-md)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-danger)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
