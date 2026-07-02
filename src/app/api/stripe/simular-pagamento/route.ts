import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { userId, planKey } = await req.json();

    if (!userId || !planKey) {
      return NextResponse.json(
        { error: 'userId e planKey são obrigatórios.' },
        { status: 400 }
      );
    }

    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const trialUntil = planKey === 'mensal' ? trialEndDate.toISOString().split('T')[0] : null;

    // Atualizar os metadados do usuário usando o cliente Admin do Supabase
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        plan: planKey,
        plan_status: 'active',
        stripe_customer_id: 'cus_simulado_123',
        stripe_subscription_id: 'sub_simulado_123',
        trial_until: trialUntil,
      },
    });

    if (error) {
      console.error('Erro ao simular ativação no Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
