import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
    }

    // Buscar o usuário diretamente da API Admin para obter dados em tempo real (sem cache de JWT)
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    let planStatus = user.user_metadata?.plan_status || 'inactive';
    const trialUntil = user.user_metadata?.trial_until;

    // Se o plano está ativo, mas tem data de expiração (teste ou assinatura ativa) e ela já passou
    if (planStatus === 'active' && trialUntil) {
      const expirationDate = new Date(trialUntil);
      const now = new Date();
      if (now > expirationDate) {
        planStatus = 'inactive';
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { 
            ...user.user_metadata, 
            plan_status: 'inactive' 
          }
        });

        // Atualiza para inativo também na tabela de estabelecimentos
        await supabaseAdmin
          .from('establishments')
          .update({ plan_status: 'inactive' })
          .eq('owner_id', userId);
      }
    }

    return NextResponse.json({
      plan: user.user_metadata?.plan || 'Nenhum',
      planStatus: planStatus,
      cancelAtPeriodEnd: user.user_metadata?.cancel_at_period_end === true
    });
  } catch (error: any) {
    console.error('Erro na API de status do usuário:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
