import { NextResponse } from 'next/server';
import { getServiceById, getEstablishmentById } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do agendamento ausente.' }, { status: 400 });
    }

    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // Mapear snake_case para camelCase
    const camelBooking = {
      id: booking.id,
      establishmentId: booking.establishment_id,
      serviceId: booking.service_id,
      professionalId: booking.professional_id,
      clientName: booking.client_name,
      clientEmail: booking.client_email,
      clientPhone: booking.client_phone,
      date: booking.date,
      time: booking.time,
      status: booking.status,
      rating: booking.rating,
      createdAt: booking.created_at
    };

    const [service, establishment] = await Promise.all([
      getServiceById(camelBooking.serviceId),
      getEstablishmentById(camelBooking.establishmentId)
    ]);

    return NextResponse.json({
      booking: camelBooking,
      service,
      establishment
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do cancelamento:', error);
    return NextResponse.json({ error: 'Erro interno ao carregar agendamento.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'ID do agendamento ausente.' }, { status: 400 });
    }

    const { data: existingBooking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !existingBooking) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'Cancelado' })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError || !updatedData) {
      return NextResponse.json({ error: 'Falha ao atualizar status do agendamento.' }, { status: 500 });
    }

    const updated = {
      id: updatedData.id,
      establishmentId: updatedData.establishment_id,
      serviceId: updatedData.service_id,
      professionalId: updatedData.professional_id,
      clientName: updatedData.client_name,
      clientEmail: updatedData.client_email,
      clientPhone: updatedData.client_phone,
      date: updatedData.date,
      time: updatedData.time,
      status: updatedData.status,
      rating: updatedData.rating,
      createdAt: updatedData.created_at
    };

    // Enviar e-mail de confirmação de cancelamento para o cliente (se disponível)
    if (existingBooking.clientEmail) {
      (async () => {
        try {
          const [service, establishment] = await Promise.all([
            getServiceById(existingBooking.serviceId),
            getEstablishmentById(existingBooking.establishmentId)
          ]);
          const estName = establishment ? establishment.name : 'Estabelecimento';
          const srvName = service ? service.name : 'Serviço';
          const formattedDate = existingBooking.date.split('-').reverse().join('/');
          const formattedTime = existingBooking.time.slice(0, 5);

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
            to: existingBooking.clientEmail,
            subject: `Agendamento Cancelado - ${estName} ❌`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F8F7F4; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 20px; font-weight: 600; color: #1A1A2E; letter-spacing: 0.02em; margin-bottom: 8px;">
                      Agend<span style="color: #C15A2E;">ai</span>
                    </div>
                    <h2 style="font-size: 22px; font-weight: 500; color: #D9383A; margin: 0;">Agendamento Cancelado</h2>
                  </div>
                  
                  <p style="font-size: 15px; color: #5F5A54; line-height: 1.6; margin-bottom: 24px;">
                    Olá, <strong>${existingBooking.clientName}</strong>!<br />
                    Confirmamos que o seu agendamento foi cancelado com sucesso conforme solicitado.
                  </p>

                  <div style="background-color: #FDF2F2; border-left: 4px solid #D9383A; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #9B1C1C;">
                      📍 <strong>Local:</strong> ${estName}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #9B1C1C;">
                      ✨ <strong>Serviço:</strong> ${srvName}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #9B1C1C;">
                      📅 <strong>Data:</strong> ${formattedDate}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #9B1C1C;">
                      ⏱ <strong>Horário:</strong> ${formattedTime}
                    </p>
                  </div>

                  <p style="font-size: 13px; color: #8C8378; line-height: 1.5; text-align: center; margin-top: 32px; border-top: 0.5px solid #E4E1DC; padding-top: 20px;">
                    Se desejar agendar um novo horário futuramente, acesse nossa plataforma quando quiser!
                  </p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de cancelamento:', emailErr);
        }
      })();
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error);
    return NextResponse.json({ error: 'Erro interno ao cancelar agendamento.' }, { status: 500 });
  }
}
