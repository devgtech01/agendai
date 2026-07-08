'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getEstablishmentByOwnerId, getServices, addService, deleteService, Service, Establishment } from '@/lib/db';
import ProfissionalHeader from '@/components/ProfissionalHeader';

export default function ProfissionalServicesPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServiceCategory, setNewServiceCategory] = useState('Corte');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadServices() {
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

        const servs = await getServices(est.id);
        setServices(servs);
      } catch (err) {
        console.error('Erro ao carregar serviços:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishment) return;

    setIsSubmitting(true);
    const defaultImages: Record<string, string> = {
      'Corte': 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80',
      'Barba': 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80',
      'Combo': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80',
      'Química': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80',
      'Estética': 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80'
    };

    const newService = await addService({
      establishmentId: establishment.id,
      name: newServiceName,
      description: 'Serviço de alta qualidade', // Simplificado para MVP
      price: parseFloat(newServicePrice.replace(',', '.')),
      durationMinutes: parseInt(newServiceDuration),
      category: newServiceCategory,
      imageUrl: defaultImages[newServiceCategory] || defaultImages['Corte'],
    });

    if (newService) {
      setServices((prev) => [...prev, newService]);
      setNewServiceName('');
      setNewServicePrice('');
    } else {
      alert('Erro ao criar serviço. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    const success = await deleteService(serviceId);
    if (success) {
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } else {
      alert('Erro ao excluir serviço. Tente novamente.');
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">Carregando serviços...</div>;
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

      <main className="container flex-1" style={{ padding: 'var(--space-8) var(--space-4) calc(80px + var(--space-8)) var(--space-4)', display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-8)', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Sessão de Adicionar Serviço */}
        <section style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)' }}>
          <h2 className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Adicionar Novo Serviço</h2>
          <form onSubmit={handleAddService} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Nome do Serviço</label>
              <input 
                type="text" 
                className="input" 
                placeholder="Ex: Corte Degradê"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Preço (R$)</label>
              <input 
                type="number" 
                step="0.01"
                className="input" 
                placeholder="Ex: 35.00"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                required 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Duração</label>
              <select className="input" value={newServiceDuration} onChange={(e) => setNewServiceDuration(e.target.value)}>
                <option value="15">15 Minutos</option>
                <option value="30">30 Minutos</option>
                <option value="45">45 Minutos</option>
                <option value="60">1 Hora</option>
                <option value="90">1h e 30m</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="input-label">Categoria</label>
              <select className="input" value={newServiceCategory} onChange={(e) => setNewServiceCategory(e.target.value)}>
                <option value="Corte">Corte</option>
                <option value="Barba">Barba</option>
                <option value="Combo">Combo</option>
                <option value="Química">Química</option>
                <option value="Estética">Estética</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px' }} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar Serviço'}
              </button>
            </div>

          </form>
        </section>

        {/* Lista de Serviços Cadastrados */}
        <section>
          <h2 className="heading-2" style={{ marginBottom: 'var(--space-6)' }}>Serviços Ativos</h2>
          
          {services.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', padding: 'var(--space-10)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              Você ainda não tem nenhum serviço cadastrado.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
              {services.map((service) => (
                <div key={service.id} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <img src={service.imageUrl} alt={service.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontWeight: 500, fontSize: '16px', color: 'var(--color-text)' }}>{service.name}</h4>
                      <span className="badge" style={{ fontSize: '10px' }}>{service.category}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                      ⏱ {service.durationMinutes} minutos
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-accent)', margin: 0 }}>
                        R$ {Number(service.price).toFixed(2).replace('.', ',')}
                      </p>
                      <button 
                        onClick={() => handleDeleteService(service.id)} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--color-danger)', 
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FCEAEA'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
