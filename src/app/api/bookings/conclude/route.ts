import { NextResponse } from 'next/server';
import { updateBookingStatus, getBookingById, getEstablishmentById, getServiceById } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'ID do agendamento é obrigatório.' }, { status: 400 });
    }

    // 1. Obter o agendamento atual
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    if (booking.status === 'Concluido') {
      return NextResponse.json({ error: 'Este agendamento já foi concluído.' }, { status: 400 });
    }

    // 2. Atualizar status para Concluido
    const updated = await updateBookingStatus(bookingId, 'Concluido');
    if (!updated) {
      return NextResponse.json({ error: 'Erro ao atualizar status do agendamento.' }, { status: 500 });
    }

    // 3. Enviar e-mail de avaliação para o cliente
    if (booking.clientEmail && booking.clientEmail !== 'blocked@agendai.com' && booking.clientEmail !== 'vacation@agendai.com') {
      (async () => {
        try {
          const establishment = await getEstablishmentById(booking.establishmentId);
          const service = await getServiceById(booking.serviceId);
          
          const estName = establishment ? establishment.name : 'Estabelecimento';
          const srvName = service ? service.name : 'Serviço';
          
          const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sisagendai.online';
          const appUrl = rawAppUrl.replace(/\/+$/, '');
          const rateUrl = `${appUrl}/book/cancel/${bookingId}`;

          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
            to: booking.clientEmail,
            subject: `Como foi seu atendimento no ${estName}? ⭐`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F8F7F4; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); text-align: center;">
                  <div style="font-size: 20px; font-weight: 600; color: #1A1A2E; letter-spacing: 0.02em; margin-bottom: 24px;">
                    Agend<span style="color: #C15A2E;">ai</span>
                  </div>
                  
                  <div style="font-size: 40px; margin-bottom: 16px;">⭐</div>
                  
                  <h2 style="font-size: 22px; font-weight: 500; color: #2E2B25; margin: 0 0 12px 0;">Avalie seu atendimento!</h2>
                  
                  <p style="font-size: 15px; color: #5F5A54; line-height: 1.6; margin-bottom: 24px; text-align: left;">
                    Olá, <strong>${booking.clientName}</strong>!<br /><br />
                    Esperamos que sua experiência com o serviço <strong>${srvName}</strong> no estabelecimento <strong>${estName}</strong> tenha sido excelente!
                    <br /><br />
                    Sua opinião é muito importante para nós e ajuda a melhorar os serviços prestados. Por favor, dedique 1 minuto para dar sua nota de 1 a 5 estrelas:
                  </p>

                  <div style="margin: 32px 0 16px 0;">
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td align="center" bgcolor="#C15A2E" style="border-radius: 8px;">
                          <a href="${rateUrl}" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid #C15A2E; display: inline-block; font-weight: 600; background-color: #C15A2E;">
                            ⭐ Avaliar Atendimento Agora
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 11px; color: #8C8378; margin-top: 8px; word-break: break-all;">
                      Ou acesse: <a href="${rateUrl}" target="_blank" style="color: #C15A2E; text-decoration: underline;">${rateUrl}</a>
                    </p>
                  </div>
                </div>
              </div>
            `,
          });
        } catch (err) {
          console.error('Erro ao enviar e-mail de avaliação:', err);
        }
      })();
    }

    return NextResponse.json({ success: true, status: 'Concluido' });
  } catch (error: any) {
    console.error('Erro ao concluir agendamento:', error);
    return NextResponse.json({ error: error.message || 'Erro interno no servidor' }, { status: 500 });
  }
}
