'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verificar se o usuário já deu consentimento
    const consent = localStorage.getItem('agendai-cookie-consent');
    if (!consent) {
      // Pequeno atraso para uma transição suave de entrada
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('agendai-cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      left: '24px',
      maxWidth: '420px',
      backgroundColor: 'rgba(30, 27, 24, 0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(232, 213, 183, 0.15)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      marginLeft: 'auto'
    }}>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🍪</span>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-linen)', margin: '0 0 4px 0' }}>
            Nós valorizamos sua privacidade
          </h4>
          <p style={{ fontSize: '12.5px', color: 'rgba(232, 213, 183, 0.75)', lineHeight: 1.5, margin: 0 }}>
            Utilizamos cookies para melhorar sua experiência de navegação, oferecer anúncios personalizados e analisar nosso tráfego. Ao clicar em "Aceitar", você consente com o uso de cookies.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
        <button
          onClick={handleAccept}
          className="btn btn-primary press"
          style={{
            flex: 1,
            height: '38px',
            fontSize: '13px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Aceitar Cookies
        </button>
      </div>
    </div>
  );
}
