'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProfissionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Caminhos que não exigem verificação de plano ativo
  const freePaths = [
    '/profissional',
    '/profissional/register',
    '/profissional/planos',
    '/profissional/alterar-plano',
    '/profissional/checkout-simulado',
    '/profissional/esqueci-senha',
    '/profissional/redefinir-senha',
  ];

  useEffect(() => {
    async function checkAccess() {
      try {
        setLoading(true);
        
        // 1. Se for um caminho livre de autenticação, permite acesso
        if (freePaths.includes(pathname)) {
          setHasAccess(true);
          return;
        }

        // 2. Verificar se o usuário está autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/profissional');
          return;
        }

        // 3. Obter status do plano em tempo real diretamente do servidor
        const statusRes = await fetch(`/api/auth/status?userId=${user.id}`);
        const statusData = await statusRes.json();

        const isActive = statusRes.ok && statusData.planStatus === 'active';

        // 4. Se a rota for configurações ou suporte, permite acesso (a própria tela de ajustes cuida do bloqueio interno de abas)
        if (pathname === '/profissional/settings' || pathname === '/profissional/suporte') {
          setHasAccess(true);
          return;
        }

        // 5. Para todas as outras rotas administrativas (dashboard, agenda, serviços, equipe), exige plano ativo
        if (!isActive) {
          router.push('/profissional/settings?tab=billing&blocked=true');
          return;
        }

        setHasAccess(true);
      } catch (err) {
        console.error('Erro no controle de acesso do profissional:', err);
        router.push('/profissional');
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              border: '3px solid var(--color-border)',
              borderTop: '3px solid var(--color-accent)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              animation: 'spin 1s linear infinite'
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ color: 'var(--color-muted)', fontSize: '14px', fontWeight: 500 }}>
            Verificando credenciais de acesso...
          </span>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Bloqueia totalmente a renderização visual do conteúdo sensível
  }

  return <>{children}</>;
}
