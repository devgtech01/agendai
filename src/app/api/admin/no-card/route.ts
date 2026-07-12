import { NextResponse } from 'next/server';
import { supabaseAdmin, verifyAdminRequest } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('no_card_access')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao listar no_card_access:', error);
      return NextResponse.json({ error: 'Erro ao carregar pré-autorizações.' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verificar se o usuário já existe no Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Erro ao listar usuários:', listError);
    }

    const existingUser = users?.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (existingUser) {
      // Caso já exista, libera o acesso dele imediatamente por 30 dias!
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const trialUntil = trialEndDate.toISOString();

      // Atualizar o Auth Metadata do usuário
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          plan_status: 'active',
          trial_until: trialUntil,
          plan: 'mensal (liberado sem cartão)'
        }
      });

      if (updateError) {
        console.error('Erro ao atualizar auth metadata do usuário:', updateError);
        return NextResponse.json({ error: 'Erro ao liberar acesso no Supabase Auth.' }, { status: 500 });
      }

      // Atualizar o status de faturamento da tabela de estabelecimentos
      const { error: dbError } = await supabaseAdmin
        .from('establishments')
        .update({ plan_status: 'active' })
        .eq('owner_id', existingUser.id);

      if (dbError) {
        console.error('Erro ao atualizar estabelecimentos:', dbError);
      }

      return NextResponse.json({ 
        success: true, 
        activatedExisting: true, 
        message: `Acesso do usuário existente ${normalizedEmail} liberado com sucesso por 30 dias!` 
      });
    }

    // 2. Se o usuário ainda não existe, insere o e-mail na tabela de pré-autorizados
    const { data, error } = await supabaseAdmin
      .from('no_card_access')
      .insert([{ email: normalizedEmail }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // UNIQUE constraint violation
        return NextResponse.json({ error: 'Este e-mail já possui pré-autorização ativa.' }, { status: 400 });
      }
      console.error('Erro ao inserir em no_card_access:', error);
      return NextResponse.json({ error: 'Erro ao salvar e-mail pré-autorizado.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      activatedExisting: false, 
      data,
      message: `E-mail ${normalizedEmail} pré-autorizado! O usuário poderá se cadastrar sem cartão.` 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID da pré-autorização é obrigatório.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('no_card_access')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir de no_card_access:', error);
      return NextResponse.json({ error: 'Erro ao remover pré-autorização.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
