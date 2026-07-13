import { NextResponse } from 'next/server';
import { getEstablishments, addEstablishment, deleteEstablishment } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const establishments = await getEstablishments();
    return NextResponse.json(establishments);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao carregar estabelecimentos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, address, phone, imageUrl } = body;

    if (!name || !description || !address || !phone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    const defaultImg = imageUrl || '';

    const newEstablishment = await addEstablishment({
      name,
      description,
      address,
      phone,
      imageUrl: defaultImg
    });

    return NextResponse.json(newEstablishment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar estabelecimento.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do estabelecimento não fornecido.' }, { status: 400 });
    }

    const deleted = await deleteEstablishment(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Falha ao excluir o estabelecimento.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir estabelecimento:', error);
    return NextResponse.json({ error: 'Erro interno ao excluir estabelecimento.' }, { status: 500 });
  }
}
