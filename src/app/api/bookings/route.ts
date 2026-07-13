import { NextResponse } from 'next/server';
import { getBookings, getBookingsByDate, addBooking, getEstablishmentById, getServiceById, getServices } from '@/lib/db';
import { verifyAdminRequest } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get('establishmentId');
    const date = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');

    // Caso de uso: Cliente público agendando horário (verifica apenas horários ocupados)
    if (establishmentId && date) {
      const bookings = await getBookingsByDate(establishmentId, date, professionalId || undefined);
      
      // Sanitização de dados pessoais (PII) para evitar vazamento
      const sanitizedBookings = bookings.map(b => ({
        id: b.id,
        establishmentId: b.establishmentId,
        serviceId: b.serviceId,
        professionalId: b.professionalId,
        date: b.date,
        time: b.time,
        status: b.status,
        clientName: 'Reservado', // Ofuscar nome do cliente
        clientEmail: '',         // Omitir email
        clientPhone: ''          // Omitir telefone
      }));
      
      return NextResponse.json(sanitizedBookings);
    }

    // Apenas Administrador autenticado pode listar agendamentos globais ou de um estabelecimento inteiro
    if (!verifyAdminRequest(request)) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação administrativa necessária.' }, { status: 401 });
    }

    if (establishmentId) {
      const bookings = await getBookings(establishmentId);
      return NextResponse.json(bookings);
    }

    const bookings = await getBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter agendamentos.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { establishmentId, serviceId, professionalId, clientName, clientEmail, clientPhone, date, time } = body;

    if (!establishmentId || !serviceId || !clientName || !clientEmail || !clientPhone || !date || !time) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }

    // Buscar o estabelecimento, o serviço solicitado, os agendamentos da data e a lista de serviços do estabelecimento
    const [establishment, service, existingBookings, allServices] = await Promise.all([
      getEstablishmentById(establishmentId),
      getServiceById(serviceId),
      getBookingsByDate(establishmentId, date, professionalId),
      getServices(establishmentId)
    ]);

    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 });
    }

    if (!establishment) {
      return NextResponse.json({ error: 'Estabelecimento não encontrado.' }, { status: 404 });
    }

    // Verificar se o dono do estabelecimento possui plano ativo
    if (establishment.ownerId) {
      try {
        const { supabaseAdmin } = await import('@/lib/supabase-admin');
        const { data: { user: owner } } = await supabaseAdmin.auth.admin.getUserById(establishment.ownerId);
        if (owner) {
          const isOwnerActive = owner?.user_metadata?.plan_status === 'active';
          if (!isOwnerActive) {
            return NextResponse.json(
              { error: 'Este estabelecimento está temporariamente indisponível para novos agendamentos por motivos administrativos.' },
              { status: 403 }
            );
          }
        }
      } catch (err) {
        console.error('Erro ao verificar plano do proprietário (ignorando para permitir fluxo):', err);
      }
    }

    // Algoritmo de colisão de horários (sobreposição por duração)
    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = timeToMinutes(time);
    const newEnd = newStart + service.durationMinutes;

    // Verificar se colide com o horário de almoço do estabelecimento
    if (establishment) {
      const lunchStart = establishment.lunchStart ? establishment.lunchStart.slice(0, 5) : '12:00';
      const lunchEnd = establishment.lunchEnd ? establishment.lunchEnd.slice(0, 5) : '13:00';
      const lunchStartMin = timeToMinutes(lunchStart);
      const lunchEndMin = timeToMinutes(lunchEnd);

      if (lunchStartMin !== lunchEndMin) {
        const overlapsLunch = newStart < lunchEndMin && newEnd > lunchStartMin;
        if (overlapsLunch) {
          return NextResponse.json({ error: 'Este horário colide com o horário de almoço do estabelecimento.' }, { status: 409 });
        }
      }
    }

    const hasConflict = existingBookings.some(b => {
      const bTime = b.time.slice(0, 5); // extrai HH:MM
      const bStart = timeToMinutes(bTime);
      const bService = allServices.find(s => s.id === b.serviceId);
      const bDuration = bService ? bService.durationMinutes : 30;
      const bEnd = bStart + bDuration;

      // Colide se Start1 < End2 e End1 > Start2
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasConflict) {
      return NextResponse.json({ error: 'Este horário colide com outro agendamento já existente.' }, { status: 409 });
    }

    const newBooking = await addBooking({
      establishmentId,
      serviceId,
      professionalId,
      clientName,
      clientEmail,
      clientPhone,
      date,
      time
    });

    if (newBooking && clientEmail !== 'blocked@agendai.com' && clientEmail !== 'vacation@agendai.com') {
      // Envia o e-mail em background sem travar o retorno da API
      (async () => {
        try {

          const estName = establishment ? establishment.name : 'Estabelecimento';
          const srvName = service ? service.name : 'Serviço';
          const formattedDate = date.split('-').reverse().join('/');
          const formattedTime = time.slice(0, 5);

          const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sisagendai.online';
          const appUrl = rawAppUrl.replace(/\/+$/, '');
          const cancelUrl = `${appUrl}/book/cancel/${newBooking.id}`;

          // 1. Enviar e-mail de confirmação para o cliente
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
            to: clientEmail,
            subject: `Agendamento Confirmado no ${estName}! ✨`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F8F7F4; padding: 40px 20px;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                  <div style="text-align: center; margin-bottom: 24px;">
                    <div style="font-size: 20px; font-weight: 600; color: #1A1A2E; letter-spacing: 0.02em; margin-bottom: 8px;">
                      Agend<span style="color: #C15A2E;">ai</span>
                    </div>
                    <h2 style="font-size: 22px; font-weight: 500; color: #2E2B25; margin: 0;">Agendamento Confirmado!</h2>
                  </div>
                  
                  <p style="font-size: 15px; color: #5F5A54; line-height: 1.6; margin-bottom: 24px;">
                    Olá, <strong>${clientName}</strong>! Tudo bem?<br />
                    Seu agendamento foi realizado com sucesso. Confira os detalhes abaixo:
                  </p>

                  <div style="background-color: #FEF3E2; border-left: 4px solid #C15A2E; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #8B5A0A;">
                      📍 <strong>Local:</strong> ${estName}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #8B5A0A;">
                      ✨ <strong>Serviço:</strong> ${srvName}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #8B5A0A;">
                      📅 <strong>Data:</strong> ${formattedDate}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #8B5A0A;">
                      ⏱ <strong>Horário:</strong> ${formattedTime}
                    </p>
                  </div>

                  <!-- Botão de Cancelamento Bulletproof para E-mails -->
                  <div style="text-align: center; margin: 32px 0 16px 0;">
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td align="center" bgcolor="#D9383A" style="border-radius: 8px;">
                          <a href="${cancelUrl}" target="_blank" style="font-size: 14px; font-family: sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid #D9383A; display: inline-block; font-weight: 600; background-color: #D9383A;">
                            ❌ Cancelar Agendamento
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 11px; color: #8C8378; margin-top: 8px; word-break: break-all;">
                      Ou acesse: <a href="${cancelUrl}" target="_blank" style="color: #C15A2E; text-decoration: underline;">${cancelUrl}</a>
                    </p>
                  </div>

                  <p style="font-size: 13px; color: #8C8378; line-height: 1.5; text-align: center; margin-top: 32px; border-top: 0.5px solid #E4E1DC; padding-top: 20px;">
                    Se precisar realizar alguma alteração ou falar com a equipe, entre em contato no telefone: <strong>${establishment?.phone || ''}</strong>.
                  </p>
                </div>
              </div>
            `,
          });

          // 2. Enviar e-mail de notificação para o profissional/administrador (se configurado)
          const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.NOTIFY_EMAIL;
          if (adminNotifyEmail) {
            await resend.emails.send({
              from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
              to: adminNotifyEmail,
              subject: `[Agendai] Novo Agendamento Recebido: ${srvName}! 📅`,
              html: `
                <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #F8F7F4; padding: 40px 20px;">
                  <div style="max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
                    <div style="text-align: center; margin-bottom: 24px;">
                      <div style="font-size: 20px; font-weight: 600; color: #1A1A2E; letter-spacing: 0.02em; margin-bottom: 8px;">
                        Agend<span style="color: #C15A2E;">ai</span> <span style="font-weight: 400; color: #8C8378; font-size: 14px;">Painel</span>
                      </div>
                      <h2 style="font-size: 22px; font-weight: 500; color: #2E2B25; margin: 0;">Novo Agendamento!</h2>
                      <p style="font-size: 14px; color: #8C8378; margin-top: 4px;">Você tem um novo compromisso na sua agenda</p>
                    </div>
                    
                    <p style="font-size: 15px; color: #5F5A54; line-height: 1.6; margin-bottom: 24px;">
                      Olá, administrador do <strong>${estName}</strong>!<br />
                      Um cliente acabou de agendar um horário com você. Veja os dados:
                    </p>

                    <div style="background-color: #EAF7EC; border-left: 4px solid #2D9D78; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #235A45;">
                        👤 <strong>Cliente:</strong> ${clientName}
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #235A45;">
                        📞 <strong>Contato:</strong> ${clientPhone}
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #235A45;">
                        ✨ <strong>Serviço:</strong> ${srvName}
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 14px; color: #235A45;">
                        📅 <strong>Data:</strong> ${formattedDate}
                      </p>
                      <p style="margin: 0; font-size: 14px; color: #235A45;">
                        ⏱ <strong>Horário:</strong> ${formattedTime}
                      </p>
                    </div>

                    <p style="font-size: 13px; color: #8C8378; line-height: 1.5; text-align: center; margin-top: 32px; border-top: 0.5px solid #E4E1DC; padding-top: 20px;">
                      Acesse seu <a href="${appUrl}/profissional/agenda" style="color: #C15A2E; text-decoration: none; font-weight: 600;">Painel de Controle</a> para gerenciar este e outros atendimentos.
                    </p>
                  </div>
                </div>
              `,
            });
          }
        } catch (emailError) {
          console.error('Erro ao enviar e-mails de confirmação/notificação:', emailError);
        }
      })();
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao registrar agendamento.' }, { status: 500 });
  }
}
