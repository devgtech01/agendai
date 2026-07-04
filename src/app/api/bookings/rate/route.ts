import { NextResponse } from 'next/server';
import { rateBooking, getBookingById } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, rating } = body;

    if (!bookingId || typeof rating !== 'number') {
      return NextResponse.json({ error: 'ID do agendamento e nota são obrigatórios.' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'A avaliação deve ser entre 1 e 5 estrelas.' }, { status: 400 });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    const success = await rateBooking(bookingId, rating);
    if (!success) {
      return NextResponse.json({ error: 'Erro ao salvar avaliação no banco de dados.' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Avaliação registrada com sucesso!',
      rating 
    });
  } catch (error: any) {
    console.error('Erro na API de avaliação:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
