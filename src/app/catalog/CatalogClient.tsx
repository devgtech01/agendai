'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Establishment {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  imageUrl: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  category?: string;
  amenities?: string;
}

export default function CatalogClient() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Filtros selecionados
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');

  useEffect(() => {
    async function fetchEstablishments() {
      try {
        const res = await fetch('/api/establishments');
        if (res.ok) {
          const data = await res.json();
          setEstablishments(data);
        }
      } catch (err) {
        console.error('Failed to fetch establishments', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEstablishments();
  }, []);

  // Extrair listas únicas para os seletores (apenas estabelecimentos cadastrados)
  const states = Array.from(new Set(
    establishments.map(est => est.state).filter(Boolean)
  )).sort() as string[];

  const cities = Array.from(new Set(
    establishments
      .filter(est => !selectedState || est.state === selectedState)
      .map(est => est.city)
      .filter(Boolean)
  )).sort() as string[];

  const neighborhoods = Array.from(new Set(
    establishments
      .filter(est => (!selectedState || est.state === selectedState) && (!selectedCity || est.city === selectedCity))
      .map(est => est.neighborhood)
      .filter(Boolean)
  )).sort() as string[];

  // Filtrar estabelecimentos na tela
  const filteredEstablishments = establishments.filter(est => {
    const matchState = !selectedState || est.state === selectedState;
    const matchCity = !selectedCity || est.city === selectedCity;
    const matchNeighborhood = !selectedNeighborhood || est.neighborhood === selectedNeighborhood;
    return matchState && matchCity && matchNeighborhood;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
        <div className="text-muted" style={{ fontSize: '14px' }}>Carregando estabelecimentos...</div>
      </div>
    );
  }

  if (establishments.length === 0) {
    return (
      <div className="text-center" style={{ padding: '3rem 0' }}>
        <p className="text-muted">Nenhum estabelecimento cadastrado no momento.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* Container de Filtros */}
      <div style={{ 
        background: 'var(--color-surface)', 
        padding: '24px', 
        borderRadius: 'var(--radius-xl)', 
        border: '0.5px solid var(--color-border)', 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estado (UF)</label>
          <select 
            value={selectedState} 
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity('');
              setSelectedNeighborhood('');
            }}
            className="input"
            style={{ height: '42px', padding: '0 12px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="">Todos os estados</option>
            {states.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cidade</label>
          <select 
            value={selectedCity} 
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedNeighborhood('');
            }}
            className="input"
            style={{ height: '42px', padding: '0 12px', fontSize: '14px', cursor: 'pointer' }}
            disabled={!selectedState}
          >
            <option value="">Todas as cidades</option>
            {cities.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bairro</label>
          <select 
            value={selectedNeighborhood} 
            onChange={(e) => setSelectedNeighborhood(e.target.value)}
            className="input"
            style={{ height: '42px', padding: '0 12px', fontSize: '14px', cursor: 'pointer' }}
            disabled={!selectedCity}
          >
            <option value="">Todos os bairros</option>
            {neighborhoods.map(nh => (
              <option key={nh} value={nh}>{nh}</option>
            ))}
          </select>
        </div>

        {(selectedState || selectedCity || selectedNeighborhood) && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              onClick={() => {
                setSelectedState('');
                setSelectedCity('');
                setSelectedNeighborhood('');
              }}
              className="btn btn-secondary btn-full"
              style={{ height: '42px', fontSize: '13px' }}
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Estabelecimentos ou Mensagem de Erro de Filtro */}
      {filteredEstablishments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          background: 'var(--color-surface)', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px dashed var(--color-border)',
          maxWidth: '500px',
          margin: '0 auto',
          width: '100%'
        }}>
          <span style={{ fontSize: '42px', display: 'block', marginBottom: '16px' }}>📍</span>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
            Ainda não chegamos ao seu bairro
          </h3>
          <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>
            Que tal alterar os filtros acima e buscar em bairros ou cidades vizinhas?
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: 'var(--space-6)' 
        }}>
          {filteredEstablishments.map((est) => (
            <div 
              key={est.id}
              style={{
                background: 'var(--color-surface)',
                border: '0.5px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow var(--transition-normal), border-color var(--transition-normal)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => router.push(`/catalog/${est.id}`)}
            >
              <div style={{ 
                height: '160px', 
                background: 'var(--color-primary)',
                backgroundImage: `url(${est.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.95
              }} />
              
              <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                    {est.name}
                  </h3>
                  {est.category && (
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 600, 
                      color: 'var(--color-accent)', 
                      background: 'rgba(193, 90, 46, 0.08)', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      border: '0.5px solid rgba(193, 90, 46, 0.15)',
                      whiteSpace: 'nowrap'
                    }}>
                      {est.category}
                    </span>
                  )}
                </div>
                
                <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
                  {est.description}
                </p>

                {est.amenities && est.amenities.split(',').filter(Boolean).length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px', marginBottom: '6px' }}>
                    {est.amenities.split(',').filter(Boolean).map(am => {
                      let label = '';
                      if (am === 'wifi') label = '🛜 Wi-Fi';
                      if (am === 'ar') label = '❄️ Ar Cond.';
                      if (am === 'bebida') label = '🥤 Bebida';
                      if (am === 'jogos') label = '🎮 Jogos';
                      if (!label) return null;
                      return (
                        <span 
                          key={am} 
                          style={{ 
                            fontSize: '10px', 
                            color: 'var(--color-muted)', 
                            background: '#F1F1F4', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                )}
                
                <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 {est.address}
                  </div>
                  {est.neighborhood && est.city && (
                    <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', paddingLeft: '18px' }}>
                      {est.neighborhood} · {est.city} - {est.state}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📞 {est.phone}
                  </div>
                </div>
                
                <button className="btn btn-primary btn-full" style={{ marginTop: '12px' }}>
                  Ver Serviços
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
