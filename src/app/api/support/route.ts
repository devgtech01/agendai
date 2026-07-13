import { NextResponse } from 'next/server';
import { createSupportTicket, getSupportTickets, getSupportTicketsByUser, updateSupportTicketStatus } from '@/lib/db';
import { getAuthenticatedUser, supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function mapSupportTicket(data: any) {
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    userType: data.user_type || 'professional',
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    status: data.status || 'Aberto',
    priority: data.priority || 'Media',
    adminNotes: data.admin_notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    const authContext = await getAuthenticatedUser(request);
    if (!authContext) {
      return NextResponse.json({ error: 'Acesso negado. Autenticação necessária.' }, { status: 401 });
    }

    if (email) {
      // O usuário pode ver seus próprios chamados, e o Admin pode ver os chamados de qualquer um
      const isOwner = authContext.user && authContext.user.email?.toLowerCase() === email.toLowerCase();
      if (!authContext.isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Não autorizado a visualizar chamados de outro e-mail.' }, { status: 403 });
      }
      const tickets = await getSupportTicketsByUser(email);
      return NextResponse.json(tickets);
    }

    // Apenas Administrador pode ver todos os chamados
    if (!authContext.isAdmin) {
      return NextResponse.json({ error: 'Acesso restrito ao Super-Admin.' }, { status: 403 });
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

    // Se for atualização de status (por um admin ou pelo próprio profissional)
    if (body.action === 'updateStatus') {
      const authContext = await getAuthenticatedUser(request);
      if (!authContext) {
        return NextResponse.json({ error: 'Acesso negado. Autenticação necessária.' }, { status: 401 });
      }

      const { ticketId, status, adminNotes } = body;
      if (!ticketId || !status) {
        return NextResponse.json({ error: 'ID e status são obrigatórios.' }, { status: 400 });
      }

      // Obter o chamado para verificar propriedade
      const { data: ticket, error: fetchErr } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (fetchErr || !ticket) {
        return NextResponse.json({ error: 'Chamado não encontrado.' }, { status: 404 });
      }

      // Autorizar se for Admin ou Dono
      const isOwner = authContext.user && authContext.user.email?.toLowerCase() === ticket.email.toLowerCase();
      if (!authContext.isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
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

    // Se for resposta ao chamado por parte do profissional
    if (body.action === 'reply') {
      const authContext = await getAuthenticatedUser(request);
      if (!authContext) {
        return NextResponse.json({ error: 'Acesso negado. Autenticação necessária.' }, { status: 401 });
      }

      const { ticketId, replyText } = body;
      if (!ticketId || !replyText) {
        return NextResponse.json({ error: 'ID do chamado e texto da resposta são obrigatórios.' }, { status: 400 });
      }

      // 1. Obter o chamado para verificar propriedade
      const { data: ticket, error: fetchErr } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (fetchErr || !ticket) {
        return NextResponse.json({ error: 'Chamado não encontrado.' }, { status: 404 });
      }

      // Autorizar se for Admin ou Dono
      const isOwner = authContext.user && authContext.user.email?.toLowerCase() === ticket.email.toLowerCase();
      if (!authContext.isAdmin && !isOwner) {
        return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
      }

      // 2. Montar nova mensagem com histórico
      const rawDate = new Date();
      const formattedDate = rawDate.toLocaleDateString('pt-BR') + ' às ' + rawDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      let newHistory = ticket.message || '';
      
      // Se houver uma resposta anterior do admin, anexa no histórico
      if (ticket.admin_notes) {
        newHistory += `\n\n💬 Resposta da Equipe (${formattedDate}):\n${ticket.admin_notes}`;
      }
      
      // Anexa a nova resposta do profissional
      newHistory += `\n\n📝 Resposta do Profissional (${formattedDate}):\n${replyText}`;

      // 3. Atualizar no banco (limpa as notas administrativas anteriores e volta o status para 'Aberto')
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('support_tickets')
        .update({
          message: newHistory,
          admin_notes: null,
          status: 'Aberto',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (updateErr || !updated) {
        return NextResponse.json({ error: 'Erro ao registrar resposta.' }, { status: 500 });
      }

      // Notificar o admin por e-mail de que o chamado recebeu uma resposta
      const adminNotifyEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.NOTIFY_EMAIL;
      if (adminNotifyEmail) {
        (async () => {
          try {
            await resend.emails.send({
              from: process.env.EMAIL_FROM || 'Agendai <atendimento@sisagendai.online>',
              to: adminNotifyEmail,
              subject: `[Réplica Suporte] Chamado #${updated.id.slice(0, 8)} de ${updated.name}`,
              html: `
                <div style="font-family: system-ui, sans-serif; background-color: #F8F7F4; padding: 32px 16px;">
                  <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E4E1DC; border-radius: 12px; padding: 24px;">
                    <h2 style="font-size: 18px; color: #C15A2E; margin-top: 0;">Resposta do Cliente no Suporte</h2>
                    <p style="font-size: 14px; color: #5F5A54;"><strong>Remetente:</strong> ${updated.name} (${updated.email})</p>
                    <p style="font-size: 14px; color: #5F5A54;"><strong>Chamado:</strong> "${updated.subject}"</p>
                    <p style="font-size: 14px; color: #5F5A54;"><strong>Mensagem enviada:</strong></p>
                    <div style="background-color: #F7F5F2; padding: 12px; border-radius: 6px; font-size: 13px; color: #2E2B25; margin: 16px 0; white-space: pre-wrap;">
                      ${replyText}
                    </div>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sisagendai.online'}/admin/dashboard" style="display: inline-block; background-color: #1A1A2E; color: #FFF; padding: 10px 18px; font-size: 13px; border-radius: 6px; text-decoration: none;">Acessar Painel Admin</a>
                  </div>
                </div>
              `,
            });
          } catch (mailErr) {
            console.error('Erro ao notificar admin sobre réplica:', mailErr);
          }
        })();
      }

      return NextResponse.json(mapSupportTicket(updated));
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
