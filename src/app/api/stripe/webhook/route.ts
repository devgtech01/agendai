import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe API key não configurada.' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey);

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Assinatura ou segredo do Webhook não fornecidos.' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Erro na validação do webhook signature: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planKey = session.metadata?.planKey;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (userId && planKey) {
          const trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 30);
          const trialUntil = planKey === 'mensal' ? trialEndDate.toISOString().split('T')[0] : null;

          // Atualizar metadados do usuário usando o cliente Admin
          const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              plan: planKey,
              plan_status: 'active',
              stripe_customer_id: stripeCustomerId,
              stripe_subscription_id: stripeSubscriptionId,
              trial_until: trialUntil,
            },
          });

          if (error) {
            console.error('Erro ao atualizar usuário no Supabase via Webhook:', error);
            return NextResponse.json({ error: 'Erro ao provisionar plano.' }, { status: 500 });
          }
          console.log(`Webhook: Plano ${planKey} ativado para o usuário ${userId}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;

        if (!userId) {
          try {
            let customerEmail: string | undefined;
            if (subscription.customer) {
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              if (customer && !('deleted' in customer) && customer.email) {
                customerEmail = customer.email;
              }
            }

            const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
              perPage: 1000
            });
            const targetUser = listData?.users?.find(
              u => u.user_metadata?.stripe_subscription_id === subscription.id ||
                   u.user_metadata?.stripe_customer_id === subscription.customer ||
                   (customerEmail && u.email?.toLowerCase() === customerEmail.toLowerCase())
            );
            if (targetUser) {
              userId = targetUser.id;
            }
          } catch (err) {
            console.error('Erro ao mapear assinatura deletada por lista de usuários:', err);
          }
        }

        if (userId) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              plan_status: 'inactive',
              cancel_at_period_end: false,
            },
          });

          // Sincronizar status do plano na tabela de estabelecimentos
          await supabaseAdmin
            .from('establishments')
            .update({ plan_status: 'inactive' })
            .eq('owner_id', userId);

          if (error) {
            console.error('Erro ao desativar plano no Supabase via Webhook:', error);
            return NextResponse.json({ error: 'Erro ao desativar plano.' }, { status: 500 });
          }
          console.log(`Webhook: Assinatura desativada/cancelada para o usuário ${userId}`);
        } else {
          console.warn(`Webhook: Não foi possível mapear a assinatura deletada ${subscription.id} para um usuário.`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        let userId = subscription.metadata?.userId;
        const planStatus = subscription.status; // active, trialing, past_due, canceled, unpaid

        if (!userId) {
          try {
            let customerEmail: string | undefined;
            if (subscription.customer) {
              const customer = await stripe.customers.retrieve(subscription.customer as string);
              if (customer && !('deleted' in customer) && customer.email) {
                customerEmail = customer.email;
              }
            }

            const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
              perPage: 1000
            });
            const targetUser = listData?.users?.find(
              u => u.user_metadata?.stripe_subscription_id === subscription.id ||
                   u.user_metadata?.stripe_customer_id === subscription.customer ||
                   (customerEmail && u.email?.toLowerCase() === customerEmail.toLowerCase())
            );
            if (targetUser) {
              userId = targetUser.id;
            }
          } catch (err) {
            console.error('Erro ao mapear assinatura atualizada por lista de usuários:', err);
          }
        }

        if (userId) {
          const isPlanActive = ['active', 'trialing'].includes(planStatus);
          const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              plan_status: isPlanActive ? 'active' : 'inactive',
              cancel_at_period_end: subscription.cancel_at_period_end,
              trial_until: new Date((subscription as any).current_period_end * 1000).toISOString(),
            },
          });

          // Sincronizar status do plano na tabela de estabelecimentos
          await supabaseAdmin
            .from('establishments')
            .update({ 
              plan_status: isPlanActive ? 'active' : 'inactive',
              plan: subscription.metadata?.planKey || 'mensal'
            })
            .eq('owner_id', userId);

          if (error) {
            console.error('Erro ao atualizar assinatura no Supabase via Webhook:', error);
            return NextResponse.json({ error: 'Erro ao atualizar assinatura.' }, { status: 500 });
          }
          console.log(`Webhook: Assinatura atualizada para o usuário ${userId}. Status: ${planStatus}, CancelAtPeriodEnd: ${subscription.cancel_at_period_end}`);
        } else {
          console.warn(`Webhook: Não foi possível mapear a assinatura atualizada ${subscription.id} para um usuário.`);
        }
        break;
      }

      case 'customer.deleted': {
        const customer = event.data.object as Stripe.Customer | Stripe.DeletedCustomer;
        let userId;

        try {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000
          });
          const targetUser = listData?.users?.find(
            u => u.user_metadata?.stripe_customer_id === customer.id
          );
          if (targetUser) {
            userId = targetUser.id;
          }
        } catch (err) {
          console.error('Erro ao mapear cliente deletado por lista de usuários:', err);
        }

        if (userId) {
          const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              plan_status: 'inactive',
              cancel_at_period_end: false,
            },
          });

          // Sincronizar status do plano na tabela de estabelecimentos
          await supabaseAdmin
            .from('establishments')
            .update({ plan_status: 'inactive' })
            .eq('owner_id', userId);

          if (error) {
            console.error('Erro ao desativar plano por exclusão do cliente via Webhook:', error);
            return NextResponse.json({ error: 'Erro ao desativar plano.' }, { status: 500 });
          }
          console.log(`Webhook: Cliente Stripe ${customer.id} excluído. Plano inativado para o usuário ${userId}`);
        } else {
          console.warn(`Webhook: Não foi possível mapear o cliente excluído ${customer.id} para um usuário.`);
        }
        break;
      }

      default:
        console.log(`Webhook Stripe: Evento não monitorado recebido: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erro ao processar evento de Webhook Stripe:', error);
    return NextResponse.json({ error: 'Erro interno ao processar webhook' }, { status: 500 });
  }
}
