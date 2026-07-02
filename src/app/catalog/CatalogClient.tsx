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
}

export default function CatalogClient() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: 'var(--space-6)' 
    }}>
      {establishments.map((est) => (
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
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text)' }}>
              {est.name}
            </h3>
            
            <p className="text-muted" style={{ fontSize: '13px', lineHeight: 1.5, flex: 1 }}>
              {est.description}
            </p>
            
            <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '10px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📍 {est.address}
              </div>
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
  );
}
