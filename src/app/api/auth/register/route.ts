import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, ownerName, establishmentName, phone, selectedPlan = 'mensal', category, customCategory } = body;

    if (!email || !password || !ownerName || !establishmentName || !phone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const finalCategory = category === 'Outros' && customCategory ? customCategory : (category || 'Outros');

    // Verificar se o e-mail está pré-autorizado para acesso sem cartão
    const { data: noCardData, error: noCardError } = await supabaseAdmin
      .from('no_card_access')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    const isPreAuthorized = !noCardError && noCardData !== null;
    const finalPlanStatus = isPreAuthorized ? 'active' : 'inactive';

    // Calcular expiração do teste grátis (30 dias para mensal ou se for liberado sem cartão)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);
    const trialUntil = (selectedPlan === 'mensal' || isPreAuthorized) ? trialEndDate.toISOString() : null;

    // 1. Criar usuário usando o cliente padrão (para disparar os e-mails de confirmação nativos do Supabase)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: ownerName,
          plan: selectedPlan,
          trial_until: trialUntil,
          plan_status: finalPlanStatus,
        }
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Erro ao registrar usuário no provedor de autenticação.' }, { status: 500 });
    }

    // 2. Criar Estabelecimento usando supabaseAdmin para contornar RLS
    // (já que o usuário não possui sessão ativa/confirmada ainda caso a confirmação de e-mail esteja ligada)
    const { data: estData, error: estError } = await supabaseAdmin
      .from('establishments')
      .insert([
        {
          name: establishmentName,
          description: '',
          address: '',
          phone: phone,
          image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          owner_id: userId,
          category: finalCategory,
          plan_status: finalPlanStatus
        }
      ])
      .select()
      .single();

    if (estError) {
      console.error('Erro ao criar estabelecimento via Admin:', estError);
      // Limpeza: Deleta o usuário criado no Auth para evitar inconsistências
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: 'Erro ao criar o perfil do estabelecimento no banco de dados.' }, { status: 500 });
    }

    if (isPreAuthorized && noCardData) {
      await supabaseAdmin
        .from('no_card_access')
        .delete()
        .eq('id', noCardData.id);
    }

    const session = authData.session;

    return NextResponse.json({
      success: true,
      userId,
      session,
      isPreAuthorized,
      requiresConfirmation: !session,
      message: !session 
        ? 'Cadastro realizado! Por favor, verifique seu e-mail para ativar sua conta.' 
        : 'Cadastro realizado com sucesso!'
    });

  } catch (error: any) {
    console.error('Erro no fluxo de registro:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
