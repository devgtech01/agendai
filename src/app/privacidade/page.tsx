import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <header style={{ background: 'var(--color-primary)', padding: '12px 24px' }}>
        <div className="container flex justify-between items-center">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span>
            </div>
          </Link>
          <Link href="/profissional" className="btn btn-secondary btn-sm">
            Área do Profissional
          </Link>
        </div>
      </header>

      <main className="container flex-1" style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="heading-1" style={{ marginBottom: 'var(--space-6)' }}>Política de Privacidade e Reembolso</h1>
        
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '16px' }}>Última atualização: Julho de 2026</p>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>1. Coleta de Informações</h2>
          <p style={{ marginBottom: '16px' }}>
            Coletamos informações que você nos fornece diretamente ao criar uma conta, fazer um agendamento ou se comunicar conosco. Isso pode incluir nome, e-mail, número de telefone e dados de pagamento (processados de forma segura pelo Stripe).
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>2. Uso das Informações</h2>
          <p style={{ marginBottom: '16px' }}>
            Utilizamos suas informações para: processar e confirmar agendamentos, enviar notificações importantes, gerenciar sua assinatura de profissional e melhorar nossos serviços. Não vendemos suas informações pessoais a terceiros.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>3. Segurança dos Dados</h2>
          <p style={{ marginBottom: '16px' }}>
            Implementamos medidas de segurança rígidas para proteger suas informações. Todos os dados sensíveis, como senhas e tokens de pagamento, são criptografados através de nossos parceiros de infraestrutura (Supabase e Stripe).
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>4. Política de Cancelamento e Reembolso (Profissionais)</h2>
          <p style={{ marginBottom: '16px' }}>
            O Agendai oferece planos de assinatura para uso de nosso sistema por profissionais e estabelecimentos. Você pode cancelar sua assinatura a qualquer momento através do seu painel de faturamento (via Portal do Cliente Stripe). 
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li><strong>Cancelamento:</strong> O cancelamento impede renovações futuras, mas você continuará tendo acesso ao plano contratado até o final do período já pago.</li>
            <li><strong>Reembolsos:</strong> Não oferecemos reembolsos proporcionais para o tempo não utilizado após a cobrança de um ciclo (mensal, semestral ou anual). Em caso de cobrança indevida por falha técnica do nosso sistema, garantimos o estorno integral do valor cobrado em erro.</li>
          </ul>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>5. Direitos dos Usuários (LGPD)</h2>
          <p style={{ marginBottom: '16px' }}>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de solicitar o acesso, a correção ou a exclusão dos seus dados pessoais armazenados em nossa plataforma a qualquer momento.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>6. Contato</h2>
          <p style={{ marginBottom: '16px' }}>
            Se você tiver dúvidas ou solicitações referentes à sua privacidade ou reembolsos, entre em contato com nossa equipe de suporte.
          </p>
        </div>
      </main>

      <footer style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}>© {new Date().getFullYear()} Agendai. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)' }}>
            <Link href="/suporte" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '14px' }}>Suporte</Link>
            <Link href="/termos" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '14px' }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '14px' }}>Privacidade e Reembolsos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
