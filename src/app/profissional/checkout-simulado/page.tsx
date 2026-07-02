'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2, Sparkles, Check, QrCode, FileText, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get('email') || '';
  const planKey = searchParams.get('plan') || 'mensal';
  const userId = searchParams.get('userId') || '';

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto'>('card');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detalhes dos planos para exibir na fatura
  const planDetails: Record<string, { name: string; price: string; details: string; totalToday: string }> = {
    mensal: {
      name: 'Plano Mensal',
      price: 'R$ 34,90/mês',
      details: 'Primeiro mês totalmente grátis. Cobrança de R$ 34,90 inicia após 30 dias.',
      totalToday: 'R$ 0,00'
    },
    semestral: {
      name: 'Plano Semestral',
      price: 'R$ 178,44 a cada 6 meses',
      details: 'Economia de 15%. Renovado automaticamente a cada 6 meses.',
      totalToday: 'R$ 178,44'
    },
    anual: {
      name: 'Plano Anual',
      price: 'R$ 306,00 a cada 12 meses',
      details: 'O melhor custo-benefício (25% de desconto). Renovado automaticamente a cada ano.',
      totalToday: 'R$ 306,00'
    }
  };

  const currentPlan = planDetails[planKey] || planDetails.mensal;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Validações básicas de cartão simuladas
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Número de cartão inválido.');
        setProcessing(false);
        return;
      }
      if (expiry.length < 5) {
        setError('Data de validade inválida (Use MM/AA).');
        setProcessing(false);
        return;
      }
      if (cvc.length < 3) {
        setError('CVC inválido.');
        setProcessing(false);
        return;
      }
    }

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const trialUntil = planKey === 'mensal' ? trialEndDate.toISOString().split('T')[0] : null;

      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          plan: planKey,
          plan_status: 'active',
          stripe_customer_id: 'cus_simulado_123',
          stripe_subscription_id: 'sub_simulado_123',
          trial_until: trialUntil,
        }
      });

      if (!updateError) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/profissional/dashboard?session_id=mock_success_${Date.now()}&status=success`);
        }, 1500);
      } else {
        setError(updateError.message || 'Erro ao processar ativação do plano.');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de rede ao processar ativação.');
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .checkout-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, sans-serif;
          background-color: #F7F5F2;
          width: 100%;
        }
        .checkout-left-pane {
          flex: 4.5;
          background-color: #1A1A2E;
          color: #FFFFFF;
          padding: 64px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .checkout-right-pane {
          flex: 7.5;
          background-color: #F7F5F2;
          padding: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .checkout-form-card {
          background-color: #FFFFFF;
          padding: 40px;
          border-radius: 16px;
          border: 0.5px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-sizing: border-box;
        }
        .checkout-badge {
          display: inline-block;
          margin-left: 12px;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 11px;
          font-weight: 600;
          background-color: #C15A2E;
          color: #FFFFFF;
          text-transform: uppercase;
          vertical-align: middle;
        }
        .checkout-divider {
          height: 1px;
          background-color: rgba(255, 255, 255, 0.1);
          margin: 24px 0;
        }
        .checkout-success-card {
          text-align: center;
          padding: 40px;
          background-color: #FFFFFF;
          border-radius: 16px;
          border: 0.5px solid var(--color-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          width: 100%;
          max-width: 480px;
          animation: fadeIn 0.4s ease-out;
          box-sizing: border-box;
        }
        .input-row {
          display: flex;
          gap: 16px;
        }
        .input-col {
          flex: 1;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .payment-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--color-border);
          padding-bottom: 12px;
          margin-bottom: 8px;
        }
        .payment-tab-btn {
          background: transparent;
          border: none;
          padding: 10px 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-muted);
          cursor: pointer;
          border-radius: 8px;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex: 1;
        }
        .payment-tab-btn:hover {
          background-color: #F7F5F2;
          color: var(--color-text);
        }
        .payment-tab-btn.active {
          background-color: #1A1A2E;
          color: #FFFFFF;
          font-weight: 600;
        }
        .qrcode-box {
          border: 1px dashed var(--color-border);
          background-color: #FAFAFA;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 12px 0;
        }
        .qrcode-placeholder {
          width: 140px;
          height: 140px;
          background-color: #FFFFFF;
          border: 1.5px solid var(--color-border);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .qrcode-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background-color: var(--color-accent);
          animation: scan 2s linear infinite;
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .barcode-box {
          background-color: #FAFAFA;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 12px 0;
        }
        .barcode-lines {
          display: flex;
          align-items: center;
          height: 48px;
          gap: 2px;
        }
        .barcode-line-strip {
          height: 100%;
          background-color: #2E2B25;
        }
        .copy-input-container {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        @media (max-width: 960px) {
          .checkout-container {
            flex-direction: column;
          }
          .checkout-left-pane {
            flex: none;
            padding: 40px 24px;
          }
          .checkout-right-pane {
            flex: none;
            padding: 40px 20px;
          }
          .checkout-form-card, .checkout-success-card {
            padding: 24px;
          }
        }
      `}} />

      {/* Painel Esquerdo: Resumo do Plano (Estilo Stripe Checkout) */}
      <div className="checkout-left-pane">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Link href="/profissional/planos" className="inline-flex items-center gap-2 text-sm hover:opacity-80" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#E8D5B7', textDecoration: 'none', marginBottom: '40px' }}>
            <ArrowLeft className="h-4 w-4" /> Voltar aos planos
          </Link>
          
          <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 600, color: '#C15A2E', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: '#FFFFFF' }}>ai</span>
            </span>
            <span className="checkout-badge">Checkout Simulado</span>
          </div>

          <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', color: 'rgba(232, 213, 183, 0.7)', textTransform: 'uppercase', margin: 0 }}>Inscrição no plano</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginTop: '8px', marginBottom: '16px', fontWeight: 500, color: '#E8D5B7' }}>
            {currentPlan.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px', fontWeight: 500, fontFamily: 'var(--font-display)' }}>{currentPlan.price.split(' ')[0] + ' ' + currentPlan.price.split(' ')[1]}</span>
            <span style={{ fontSize: '14px', color: 'rgba(232, 213, 183, 0.6)' }}>{currentPlan.price.replace(currentPlan.price.split(' ')[0] + ' ' + currentPlan.price.split(' ')[1], '')}</span>
          </div>

          <p style={{ fontSize: '14px', color: 'rgba(232, 213, 183, 0.8)', lineHeight: 1.6, margin: 0 }}>
            {currentPlan.details}
          </p>

          <div className="checkout-divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500 }}>
            <span style={{ color: 'rgba(232, 213, 183, 0.7)' }}>Total hoje a pagar:</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', fontFamily: 'var(--font-display)' }}>{currentPlan.totalToday}</span>
          </div>
        </div>

        <div style={{ marginTop: '48px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'rgba(232, 213, 183, 0.5)' }}>
          <ShieldCheck className="h-4.5 w-4.5" style={{ color: '#C15A2E' }} />
          <span>Ambiente de testes seguro do Agendai</span>
        </div>

        {/* Abstrato Glow decorativo */}
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,90,46,0.12) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />
      </div>

      {/* Painel Direito: Formulário de Pagamento */}
      <div className="checkout-right-pane">
        {success ? (
          <div className="checkout-success-card">
            <div style={{ margin: '0 auto 24px auto', display: 'flex', height: '56px', width: '56px', alignItems: 'center', borderRadius: '50%', backgroundColor: '#EAF7EC', color: '#2A6B31', justifyContent: 'center' }}>
              <Check className="h-8 w-8" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Pagamento Confirmado!</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.5, margin: 0 }}>
              Seu plano foi ativado com sucesso. Redirecionando para o seu painel de controle profissional...
            </p>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--color-accent)' }} />
            </div>
          </div>
        ) : (
          <form onSubmit={handlePay} className="checkout-form-card">
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>Informações de Pagamento</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-muted)', margin: 0 }}>
                {paymentMethod === 'card' 
                  ? 'Simule o checkout inserindo qualquer número de cartão fictício.' 
                  : paymentMethod === 'pix' 
                  ? 'Copie o Pix Copia e Cola ou escaneie o código abaixo.' 
                  : 'Copie a linha digitável do boleto para pagamento.'}
              </p>
            </div>

            {/* Abas de Pagamento */}
            <div className="payment-tabs">
              <button
                type="button"
                onClick={() => { setPaymentMethod('card'); setError(''); }}
                className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
              >
                <CreditCard className="h-4 w-4" /> Cartão
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMethod('pix'); setError(''); }}
                className={`payment-tab-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
              >
                <QrCode className="h-4 w-4" /> Pix
              </button>
              <button
                type="button"
                onClick={() => { setPaymentMethod('boleto'); setError(''); }}
                className={`payment-tab-btn ${paymentMethod === 'boleto' ? 'active' : ''}`}
              >
                <FileText className="h-4 w-4" /> Boleto
              </button>
            </div>

            {/* Conteúdo condicional das Abas */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">E-mail de Cobrança</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    disabled
                    style={{ backgroundColor: '#F0EDE8', cursor: 'not-allowed', color: 'var(--color-muted)' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Nome no Cartão</label>
                  <input
                    type="text"
                    className="input"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="Nome igual impresso no cartão"
                    required={paymentMethod === 'card'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Número do Cartão</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      style={{ paddingLeft: '40px' }}
                      required={paymentMethod === 'card'}
                    />
                    <CreditCard style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', height: '18px', width: '18px', color: 'var(--color-muted)' }} />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="input-label">Validade (MM/AA)</label>
                    <input
                      type="text"
                      className="input"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="12/28"
                      maxLength={5}
                      required={paymentMethod === 'card'}
                    />
                  </div>
                  <div className="input-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label className="input-label">CVC (Atrás)</label>
                    <input
                      type="password"
                      className="input"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      required={paymentMethod === 'card'}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    Escaneie o QR Code abaixo pelo aplicativo do seu banco ou utilize o código copia e cola para ativar a assinatura.
                  </p>
                </div>
                
                <div className="qrcode-box">
                  <div className="qrcode-placeholder">
                    <svg width="110" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1A1A2E' }}>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="3" height="3" />
                      <rect x="18" y="18" width="3" height="3" />
                      <rect x="14" y="18" width="3" height="3" />
                      <rect x="18" y="14" width="3" height="3" />
                    </svg>
                    <div className="qrcode-line" />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase' }}>QR Code Gerado</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="input-label">Chave Pix Copia e Cola</label>
                  <div className="copy-input-container">
                    <input
                      type="text"
                      className="input"
                      readOnly
                      value={`00020101021226830014br.gov.bcb.pix0136agendai-mock-key-123456789-9028000000${planKey === 'mensal' ? '000' : planKey === 'semestral' ? '17844' : '30600'}`}
                      style={{ backgroundColor: '#F7F5F2', color: 'var(--color-text)', flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(`00020101021226830014br.gov.bcb.pix0136agendai-mock-key-123456789-9028000000${planKey === 'mensal' ? '000' : planKey === 'semestral' ? '17844' : '30600'}`)}
                      className="btn btn-secondary"
                      style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', minWidth: '90px' }}
                    >
                      {copied ? 'Copiado!' : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Copy className="h-3.5 w-3.5" /> Copiar</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'boleto' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                    Copie a linha digitável abaixo para efetuar o pagamento do boleto no aplicativo do seu banco ou internet banking.
                  </p>
                </div>

                <div className="barcode-box">
                  <div className="barcode-lines">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 1, 4, 3, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((w, idx) => (
                      <div key={idx} className="barcode-line-strip" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-success)', textTransform: 'uppercase' }}>Boleto Simulado</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="input-label">Linha Digitável</label>
                  <div className="copy-input-container">
                    <input
                      type="text"
                      className="input"
                      readOnly
                      value="34191.79001 01043.513184 91020.150008 7 90280000000000"
                      style={{ backgroundColor: '#F7F5F2', color: 'var(--color-text)', flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy("34191.79001 01043.513184 91020.150008 7 90280000000000")}
                      className="btn btn-secondary"
                      style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', minWidth: '90px' }}
                    >
                      {copied ? 'Copiado!' : <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Copy className="h-3.5 w-3.5" /> Copiar</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#FCEAEA', color: '#8B2222', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '13px', border: '1px solid #F3C3C3' }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full press"
              disabled={processing}
              style={{ marginTop: '8px', padding: '14px', height: '48px' }}
            >
              {processing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando assinatura...
                </span>
              ) : paymentMethod === 'card' && planKey === 'mensal' ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Sparkles className="h-4.5 w-4.5" />
                  Iniciar Teste Grátis de 30 Dias
                </span>
              ) : paymentMethod === 'card' ? (
                `Ativar Plano — ${currentPlan.totalToday}`
              ) : paymentMethod === 'pix' ? (
                "Simular Confirmação do Pix"
              ) : (
                "Simular Confirmação do Boleto"
              )}
            </button>

            <p style={{ fontSize: '11px', textAlign: 'center', color: 'var(--color-muted)', lineHeight: '1.5', margin: 0 }}>
              Ao confirmar, você concorda que esta é uma simulação de pagamento. Nenhuma cobrança real será realizada.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSimuladoPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F7F5F2]">Carregando tela de pagamento...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
