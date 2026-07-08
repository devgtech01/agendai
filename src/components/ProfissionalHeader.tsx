'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  Calendar, 
  Scissors, 
  Users, 
  Store, 
  LifeBuoy,
  LogOut, 
  Menu, 
  X 
} from 'lucide-react';

interface ProfissionalHeaderProps {
  establishmentName?: string;
}

export default function ProfissionalHeader({ establishmentName }: ProfissionalHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  const navLinks = [
    { href: '/profissional/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profissional/agenda', label: 'Minha Agenda', icon: Calendar },
    { href: '/profissional/services', label: 'Meus Serviços', icon: Scissors },
    { href: '/profissional/team', label: 'Minha Equipe', icon: Users },
    { href: '/profissional/settings', label: 'Meu Estabelecimento', icon: Store },
    { href: '/profissional/suporte', label: 'Suporte', icon: LifeBuoy },
  ];

  return (
    <>
      {/* Topnav Principal */}
      <header style={{ 
        background: 'var(--color-surface)', 
        padding: '12px 20px', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50, 
        borderBottom: '1px solid var(--color-border)' 
      }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          {/* Logo & Links Desktop */}
          <div className="flex items-center gap-6">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.02em' }}>
                Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '13px' }}>Painel</span>
              </div>
            </Link>

            {/* Links para Telas Grandes */}
            <nav className="hidden md:flex gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={{
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                      textDecoration: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: isActive ? 'var(--color-accent-soft)' : 'transparent',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Lado Direito Desktop & Botão Hamburguer Mobile */}
          <div className="flex items-center gap-3">
            {establishmentName && (
              <div className="flex items-center gap-2">
                <span 
                  style={{ 
                    fontSize: '13px', 
                    color: 'var(--color-muted)', 
                    fontWeight: 500,
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={establishmentName}
                >
                  {establishmentName}
                </span>
                <button 
                  onClick={handleLogout} 
                  title="Sair"
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--color-danger)', 
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Botão do Menu Mobile (Drawer) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center"
              style={{
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Drawer Menu Deslizante para Celular */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden animate-fade-in"
            style={{
              paddingTop: '16px',
              marginTop: '12px',
              borderTop: '1px solid var(--color-border)'
            }}
          >
            {establishmentName && (
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginBottom: '12px', paddingLeft: '4px' }}>
                📍 Estabelecimento: <strong>{establishmentName}</strong>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text)',
                      textDecoration: 'none',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: isActive ? 'var(--color-accent-soft)' : 'var(--color-background)'
                    }}
                  >
                    <Icon size={18} color={isActive ? 'var(--color-accent)' : 'var(--color-muted)'} />
                    {link.label}
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-danger)',
                  background: '#FDF2F2',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginTop: '8px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <LogOut size={18} color="var(--color-danger)" />
                Sair da Conta
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Tabbar Fixa Inferior em Celulares (Visual App Nativo iOS/Android) */}
      <div 
        className="md:hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          zIndex: 40,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 0 calc(8px + env(safe-area-inset-bottom)) 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                fontSize: '10px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                textDecoration: 'none',
                flex: 1,
                textAlign: 'center'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--color-accent)' : 'var(--color-muted)'} />
              <span>{link.label.replace('Meu ', '').replace('Minha ', '')}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
