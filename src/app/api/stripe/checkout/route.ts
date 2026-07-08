import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const { email, planKey, userId } = await req.json();

    if (!email || !planKey || !userId) {
      return NextResponse.json(
        { error: 'Email, planKey e userId são obrigatórios.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. Verificar se a chave secreta do Stripe está definida no ambiente
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.log('Stripe: Chave secreta não encontrada. Redirecionando para checkout simulado...');
      const simulatedUrl = `${appUrl}/profissional/checkout-simulado?email=${encodeURIComponent(email)}&plan=${planKey}&userId=${userId}`;
      return NextResponse.json({ url: simulatedUrl });
    }

    // 2. Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey);

    // 3. Definir detalhes do plano
    let productName = 'Agendai - Plano Mensal';
    let amount = 3490; // R$ 34,90
    let interval: 'month' | 'year' = 'month';
    let intervalCount = 1;

    if (planKey === 'semestral') {
      productName = 'Agendai - Plano Semestral';
      amount = 17844; // R$ 178,44
      interval = 'month';
      intervalCount = 6;
    } else if (planKey === 'anual') {
      productName = 'Agendai - Plano Anual';
      amount = 30600; // R$ 306,00
      interval = 'year';
      intervalCount = 1;
    }

    // 4. Buscar ou Criar o Produto no Stripe
    const products = await stripe.products.list({
      limit: 10,
      active: true,
    });
    let product = products.data.find(p => p.metadata.planKey === planKey);

    if (!product) {
      product = await stripe.products.create({
        name: productName,
        description: `Plano de assinatura ${planKey} do Agendai.`,
        metadata: { planKey },
      });
    }

    // 5. Buscar ou Criar o Preço correspondente
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    let price = prices.data.find(p => p.unit_amount === amount && p.recurring?.interval === interval);

    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'brl',
        recurring: {
          interval,
          interval_count: intervalCount,
        },
      });
    }

    // 6. Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        ...(planKey === 'mensal' ? { trial_period_days: 30 } : {}),
        metadata: {
          userId,
          planKey,
        }
      },
      success_url: `${appUrl}/profissional/dashboard?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${appUrl}/profissional/planos?status=cancel`,
      metadata: {
        userId,
        planKey,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao processar Stripe checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}
