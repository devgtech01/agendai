import Link from 'next/link';

export default function TermosPage() {
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
        <h1 className="heading-1" style={{ marginBottom: 'var(--space-6)' }}>Termos de Uso</h1>
        
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', color: 'var(--color-text)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '16px' }}>Última atualização: Julho de 2026</p>
          
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>1. Aceitação dos Termos</h2>
          <p style={{ marginBottom: '16px' }}>
            Ao acessar e usar a plataforma Agendai, você concorda em cumprir e ser regido por estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>2. Descrição do Serviço</h2>
          <p style={{ marginBottom: '16px' }}>
            O Agendai é uma plataforma de agendamentos online que conecta clientes a profissionais e estabelecimentos de beleza e bem-estar. Fornecemos ferramentas de gestão de agenda para os profissionais e um catálogo de serviços para os clientes finais.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>3. Cadastro e Conta de Profissional</h2>
          <p style={{ marginBottom: '16px' }}>
            Para utilizar as ferramentas de gestão, o profissional deve criar uma conta, fornecendo informações precisas e completas. O profissional é o único responsável por manter a confidencialidade de suas credenciais de acesso e pelas atividades que ocorram sob sua conta.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>4. Assinaturas e Pagamentos</h2>
          <p style={{ marginBottom: '16px' }}>
            O uso das ferramentas de gestão pelo profissional está sujeito à contratação de um plano de assinatura, cujos valores e condições estão descritos na página de planos. Os pagamentos são processados com segurança via Stripe. A assinatura será renovada automaticamente conforme a periodicidade escolhida, a menos que cancelada antes do fim do ciclo atual.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>5. Agendamentos e Responsabilidades</h2>
          <p style={{ marginBottom: '16px' }}>
            O Agendai atua apenas como intermediador tecnológico. Não nos responsabilizamos pela qualidade dos serviços prestados pelos estabelecimentos, por atrasos ou por não comparecimentos (tanto de profissionais quanto de clientes). Qualquer disputa referente ao serviço prestado deve ser resolvida diretamente entre o cliente e o estabelecimento.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>6. Modificações do Serviço e dos Termos</h2>
          <p style={{ marginBottom: '16px' }}>
            Reservamo-nos o direito de modificar ou descontinuar a plataforma a qualquer momento. Podemos também revisar estes Termos de Uso periodicamente. O uso continuado da plataforma após alterações constitui a aceitação dos novos termos.
          </p>

          <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '24px', marginBottom: '12px' }}>7. Contato</h2>
          <p style={{ marginBottom: '16px' }}>
            Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail de suporte.
          </p>
        </div>
      </main>

      <footer style={{ background: 'var(--color-surface)', padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)', marginTop: 'auto' }}>
        <div className="container" style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
          <p style={{ marginBottom: 'var(--space-4)' }}>© {new Date().getFullYear()} Agendai. Todos os direitos reservados.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)' }}>
            <Link href="/termos" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '14px' }}>Termos de Uso</Link>
            <Link href="/privacidade" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '14px' }}>Privacidade e Reembolsos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
