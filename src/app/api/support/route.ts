import { NextResponse } from 'next/server';
import { createSupportTicket, getSupportTickets, getSupportTicketsByUser, updateSupportTicketStatus } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    if (email) {
      const tickets = await getSupportTicketsByUser(email);
      return NextResponse.json(tickets);
    }

    const tickets = await getSupportTickets(status || undefined);
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Erro ao buscar chamados de suporte:', error);
    return NextResponse.json({ error: 'Erro ao buscar chamados de suporte.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Se for atualização de status por um admin
    if (body.action === 'updateStatus') {
      const { ticketId, status, adminNotes } = body;
      if (!ticketId || !status) {
        return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
      }

      const updated = await updateSupportTicketStatus(ticketId, status, adminNotes);
      if (!updated) {
        return NextResponse.json({ error: 'Falha ao atualizar o chamado.' }, { status: 500 });
      }

      // Notificar usuário por e-mail sobre a resposta/atualização do chamado
      (async () => {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
            to: updated.email,
            subject: `[Suporte Agendai] Atualização no Chamado: ${updated.subject}`,
            html: `
              <div style="font-family: system-ui, sans-serif; background-color: #F8F7F4; padding: 32px 16px;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 12px; padding: 24px;">
                  <h2 style="font-size: 20px; color: #1A1A2E; margin-top: 0;">Atualização do Suporte</h2>
                  <p style="font-size: 14px; color: #5F5A54;">Olá, <strong>${updated.name}</strong>!</p>
                  <p style="font-size: 14px; color: #5F5A54;">Seu chamado a respeito de <strong>"${updated.subject}"</strong> foi atualizado para o status: <strong>${updated.status}</strong>.</p>
                  ${adminNotes ? `
                    <div style="background-color: #F7F5F2; border-left: 4px solid #C15A2E; padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 13px; color: #2E2B25;">
                      <strong>Resposta da Equipe:</strong><br />${adminNotes}
                    </div>
                  ` : ''}
                  <p style="font-size: 12px; color: #8C8378; margin-bottom: 0;">Agradecemos por utilizar o Agendai.</p>
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('Erro ao enviar e-mail de resposta do chamado:', mailErr);
        }
      })();

      return NextResponse.json(updated);
    }

    // Criação de novo chamado
    const { userId, userType, name, email, phone, subject, message, priority } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Nome, e-mail, assunto e mensagem são obrigatórios.' }, { status: 400 });
    }

    const newTicket = await createSupportTicket({
      userId,
      userType: userType || 'professional',
      name,
      email,
      phone,
      subject,
      message,
      priority: priority || 'Media',
    });

    if (!newTicket) {
      return NextResponse.json({ error: 'Erro ao criar chamado de suporte.' }, { status: 500 });
    }

    // Notificar admin se for prioridade alta/urgente ou envio padrão
    const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.NOTIFY_EMAIL;
    if (adminNotifyEmail) {
      (async () => {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
            to: adminNotifyEmail,
            subject: `[Novo Chamado] [${newTicket.priority}] ${newTicket.subject}`,
            html: `
              <div style="font-family: system-ui, sans-serif; background-color: #F8F7F4; padding: 32px 16px;">
                <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 12px; padding: 24px;">
                  <h2 style="font-size: 18px; color: #C15A2E; margin-top: 0;">Novo Chamado de Suporte</h2>
                  <p style="font-size: 14px; color: #5F5A54;"><strong>Remetente:</strong> ${newTicket.name} (${newTicket.email})</p>
                  <p style="font-size: 14px; color: #5F5A54;"><strong>Tipo:</strong> ${newTicket.userType}</p>
                  <p style="font-size: 14px; color: #5F5A54;"><strong>Prioridade:</strong> ${newTicket.priority}</p>
                  <div style="background-color: #F7F5F2; padding: 12px; border-radius: 6px; font-size: 13px; color: #2E2B25; margin: 16px 0;">
                    ${newTicket.message}
                  </div>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sisagendai.online'}/admin/dashboard" style="display: inline-block; background-color: #1A1A2E; color: #FFF; padding: 10px 18px; font-size: 13px; border-radius: 6px; text-decoration: none;">Acessar Painel Admin</a>
                </div>
              </div>
            `,
          });
        } catch (mailErr) {
          console.error('Erro ao notificar admin sobre novo chamado:', mailErr);
        }
      })();
    }

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Erro na API de suporte:', error);
    return NextResponse.json({ error: 'Erro interno ao processar suporte.' }, { status: 500 });
  }
}
