import { NextResponse } from 'next/server';
import { getServices, addService } from '@/lib/db';
import { getAuthenticatedUser, checkUserPlanIsActive } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId') || undefined;

    // Pequeno delay para simulação de rede
    await new Promise(resolve => setTimeout(resolve, 400));

    const services = await getServices(establishmentId);
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar serviços.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authContext = await getAuthenticatedUser(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação necessária.' }, { status: 401 });
    }

    // Verificar se o usuário (não-admin) possui plano ativo
    if (!authContext.isAdmin && authContext.user) {
      const isActive = await checkUserPlanIsActive(authContext.user.id);
      if (!isActive) {
        return NextResponse.json({ error: 'Assinatura inativa. Contrate um plano para gerenciar serviços.' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { establishmentId, name, description, durationMinutes, price, category, imageUrl } = body;

    if (!establishmentId || !name || !description || !durationMinutes || !price || !category) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const defaultImg = imageUrl || 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80';

    const newService = await addService({
      establishmentId,
      name,
      description,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      category,
      imageUrl: defaultImg
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar serviço.' }, { status: 500 });
  }
}
