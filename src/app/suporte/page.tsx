'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, Send, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PublicSuportePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    try {
      setSubmitting(true);
      setErrorMsg('');

      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'client',
          name,
          email,
          phone,
          subject,
          message,
          priority: 'Media',
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || 'Erro ao enviar mensagem.');
      }
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao enviar sua mensagem. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header Simples */}
      <header style={{ background: 'var(--color-primary)', padding: '14px 24px' }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span style={{ fontWeight: 400, color: 'rgba(232,213,183,0.55)', fontSize: '13px' }}>Ajuda</span>
            </div>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm flex items-center gap-1" style={{ borderColor: 'rgba(232,213,183,0.3)', color: 'var(--color-linen)' }}>
            <ArrowLeft size={14} /> Voltar ao Site
          </Link>
        </div>
      </header>

      <main className="container flex-1 flex items-center justify-center" style={{ padding: 'var(--space-10) var(--space-6)' }}>
        <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '540px', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          {submitted ? (
            <div className="text-center py-6 animate-fade-in">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto' }}>
                ✓
              </div>
              <h2 className="heading-2 mb-2">Mensagem Enviada!</h2>
              <p className="text-muted text-sm mb-6" style={{ lineHeight: 1.6 }}>
                Obrigado, <strong>{name}</strong>! Recebemos a sua solicitação a respeito de <strong>"{subject}"</strong>. Nossa equipe de suporte analisará e responderá no e-mail <strong>{email}</strong>.
              </p>
              <Link href="/" className="btn btn-primary btn-full">
                Voltar à Página Inicial
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-accent font-semibold text-xs uppercase tracking-wider mb-2">
                <LifeBuoy size={16} /> Suporte ao Cliente
              </div>
              <h1 className="heading-1 mb-2">Como podemos te ajudar?</h1>
              <p className="text-muted text-sm mb-6">
                Caso tenha dúvidas sobre algum agendamento ou suporte geral na plataforma, preencha o formulário abaixo.
              </p>

              {errorMsg && (
                <div className="badge badge-danger w-full p-3 mb-4 text-center text-sm" style={{ borderRadius: '8px' }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="input-label">Seu Nome Completo</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Seu E-mail</label>
                    <input 
                      type="email" 
                      className="input" 
                      placeholder="carlos@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Telefone / WhatsApp</label>
                    <input 
                      type="tel" 
                      className="input" 
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Assunto</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Dúvida sobre cancelamento ou reembolso"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Sua Mensagem</label>
                  <textarea 
                    className="input min-h-[100px]" 
                    placeholder="Descreva detalhadamente a sua dúvida ou necessidade..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{ paddingTop: '10px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-full flex items-center justify-center gap-2 mt-2"
                  disabled={submitting || !name || !email || !subject || !message}
                >
                  <Send size={16} />
                  {submitting ? 'Enviando Mensagem...' : 'Enviar Solicitação'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
