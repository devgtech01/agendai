'use client';

import { useState, useEffect } from 'react';
import ProfissionalHeader from '@/components/ProfissionalHeader';
import { supabase } from '@/lib/supabase';
import { SupportTicket } from '@/lib/db';
import { LifeBuoy, Send, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';

export default function ProfissionalSuportePage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Baixa' | 'Media' | 'Alta' | 'Urgente'>('Media');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Estados e manipuladores para réplica e conclusão de chamado
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});

  const handleMarkSolved = async (ticketId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'updateStatus',
          ticketId,
          status: 'Resolvido',
          adminNotes: 'Chamado resolvido pelo cliente.'
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
      } else {
        alert('Erro ao marcar chamado como resolvido.');
      }
    } catch (err) {
      alert('Erro de conexão ao atualizar chamado.');
    }
  };

  const handleSendReply = async (ticketId: string) => {
    const text = replyTexts[ticketId] || '';
    if (!text.trim()) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'reply',
          ticketId,
          replyText: text
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
        setReplyTexts({ ...replyTexts, [ticketId]: '' });
      } else {
        alert('Erro ao enviar resposta.');
      }
    } catch (err) {
      alert('Erro de conexão ao enviar resposta.');
    }
  };

  useEffect(() => {
    async function loadUserAndTickets() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user?.email) {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;
          
          const res = await fetch(`/api/support?email=${encodeURIComponent(user.email)}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setTickets(data);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar suporte:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAndTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    try {
      setSubmitting(true);
      setFeedback(null);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/support', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user?.id,
          userType: 'professional',
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Profissional',
          email: user?.email || 'profissional@agendai.com',
          subject,
          message,
          priority,
        }),
      });

      if (res.ok) {
        const newTicket = await res.json();
        setTickets([newTicket, ...tickets]);
        setSubject('');
        setMessage('');
        setPriority('Media');
        setFeedback({ type: 'success', text: 'Chamado aberto com sucesso! Nossa equipe analisará em breve.' });
      } else {
        const errData = await res.json().catch(() => ({}));
        setFeedback({ type: 'danger', text: errData.error || 'Erro ao abrir chamado.' });
      }
    } catch (err) {
      setFeedback({ type: 'danger', text: 'Ocorreu um erro ao enviar seu chamado.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <span className="badge badge-warning flex items-center gap-1"><Clock size={12} /> Aberto</span>;
      case 'Em Andamento':
        return <span className="badge badge-info flex items-center gap-1"><AlertCircle size={12} /> Em Andamento</span>;
      case 'Resolvido':
        return <span className="badge badge-success flex items-center gap-1"><CheckCircle2 size={12} /> Resolvido</span>;
      default:
        return <span className="badge flex items-center gap-1">{status}</span>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <ProfissionalHeader />

      <main className="container" style={{ flex: 1, padding: 'var(--space-8) var(--space-6)' }}>
        {/* Header da Página */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-accent font-semibold text-sm uppercase tracking-wider mb-1">
              <LifeBuoy size={16} /> Suporte & Atendimento
            </div>
            <h1 className="heading-1">Central de Ajuda e Chamados</h1>
            <p className="text-muted text-sm mt-1">
              Teve alguma dúvida ou problema no sistema? Abra um chamado e nossa equipe te ajudará rapidamente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Novo Chamado */}
          <div className="lg:col-span-1">
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h2 className="heading-2 mb-4 flex items-center gap-2" style={{ fontSize: '18px' }}>
                <Send size={18} className="text-accent" /> Abrir Novo Chamado
              </h2>

              {feedback && (
                <div className={`badge badge-${feedback.type} w-full p-3 mb-4 text-center text-sm`} style={{ borderRadius: '8px' }}>
                  {feedback.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="input-label">Assunto / Tópico</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Dúvida sobre repasse ou erro no agendamento"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Urgência / Prioridade</label>
                  <select 
                    className="input" 
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                  >
                    <option value="Baixa">🟢 Baixa (Dúvidas gerais)</option>
                    <option value="Media">🟡 Média (Ajustes de configuração)</option>
                    <option value="Alta">🟠 Alta (Erro impeditivo no sistema)</option>
                    <option value="Urgente">🔴 Urgente (Problema crítico de pagamento)</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Descrição Detalhada</label>
                  <textarea 
                    className="input min-h-[120px]" 
                    placeholder="Descreva o que aconteceu ou a sua dúvida..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{ paddingTop: '10px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full flex justify-center items-center gap-2 mt-2"
                  disabled={submitting || !subject || !message}
                >
                  <Send size={16} />
                  {submitting ? 'Enviando...' : 'Enviar Chamado'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Chamados do Profissional */}
          <div className="lg:col-span-2">
            <div style={{ background: 'var(--color-surface)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <h2 className="heading-2 mb-4 flex items-center gap-2" style={{ fontSize: '18px' }}>
                <MessageSquare size={18} className="text-accent" /> Meus Chamados
              </h2>

              {loading ? (
                <div className="text-center py-12 text-muted">Carregando seus chamados...</div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <p className="mb-2">Nenhum chamado aberto no momento.</p>
                  <span className="text-xs">Se precisar de ajuda, preencha o formulário ao lado.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {tickets.map((t) => (
                    <div 
                      key={t.id}
                      style={{ 
                        border: '0.5px solid var(--color-border)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '16px',
                        background: 'var(--color-background)'
                      }}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{t.subject}</h3>
                          <span className="text-xs text-muted">Aberto em {new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded border border-border">
                            {t.priority}
                          </span>
                          {getStatusBadge(t.status)}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3" style={{ lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {t.message}
                      </p>

                      {t.adminNotes && (
                        <div style={{ background: 'var(--color-surface)', borderLeft: '3px solid var(--color-accent)', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '12px' }}>
                          <strong style={{ color: 'var(--color-accent)' }}>💬 Resposta da Equipe Agendai:</strong>
                          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text)', whiteSpace: 'pre-wrap' }}>{t.adminNotes}</p>
                        </div>
                      )}

                      {t.status !== 'Resolvido' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px', borderTop: '0.5px solid var(--color-border)', paddingTop: '14px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input 
                              type="text" 
                              className="input text-sm" 
                              placeholder="Escreva sua resposta para a equipe..."
                              value={replyTexts[t.id] || ''}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [t.id]: e.target.value })}
                              style={{ flex: 1, height: '38px' }}
                            />
                            <button
                              onClick={() => handleSendReply(t.id)}
                              disabled={!(replyTexts[t.id] || '').trim()}
                              className="btn btn-primary btn-sm"
                              style={{ height: '38px', padding: '0 16px' }}
                            >
                              Responder
                            </button>
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleMarkSolved(t.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                color: '#10B981', 
                                borderColor: '#10B981',
                                background: 'transparent'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <CheckCircle2 size={14} /> Marcar como Solucionado
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
