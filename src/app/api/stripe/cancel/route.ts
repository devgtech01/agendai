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

    // 3. Cancelar no Stripe se houver uma assinatura ativa
    if (subscriptionId) {
      // Cancela imediatamente excluindo a assinatura
      await stripe.subscriptions.cancel(subscriptionId);
    }

    // 4. Atualizar metadados do usuário para inativo no Supabase
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        plan_status: 'inactive',
      }
    });

    // 5. Atualizar coluna plan_status na tabela establishments
    await supabaseAdmin
      .from('establishments')
      .update({ plan_status: 'inactive' })
      .eq('owner_id', userId);

    console.log(`Cancelamento imediato processado para o usuário ${userId}`);
    return NextResponse.json({ success: true, message: 'Assinatura cancelada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
