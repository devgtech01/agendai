const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// ==========================================
// 1. CARREGAR VARIÁVEIS DE AMBIENTE
// ==========================================
const envPath = fs.existsSync(path.join(__dirname, '../.env.local')) 
  ? path.join(__dirname, '../.env.local') 
  : path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
  console.log('✅ Variáveis de ambiente carregadas de:', envPath);
} else {
  console.warn('⚠️ Arquivo de configuração de ambiente não encontrado.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sisagendai.online';

if (!supabaseUrl || !supabaseKey || !resendApiKey) {
  console.error('❌ Erro: Variáveis do Supabase ou Resend ausentes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

// ==========================================
// 2. FUNÇÃO PRINCIPAL DE PROCESSAMENTO
// ==========================================
async function checkAndSendReminders() {
  console.log(`\n🕒 [${new Date().toISOString()}] Iniciando varredura de lembretes...`);

  try {
    // Buscar todos os agendamentos confirmados cujo lembrete ainda não foi enviado
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*, service:services(*), establishment:establishments(*), professional:professionals(*)')
      .eq('status', 'Confirmado')
      .eq('reminder_sent', false);

    if (error) {
      console.error('❌ Erro ao consultar agendamentos:', error.message);
      return;
    }

    if (!bookings || bookings.length === 0) {
      console.log('ℹ️ Nenhum agendamento pendente de lembrete.');
      return;
    }

    const now = new Date();
    console.log(`📊 Encontrados ${bookings.length} agendamentos confirmados sem lembrete. Analisando proximidade...`);

    for (const b of bookings) {
      // Garantir o parsing em UTC-3 (Horário de Brasília)
      const bookingDateTimeStr = `${b.date}T${b.time.slice(0, 8)}-03:00`;
      const bookingDateTime = new Date(bookingDateTimeStr);

      const diffMs = bookingDateTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Se estiver na janela de envio (até 2 horas antes e no futuro)
      if (diffHours > 0 && diffHours <= 2) {
        console.log(`🚀 Agendamento #${b.id} é daqui a ${diffHours.toFixed(2)} horas. Enviando e-mail para ${b.client_email}...`);

        const establishmentName = b.establishment ? b.establishment.name : 'Estabelecimento Parceiro';
        const serviceName = b.service ? b.service.name : 'Serviço Agendado';
        const professionalName = b.professional ? b.professional.name : 'Qualquer Profissional';
        const establishmentAddress = b.establishment ? b.establishment.address : 'Ver no catálogo';
        const cancelLink = `${appUrl}/book/cancel/${b.id}`;

        const emailHtml = `
          <div style="background-color: #FAF8F5; font-family: sans-serif; padding: 40px 20px; color: #1E1B18;">
            <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E3DFD5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
              <div style="background-color: #1E1B18; padding: 24px; text-align: center; border-bottom: 3px solid #E8D5B7;">
                <span style="font-size: 24px; font-weight: bold; color: #FAF8F5; letter-spacing: 0.02em;">Agend<span style="color: #E8D5B7;">ai</span></span>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #1E1B18;">Olá, ${b.client_name}!</h2>
                <p style="font-size: 14.5px; color: #5C554E; line-height: 1.6; margin-bottom: 24px;">
                  Passando para te lembrar que seu agendamento no estabelecimento <strong>${establishmentName}</strong> está confirmado para hoje!
                </p>
                
                <div style="background-color: #FAF8F5; padding: 20px; border-radius: 12px; border: 1px solid #E3DFD5; margin-bottom: 32px;">
                  <h3 style="font-size: 14px; font-weight: 600; margin-top: 0; margin-bottom: 12px; text-transform: uppercase; color: #5C554E; letter-spacing: 0.04em;">Detalhes do Agendamento</h3>
                  <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #8A7E72; width: 100px;">Serviço:</td>
                      <td style="padding: 6px 0; color: #1E1B18; font-weight: 600;">${serviceName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #8A7E72;">Horário:</td>
                      <td style="padding: 6px 0; color: #1E1B18; font-weight: 600;">${b.time.slice(0, 5)} hs</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #8A7E72;">Profissional:</td>
                      <td style="padding: 6px 0; color: #1E1B18; font-weight: 600;">${professionalName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #8A7E72;">Endereço:</td>
                      <td style="padding: 6px 0; color: #1E1B18; font-weight: 500;">${establishmentAddress}</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 13.5px; color: #8A7E72; text-align: center; margin-bottom: 24px;">
                  Caso tenha algum imprevisto e precise cancelar o compromisso, clique no botão abaixo para liberar o horário:
                </p>

                <div style="text-align: center; margin-bottom: 32px;">
                  <a href="${cancelLink}" target="_blank" style="background-color: #D9383A; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(217, 56, 58, 0.25);">
                    Cancelar Agendamento
                  </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #E3DFD5; margin-bottom: 24px;" />
                <p style="font-size: 12px; color: #8A7E72; text-align: center; margin: 0;">
                  Agradecemos a preferência! Te vemos em breve.
                </p>
              </div>
            </div>
          </div>
        `;

        try {
          const { error: mailError } = await resend.emails.send({
            from: 'Agendai <onboarding@resend.dev>',
            to: b.client_email,
            subject: `Lembrete: Seu agendamento é hoje às ${b.time.slice(0, 5)}! 💈`,
            html: emailHtml,
          });

          if (mailError) {
            console.error(`❌ Falha ao enviar e-mail para ${b.client_email}:`, mailError.message);
          } else {
            console.log(`✉️ Lembrete enviado com sucesso para ${b.client_email}`);
            
            // Atualizar banco de dados para evitar reenvio
            const { error: dbError } = await supabase
              .from('bookings')
              .update({ reminder_sent: true })
              .eq('id', b.id);

            if (dbError) {
              console.error(`❌ Erro ao atualizar reminder_sent no banco para #${b.id}:`, dbError.message);
            } else {
              console.log(`✅ Agendamento #${b.id} marcado como lembrete enviado.`);
            }
          }
        } catch (mailEx) {
          console.error(`❌ Exceção ao disparar e-mail para ${b.client_email}:`, mailEx);
        }
      } else if (diffHours < 0) {
        // Se já passou do horário e não foi enviado, marcamos como enviado para expirá-lo
        console.log(`ℹ️ Agendamento #${b.id} já passou do horário (${b.date} às ${b.time}). Expirando lembrete...`);
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', b.id);
      }
    }
  } catch (err) {
    console.error('❌ Exceção geral na varredura de lembretes:', err);
  }
}

// ==========================================
// 3. AGENDAMENTO DO WORKER
// ==========================================
const TIMER_INTERVAL_MS = 5 * 60 * 1000; // Rodar a cada 5 minutos

console.log('💈 Inicializando Daemon do Worker de Lembretes Agendai...');
console.log(`⏱️ Intervalo definido: a cada ${TIMER_INTERVAL_MS / 60000} minutos.`);

// Executar varredura imediatamente no início
checkAndSendReminders();

// Registrar execução contínua
setInterval(checkAndSendReminders, TIMER_INTERVAL_MS);
