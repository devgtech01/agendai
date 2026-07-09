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

    return NextResponse.json({
      plan: user.user_metadata?.plan || 'Nenhum',
      planStatus: user.user_metadata?.plan_status || 'inactive',
      cancelAtPeriodEnd: user.user_metadata?.cancel_at_period_end === true
    });
  } catch (error: any) {
    console.error('Erro na API de status do usuário:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
