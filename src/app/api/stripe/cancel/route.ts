import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório.' }, { status: 400 });
    }

    // 1. Obter os dados do usuário no Supabase
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const customerId = user.user_metadata?.stripe_customer_id;
    let subscriptionId = user.user_metadata?.stripe_subscription_id;

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      // Caso de checkout simulado (ambiente de testes sem chave)
      // Apenas atualiza a base local
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { plan_status: 'inactive' }
      });
      await supabaseAdmin.from('establishments').update({ plan_status: 'inactive' }).eq('owner_id', userId);
      return NextResponse.json({ success: true, message: 'Cancelamento simulado concluído.' });
    }

    const stripe = new Stripe(stripeSecretKey);

    // 2. Se não tiver ID da assinatura salvo, tentar buscar no Stripe usando o customerId
    if (!subscriptionId && customerId) {
      const activeSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1
      });
      const trialingSubs = await stripe.subscriptions.list({
        customer: customerId,
        status: 'trialing',
        limit: 1
      });
      
      const sub = activeSubs.data[0] || trialingSubs.data[0];
      if (sub) {
        subscriptionId = sub.id;
      }
    }

    // 3. Programar cancelamento no Stripe se houver uma assinatura ativa
    let currentPeriodEndISO: string | null = null;
    if (subscriptionId) {
      // Programa o cancelamento para o fim do período contratado, preservando os dias pagos/gratuitos restantes
      const updatedSub = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      }) as any;
      currentPeriodEndISO = new Date(updatedSub.current_period_end * 1000).toISOString();
    }

    // 4. Atualizar metadados do usuário para registrar o cancelamento futuro agendado
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        cancel_at_period_end: true,
        ...(currentPeriodEndISO ? { trial_until: currentPeriodEndISO } : {}),
      }
    });

    console.log(`Cancelamento programado para o fim do período processado para o usuário ${userId}`);
    return NextResponse.json({ success: true, message: 'Assinatura programada para cancelamento com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
