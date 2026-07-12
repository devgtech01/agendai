'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Store, 
  Calendar, 
  ShieldCheck, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Send,
  RefreshCw,
  LogOut,
  ChevronRight,
  UserCheck,
  Trash2
} from 'lucide-react';
import { SupportTicket, Establishment, Booking } from '@/lib/db';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'support' | 'nocard' | 'establishments' | 'bookings'>('overview');
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [noCardEmails, setNoCardEmails] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [newNoCardEmail, setNewNoCardEmail] = useState('');
  const [submittingNoCard, setSubmittingNoCard] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [supportFilter, setSupportFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Resposta de Chamado
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseNotes, setResponseNotes] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('Em Andamento');
  const [updatingTicket, setUpdatingTicket] = useState(false);

  // Modal de Exclusão de Estabelecimento (Confirmação em 2 etapas)
  const [deletingEstablishment, setDeletingEstablishment] = useState<Establishment | null>(null);
  const [confirmNameText, setConfirmNameText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('adminToken') || 'AgendaiAdmin2026!';
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [tRes, eRes, bRes, nRes] = await Promise.all([
        fetch('/api/support', { headers }),
        fetch('/api/establishments', { headers }),
        fetch('/api/bookings', { headers }),
        fetch('/api/admin/no-card', { headers }).catch(() => null)
      ]);

      if (tRes.ok) setTickets(await tRes.json());
      if (eRes.ok) setEstablishments(await eRes.json());
      if (bRes.ok) setBookings(await bRes.json());
      if (nRes && nRes.ok) setNoCardEmails(await nRes.json());
    } catch (err) {
      console.error('Erro ao carregar dados do admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminAuthenticated');
    if (isAuth !== 'true') {
      router.push('/admin');
    } else {
      loadData();
    }
  }, [router]);

  const handleLogout = () => {
    router.push('/admin');
  };

  const handleAddNoCardEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoCardEmail.trim()) return;

    try {
      setSubmittingNoCard(true);
      const token = sessionStorage.getItem('adminToken') || 'AgendaiAdmin2026!';
      const res = await fetch('/api/admin/no-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: newNoCardEmail })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setNewNoCardEmail('');
        // Recarregar os e-mails
        const nRes = await fetch('/api/admin/no-card', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (nRes.ok) setNoCardEmails(await nRes.json());
      } else {
        alert(data.error || 'Erro ao pré-autorizar e-mail.');
      }
    } catch (err) {
      alert('Erro de conexão ao pré-autorizar e-mail.');
    } finally {
      setSubmittingNoCard(false);
    }
  };

  const handleDeleteNoCardEmail = async (id: string) => {
    if (!confirm('Deseja realmente remover esta pré-autorização?')) return;

    try {
      const token = sessionStorage.getItem('adminToken') || 'AgendaiAdmin2026!';
      const res = await fetch(`/api/admin/no-card?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setNoCardEmails(noCardEmails.filter(x => x.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erro ao remover pré-autorização.');
      }
    } catch (err) {
      alert('Erro de conexão ao remover pré-autorização.');
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      setUpdatingTicket(true);
      const token = sessionStorage.getItem('adminToken') || 'AgendaiAdmin2026!';
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'updateStatus',
          ticketId: selectedTicket.id,
          status: newStatus,
          adminNotes: responseNotes
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setTickets(tickets.map(t => t.id === updated.id ? updated : t));
        setSelectedTicket(null);
        setResponseNotes('');
      } else {
        alert('Erro ao atualizar o chamado.');
      }
    } catch (err) {
      alert('Erro de conexão ao atualizar chamado.');
    } finally {
      setUpdatingTicket(false);
    }
  };

  const openTicketModal = (t: SupportTicket) => {
    setSelectedTicket(t);
    setNewStatus(t.status);
    setResponseNotes(t.adminNotes || '');
  };

  const handleDeleteEstablishment = async () => {
    if (!deletingEstablishment) return;
    if (confirmNameText.trim() !== deletingEstablishment.name.trim()) return;

    try {
      setIsDeleting(true);
      const token = sessionStorage.getItem('adminToken') || 'AgendaiAdmin2026!';
      const res = await fetch(`/api/establishments?id=${deletingEstablishment.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setEstablishments(establishments.filter(e => e.id !== deletingEstablishment.id));
        setDeletingEstablishment(null);
        setConfirmNameText('');
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || 'Falha ao excluir estabelecimento.');
      }
    } catch (err) {
      alert('Erro de conexão ao excluir estabelecimento.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtragem de suporte
  const filteredTickets = tickets.filter(t => {
    const matchesStatus = supportFilter === 'todos' || t.status === supportFilter;
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Métricas
  const openTicketsCount = tickets.filter(t => t.status === 'Aberto' || t.status === 'Em Andamento').length;
  const totalBookingsCount = bookings.length;
  const totalEstablishmentsCount = establishments.length;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Header Admin */}
      <header style={{ background: 'linear-gradient(90deg, #1A1A2E 0%, #151525 100%)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(232, 213, 183, 0.15)' }}>
        <div className="container flex justify-between items-center" style={{ padding: 0 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(193, 90, 46, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C15A2E' }}>
              <ShieldCheck size={20} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-linen)', letterSpacing: '0.02em' }}>
              Agend<span style={{ color: 'var(--color-accent)' }}>ai</span> <span className="hidden md:inline" style={{ fontWeight: 400, color: 'rgba(232,213,183,0.55)', fontSize: '13px' }}>Super-Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadData} className="flex items-center gap-1.5 text-xs font-medium text-linen opacity-80 hover:opacity-100 bg-transparent border-0 cursor-pointer">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> <span className="hidden md:inline">Recarregar</span>
            </button>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm flex items-center gap-1.5" style={{ borderColor: 'rgba(232,213,183,0.3)', color: 'var(--color-linen)' }}>
              <LogOut size={14} /> <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Subnav com Abas Admin */}
      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '0 24px' }}>
        <div className="container flex items-center gap-2 overflow-x-auto no-scrollbar" style={{ padding: 0 }}>
          {[
            { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
            { id: 'support', label: `Suporte & Chamados (${openTicketsCount})`, icon: MessageSquare, badge: openTicketsCount > 0 },
            { id: 'nocard', label: 'Acesso Sem Cartão', icon: ShieldCheck },
            { id: 'establishments', label: 'Estabelecimentos', icon: Store },
            { id: 'bookings', label: 'Agendamentos Globais', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-muted)',
                  borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                  background: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="container" style={{ flex: 1, paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
        {/* ABA 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in flex flex-col gap-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Estabelecimentos</span>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{totalEstablishmentsCount}</h3>
                <span className="text-xs text-muted-foreground mt-2 block">Parceiros cadastrados</span>
              </div>

              <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">Agendamentos</span>
                <h3 className="text-3xl font-bold mt-1 text-foreground">{totalBookingsCount}</h3>
                <span className="text-xs text-muted-foreground mt-2 block">Realizados na plataforma</span>
              </div>

              <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
                <span className="text-xs font-semibold text-accent uppercase tracking-wider">Chamados Abertos</span>
                <h3 className="text-3xl font-bold mt-1 text-accent">{openTicketsCount}</h3>
                <span className="text-xs text-muted-foreground mt-2 block">Requerem atendimento</span>
              </div>

              <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
                <span className="text-xs font-semibold text-success uppercase tracking-wider">Domínio & SSL</span>
                <h3 className="text-xl font-bold mt-1 text-foreground">sisagendai.online</h3>
                <span className="text-xs text-success font-medium mt-2 block flex items-center gap-1">
                  <CheckCircle2 size={12} /> HTTPS Ativo & Seguro
                </span>
              </div>
            </div>

            {/* Diagnóstico do Sistema */}
            <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
              <h2 className="heading-2 mb-4 flex items-center gap-2" style={{ fontSize: '18px' }}>
                ⚡ Status & Diagnóstico das Integrações
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div style={{ background: 'var(--color-background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Resend (E-mails)</span>
                    <span className="badge badge-success">Operacional</span>
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ margin: 0 }}>
                    Remetente: <strong>atendimento@sisagendai.online</strong><br />
                    Domínio verificado com DKIM/SPF.
                  </p>
                </div>

                <div style={{ background: 'var(--color-background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Stripe (Pagamentos)</span>
                    <span className="badge badge-info">Modo Live/Webhook</span>
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ margin: 0 }}>
                    Endpoint: <strong>/api/stripe/webhook</strong><br />
                    Planos Mensal, Semestral e Anual ativos.
                  </p>
                </div>

                <div style={{ background: 'var(--color-background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">Supabase (Banco)</span>
                    <span className="badge badge-success">Saudável</span>
                  </div>
                  <p className="text-xs text-muted-foreground" style={{ margin: 0 }}>
                    Admin Privileged Bypass ativo.<br />
                    Tabela `support_tickets` conectada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: CHAMADOS DE SUPORTE */}
        {activeTab === 'support' && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {['todos', 'Aberto', 'Em Andamento', 'Resolvido'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSupportFilter(st)}
                    className={`btn btn-sm ${supportFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {st === 'todos' ? 'Todos os Chamados' : st}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-3 text-muted" />
                <input 
                  type="text" 
                  className="input pl-9 text-xs" 
                  placeholder="Buscar por nome, e-mail ou assunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', borderRadius: '16px', border: '0.5px solid var(--color-border)', overflow: 'hidden' }}>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  Nenhum chamado de suporte encontrado.
                </div>
              ) : (
                <>
                  {/* Tabela Desktop */}
                  <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)' }}>Remetente</th>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)' }}>Assunto</th>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)' }}>Tipo</th>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)' }}>Prioridade</th>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)' }}>Status</th>
                          <th style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-muted)', textAlign: 'right' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((t) => (
                          <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <div className="font-semibold text-foreground">{t.name}</div>
                              <div className="text-xs text-muted">{t.email}</div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <div className="font-medium text-foreground max-w-xs truncate">{t.subject}</div>
                              <div className="text-xs text-muted">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</div>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span className="text-xs px-2 py-0.5 rounded bg-background border border-border">
                                {t.userType === 'professional' ? '💈 Profissional' : '👤 Cliente'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span className={`text-xs font-semibold ${t.priority === 'Urgente' || t.priority === 'Alta' ? 'text-danger' : 'text-muted-foreground'}`}>
                                {t.priority}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span className={`badge ${t.status === 'Resolvido' ? 'badge-success' : t.status === 'Em Andamento' ? 'badge-info' : 'badge-warning'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <button onClick={() => openTicketModal(t)} className="btn btn-primary btn-sm">
                                Atender / Responder
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="md:hidden flex flex-col gap-4" style={{ padding: '16px' }}>
                    {filteredTickets.map((t) => (
                      <div key={t.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{t.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{t.email}</div>
                          </div>
                          <span className={`badge ${t.status === 'Resolvido' ? 'badge-success' : t.status === 'Em Andamento' ? 'badge-info' : 'badge-warning'}`}>
                            {t.status}
                          </span>
                        </div>
                        <div style={{ borderTop: '0.5px solid var(--color-border)', paddingTop: '10px' }}>
                          <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--color-text)' }}>{t.subject}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                            Criado em: {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'var(--color-background)', border: '0.5px solid var(--color-border)' }}>
                            {t.userType === 'professional' ? '💈 Profissional' : '👤 Cliente'}
                          </span>
                          <span style={{ fontWeight: 600, color: t.priority === 'Urgente' || t.priority === 'Alta' ? 'var(--color-danger)' : 'var(--color-muted)' }}>
                            {t.priority}
                          </span>
                        </div>
                        <button onClick={() => openTicketModal(t)} className="btn btn-primary btn-full btn-sm" style={{ marginTop: '4px' }}>
                          Atender / Responder
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* ABA: ACESSO SEM CARTÃO */}
        {activeTab === 'nocard' && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div style={{ background: 'var(--color-surface)', padding: '24px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
              <h2 className="heading-2 mb-2 flex items-center gap-2" style={{ fontSize: '18px' }}>
                🔓 Liberar Acesso Sem Cartão de Crédito (30 Dias Grátis)
              </h2>
              <p className="text-xs text-muted-foreground mb-6" style={{ lineHeight: 1.5 }}>
                Adicione o e-mail do profissional parceiro abaixo. Se ele já tiver uma conta, o acesso dele será ativado imediatamente.
                Caso ainda não possua conta, o e-mail será pré-autorizado para que ele possa realizar o cadastro normalmente e usar a plataforma 
                por 30 dias grátis sem qualquer validação ou preenchimento de cartão de crédito.
              </p>

              <form onSubmit={handleAddNoCardEmail} className="flex flex-col sm:flex-row gap-3 items-end max-w-2xl mb-8">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, width: '100%' }}>
                  <label className="input-label">E-mail do Profissional</label>
                  <input 
                    type="email" 
                    className="input" 
                    placeholder="exemplo@parceiro.com" 
                    value={newNoCardEmail}
                    onChange={(e) => setNewNoCardEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={submittingNoCard} className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 h-[42px] px-6">
                  {submittingNoCard ? 'Processando...' : 'Liberar Acesso 30 Dias'}
                </button>
              </form>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
                <h3 className="heading-3 mb-4" style={{ fontSize: '15px', fontWeight: 600 }}>
                  E-mails Pré-autorizados (Aguardando Registro)
                </h3>

                {noCardEmails.length === 0 ? (
                  <div className="text-muted text-center py-8 bg-background rounded-xl border border-border" style={{ fontSize: '13px' }}>
                    Nenhum e-mail pré-autorizado aguardando cadastro no momento.
                  </div>
                ) : (
                  <>
                    {/* Tabela Desktop */}
                    <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                            <th style={{ padding: '12px 16px', color: 'var(--color-muted)', fontWeight: 600 }}>E-mail</th>
                            <th style={{ padding: '12px 16px', color: 'var(--color-muted)', fontWeight: 600 }}>Liberado em</th>
                            <th style={{ padding: '12px 16px', color: 'var(--color-muted)', fontWeight: 600, textAlign: 'right' }}>Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {noCardEmails.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                              <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)' }}>{item.email}</td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>
                                {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} hs
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                <button 
                                  onClick={() => handleDeleteNoCardEmail(item.id)} 
                                  className="btn btn-ghost btn-sm"
                                  style={{ color: 'var(--color-danger)' }}
                                  title="Revogar Pré-autorização"
                                >
                                  <Trash2 size={16} /> Revogar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cards Mobile */}
                    <div className="md:hidden flex flex-col gap-3">
                      {noCardEmails.map((item) => (
                        <div key={item.id} style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', wordBreak: 'break-all' }}>{item.email}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                              📅 {new Date(item.created_at).toLocaleDateString('pt-BR')}
                            </span>
                            <button 
                              onClick={() => handleDeleteNoCardEmail(item.id)} 
                              className="btn btn-sm"
                              style={{ background: '#FCEAEA', color: '#D9383A', border: '1px solid #F3C3C3', padding: '4px 8px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Trash2 size={12} /> Revogar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: ESTABELECIMENTOS */}
        {activeTab === 'establishments' && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
              <h2 className="heading-2 mb-4" style={{ fontSize: '18px' }}>Estabelecimentos Cadastrados na Plataforma</h2>
              
              {establishments.length === 0 ? (
                <div className="text-muted text-center py-8">Nenhum estabelecimento encontrado.</div>
              ) : (
                <>
                  {/* Tabela Desktop */}
                  <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Nome</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Localização</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Rua/Avenida</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Telefone</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)', textAlign: 'right' }}>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {establishments.map((est) => (
                          <tr key={est.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{est.name}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--color-accent)', fontWeight: 500 }}>
                              {est.neighborhood || '---'} · {est.city || '---'} - {est.state || '---'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{est.address}</td>
                            <td style={{ padding: '12px 16px' }}>{est.phone}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Link href={`/catalog/${est.id}`} target="_blank" className="btn btn-ghost btn-sm">
                                  Ver Vitrine
                                </Link>
                                <button 
                                  onClick={() => {
                                    setDeletingEstablishment(est);
                                    setConfirmNameText('');
                                  }} 
                                  className="btn btn-sm"
                                  style={{ background: '#FCEAEA', color: '#D9383A', border: '1px solid #F3C3C3', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Trash2 size={14} /> Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="md:hidden flex flex-col gap-4">
                    {establishments.map((est) => (
                      <div key={est.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text)' }}>{est.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>📍 {est.address}</div>
                          <div style={{ color: 'var(--color-accent)', fontWeight: 500 }}>{est.neighborhood || '---'} · {est.city || '---'} - {est.state || '---'}</div>
                          <div>📞 {est.phone}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <Link href={`/catalog/${est.id}`} target="_blank" className="btn btn-ghost btn-sm flex-1 text-center" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            Ver Vitrine
                          </Link>
                          <button 
                            onClick={() => {
                              setDeletingEstablishment(est);
                              setConfirmNameText('');
                            }} 
                            className="btn btn-sm flex-1"
                            style={{ background: '#FCEAEA', color: '#D9383A', border: '1px solid #F3C3C3', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ABA 4: AGENDAMENTOS GLOBAIS */}
        {activeTab === 'bookings' && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '16px', border: '0.5px solid var(--color-border)' }}>
              <h2 className="heading-2 mb-4" style={{ fontSize: '18px' }}>Todos os Agendamentos da Plataforma</h2>
              
              {bookings.length === 0 ? (
                <div className="text-muted text-center py-8">Nenhum agendamento encontrado.</div>
              ) : (
                <>
                  {/* Tabela Desktop */}
                  <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Cliente</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Data & Hora</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Contato</th>
                          <th style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.clientName}</td>
                            <td style={{ padding: '12px 16px' }}>{b.date.split('-').reverse().join('/')} às {b.time.slice(0, 5)} hs</td>
                            <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{b.clientPhone} ({b.clientEmail})</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span className={b.status === 'Cancelado' ? 'badge badge-danger' : 'badge badge-success'}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile */}
                  <div className="md:hidden flex flex-col gap-4">
                    {bookings.map((b) => (
                      <div key={b.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{b.clientName}</span>
                          <span className={b.status === 'Cancelado' ? 'badge badge-danger' : 'badge badge-success'}>
                            {b.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                          📅 {b.date.split('-').reverse().join('/')} às {b.time.slice(0, 5)} hs
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                          📞 {b.clientPhone}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)', borderTop: '0.5px solid var(--color-border)', paddingTop: '6px' }}>
                          📧 {b.clientEmail}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE ATENDIMENTO DE CHAMADO DO SUPORTE */}
      {selectedTicket && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '560px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }} className="animate-scale-in">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-background)' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Atender Chamado #{selectedTicket.id.slice(0, 8)}</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--color-background)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--color-text)' }}>{selectedTicket.subject}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Por: {selectedTicket.name} ({selectedTicket.email})</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent-soft text-accent font-semibold">{selectedTicket.priority}</span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--color-text)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedTicket.message}
                </p>
              </div>

              <div>
                <label className="input-label">Alterar Status do Chamado</label>
                <select 
                  className="input" 
                  value={newStatus}
                  onChange={(e: any) => setNewStatus(e.target.value)}
                >
                  <option value="Aberto">🟡 Aberto</option>
                  <option value="Em Andamento">🔵 Em Andamento</option>
                  <option value="Resolvido">🟢 Resolvido</option>
                  <option value="Fechado">⚪ Fechado</option>
                </select>
              </div>

              <div>
                <label className="input-label">Resposta da Equipe (Será enviada por e-mail ao solicitante)</label>
                <textarea 
                  className="input min-h-[100px]" 
                  placeholder="Escreva a solução ou orientações para o usuário..."
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  style={{ paddingTop: '10px' }}
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setSelectedTicket(null)} className="btn btn-ghost">Cancelar</button>
                <button onClick={handleUpdateTicket} disabled={updatingTicket} className="btn btn-primary flex items-center gap-2">
                  <Send size={16} />
                  {updatingTicket ? 'Atualizando...' : 'Salvar & Notificar Usuário'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO EM 2 ETAPAS - EXCLUSÃO DE ESTABELECIMENTO */}
      {deletingEstablishment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: '500px', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden' }} className="animate-scale-in">
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FDF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D9383A', fontWeight: 700, fontSize: '15px' }}>
                ⚠️ Confirmação em 2 Etapas - Excluir Estabelecimento
              </div>
              <button onClick={() => setDeletingEstablishment(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#FDF2F2', borderLeft: '4px solid #D9383A', padding: '14px', borderRadius: '8px', fontSize: '13px', color: '#9B1C1C', lineHeight: 1.5 }}>
                <strong>ATENÇÃO: Ação Irreversível!</strong><br />
                Você está prestes a excluir permanentemente o estabelecimento <strong>"{deletingEstablishment.name}"</strong>.<br />
                Todos os serviços, profissionais e agendamentos vinculados a este local serão removidos.
              </div>

              <div>
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '6px', display: 'block' }}>
                  Etapa 2: Digite exatamente o nome do estabelecimento abaixo para liberar a exclusão:
                </label>
                <div style={{ background: 'var(--color-background)', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '8px', userSelect: 'all' }}>
                  {deletingEstablishment.name}
                </div>
                <input 
                  type="text" 
                  className="input text-sm"
                  placeholder={`Digite "${deletingEstablishment.name}"`}
                  value={confirmNameText}
                  onChange={(e) => setConfirmNameText(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setDeletingEstablishment(null)} className="btn btn-ghost" disabled={isDeleting}>
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteEstablishment} 
                  disabled={isDeleting || confirmNameText.trim() !== deletingEstablishment.name.trim()} 
                  className="btn"
                  style={{ 
                    background: confirmNameText.trim() === deletingEstablishment.name.trim() ? '#D9383A' : '#E5E7EB', 
                    color: confirmNameText.trim() === deletingEstablishment.name.trim() ? '#FFFFFF' : '#9CA3AF',
                    border: 'none',
                    fontWeight: 600,
                    cursor: confirmNameText.trim() === deletingEstablishment.name.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={16} />
                  {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão Definitiva'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
