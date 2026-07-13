'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getEstablishmentByOwnerId, updateEstablishment, uploadImage, Establishment, addEstablishment } from '@/lib/db';
import ProfissionalHeader from '@/components/ProfissionalHeader';

export default function ProfissionalSettingsPage() {
  const router = useRouter();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('19:00');
  const [lunchStart, setLunchStart] = useState('12:00');
  const [lunchEnd, setLunchEnd] = useState('13:00');
  const [sundayActive, setSundayActive] = useState(false);
  const [sundayClosingTime, setSundayClosingTime] = useState('12:00');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [category, setCategory] = useState('Barbearia');
  const [customCategory, setCustomCategory] = useState('');
  const [wifi, setWifi] = useState(false);
  const [ar, setAr] = useState(false);
  const [bebida, setBebida] = useState(false);
  const [jogos, setJogos] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab & Billing states
  const [activeTab, setActiveTab] = useState<'info' | 'billing'>('info');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPlan, setUserPlan] = useState('Nenhum');
  const [userPlanStatus, setUserPlanStatus] = useState('inactive');
  const [userTrialUntil, setUserTrialUntil] = useState<string | null>(null);
  const [userCustomerId, setUserCustomerId] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);

  // Cropper states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
  };

  const handleConfirmCrop = async () => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    const cropX = (containerRect.left - imgRect.left) * scaleX;
    const cropY = (containerRect.top - imgRect.top) * scaleY;
    const cropW = containerRect.width * scaleX;
    const cropH = containerRect.height * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 800, 450);

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropW,
        cropH,
        0,
        0,
        800,
        450
      );

      setIsSubmitting(true);
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'capa.jpg', { type: 'image/jpeg' });
          const url = await uploadImage(file, 'uploads');
          if (url) {
            setImageUrl(url);
            setSuccessMsg('Imagem recortada e enviada com sucesso! Lembre-se de salvar as alterações.');
          } else {
            setErrorMsg('Erro ao fazer upload da imagem. Verifique se o bucket "uploads" existe no Supabase e tem permissões públicas.');
          }
        }
        setIsSubmitting(false);
      }, 'image/jpeg', 0.85);
    }

    setIsCropModalOpen(false);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/profissional');
          return;
        }

        // Buscar status real-time do plano para contornar o cache do JWT
        const statusRes = await fetch(`/api/auth/status?userId=${user.id}`);
        const statusData = await statusRes.json();
        
        const isPlanActive = statusRes.ok && statusData.planStatus === 'active';
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        const isBlocked = params.get('blocked') === 'true';

        if (isBlocked) {
          setShowBlockedModal(true);
          const newUrl = window.location.pathname + '?tab=billing';
          window.history.replaceState({ path: newUrl }, '', newUrl);
        }

        if (tab === 'billing' || !isPlanActive) {
          setActiveTab('billing');
        } else {
          setActiveTab('info');
        }

        setUserId(user.id);
        setUserEmail(user.email || '');
        setUserPlan(statusData.plan || 'Nenhum');
        setUserPlanStatus(statusData.planStatus || 'inactive');
        setUserTrialUntil(user.user_metadata?.trial_until || null);
        setUserCustomerId(user.user_metadata?.stripe_customer_id || null);
        setCancelAtPeriodEnd(statusData.cancelAtPeriodEnd === true);

        let est = await getEstablishmentByOwnerId(user.id);
        if (!est) {
          const fallbackEst = {
            name: 'Meu Estabelecimento',
            description: '',
            address: '',
            phone: user.user_metadata?.phone || '71981032968',
            imageUrl: '',
            ownerId: user.id
          };
          const created = await addEstablishment(fallbackEst);
          if (created) {
            est = created;
          } else {
            console.error('Falha ao auto-inicializar estabelecimento');
            return;
          }
        }
        setEstablishment(est);
        setName(est.name);
        setDescription(est.description || '');
        setAddress(est.address || '');
        setPhone(est.phone || '');
        setImageUrl(est.imageUrl || '');
        setOpeningTime(est.openingTime ? est.openingTime.slice(0, 5) : '08:00');
        setClosingTime(est.closingTime ? est.closingTime.slice(0, 5) : '19:00');
        setLunchStart(est.lunchStart ? est.lunchStart.slice(0, 5) : '12:00');
        setLunchEnd(est.lunchEnd ? est.lunchEnd.slice(0, 5) : '13:00');
        setState(est.state || '');
        setCity(est.city || '');
        setNeighborhood(est.neighborhood || '');
        
        const estCategory = est.category || 'Barbearia';
        const isPredefined = ['Barbearia', 'Salão de Beleza', 'Clínica de Estética'].includes(estCategory);
        setCategory(isPredefined ? estCategory : 'Outros');
        setCustomCategory(isPredefined ? '' : estCategory);

        const ams = (est.amenities || '').split(',');
        setWifi(ams.includes('wifi'));
        setAr(ams.includes('ar'));
        setBebida(ams.includes('bebida'));
        setJogos(ams.includes('jogos'));

        // Domingo funcionamento
        const hasSunday = ams.includes('sunday_active');
        setSundayActive(hasSunday);
        const closingTimeField = ams.find(a => a.startsWith('sunday_closing_'));
        if (closingTimeField) {
          setSundayClosingTime(closingTimeField.replace('sunday_closing_', ''));
        } else {
          setSundayClosingTime('12:00');
        }
      } catch (err) {
        console.error('Erro ao carregar configurações do estabelecimento:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [router]);

  const BRAZIL_STATES = [
    { uf: 'AC', name: 'Acre' },
    { uf: 'AL', name: 'Alagoas' },
    { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' },
    { uf: 'BA', name: 'Bahia' },
    { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' },
    { uf: 'ES', name: 'Espírito Santo' },
    { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' },
    { uf: 'MT', name: 'Mato Grosso' },
    { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' },
    { uf: 'PA', name: 'Pará' },
    { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' },
    { uf: 'PE', name: 'Pernambuco' },
    { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' },
    { uf: 'RN', name: 'Rio Grande do Norte' },
    { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' },
    { uf: 'RR', name: 'Roraima' },
    { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' },
    { uf: 'SE', name: 'Sergipe' },
    { uf: 'TO', name: 'Tocantins' }
  ];

  const normalizeState = (val: string) => {
    const clean = val.trim().toUpperCase();
    if (clean.length === 2) return clean;
    const found = BRAZIL_STATES.find(s => s.name.toUpperCase() === clean);
    return found ? found.uf : clean;
  };

  useEffect(() => {
    if (!state || state.length !== 2) {
      setCitySuggestions([]);
      return;
    }
    async function fetchCities() {
      try {
        const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.toUpperCase()}/municipios`);
        if (res.ok) {
          const data = await res.json();
          const names = data.map((item: any) => item.nome);
          setCitySuggestions(names);
        }
      } catch (err) {
        console.error('Erro ao buscar cidades do IBGE:', err);
      }
    }
    fetchCities();
  }, [state]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/profissional');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!establishment) return;

    setIsSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    const amsList: string[] = [];
    if (wifi) amsList.push('wifi');
    if (ar) amsList.push('ar');
    if (bebida) amsList.push('bebida');
    if (jogos) amsList.push('jogos');
    if (sundayActive) {
      amsList.push('sunday_active');
      amsList.push(`sunday_closing_${sundayClosingTime}`);
    }
    const amenitiesString = amsList.join(',');

    const updated = await updateEstablishment(establishment.id, {
      name,
      description,
      address,
      phone,
      imageUrl,
      openingTime,
      closingTime,
      lunchStart,
      lunchEnd,
      state,
      city,
      neighborhood,
      category: category === 'Outros' ? customCategory : category,
      amenities: amenitiesString,
    });

    if (updated) {
      setEstablishment(updated);
      setSuccessMsg('Dados do estabelecimento atualizados com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('Erro ao atualizar dados. Tente novamente.');
    }
    setIsSubmitting(false);
  };

  const handleSimulatedCancel = async () => {
    setPortalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        data: {
          plan: 'nenhum',
          plan_status: 'inactive',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          trial_until: null,
        }
      });

      if (!updateError) {
        setUserPlanStatus('inactive');
        setUserPlan('Nenhum');
        setSuccessMsg('Assinatura simulada cancelada com sucesso!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(updateError.message || 'Erro ao simular cancelamento.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro de conexão ao simular cancelamento.');
    }
    setPortalLoading(false);
  };

  const handleManageBilling = async () => {
    if (!userCustomerId) return;
    setPortalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userCustomerId })
      });
      const data = await response.json();
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || 'Erro ao abrir portal de faturamento.');
      }
    } catch (err) {
      setErrorMsg('Erro de rede ao acessar portal.');
    }
    setPortalLoading(false);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Tem certeza de que deseja programar o cancelamento de sua assinatura? O seu acesso permanecerá ativo até o final do período pago/teste atual.')) {
      return;
    }
    setPortalLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch('/api/stripe/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMsg('Sua assinatura foi programada para cancelamento com sucesso. Seu acesso continuará ativo até o vencimento.');
        setCancelAtPeriodEnd(true);
        setTimeout(() => {
          setSuccessMsg('');
          window.location.reload();
        }, 3000);
      } else {
        setErrorMsg(data.error || 'Erro ao processar cancelamento da assinatura.');
      }
    } catch (err) {
      setErrorMsg('Erro de rede ao solicitar cancelamento.');
    }
    setPortalLoading(false);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">Carregando dados...</div>;
  }

  if (!establishment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <h2 className="heading-2">Você precisa criar seu estabelecimento primeiro.</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <ProfissionalHeader establishmentName={establishment.name} />

      <main className="container flex-1" style={{ padding: 'var(--space-8) var(--space-4) calc(80px + var(--space-8)) var(--space-4)', maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ background: 'var(--color-surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '0.5px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h1 className="heading-1" style={{ marginBottom: 'var(--space-2)' }}>Meu Estabelecimento</h1>
          <p className="text-muted" style={{ fontSize: '14px', marginBottom: 'var(--space-4)' }}>
            Gerencie as informações públicas e faturamento do seu negócio.
          </p>

          {/* Abas */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', paddingBottom: '8px' }}>
            <button
              type="button"
              onClick={() => {
                if (userPlanStatus === 'active') {
                  setActiveTab('info');
                } else {
                  setErrorMsg('Assine um plano para liberar o acesso total ao painel e configurações.');
                  setTimeout(() => setErrorMsg(''), 4000);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '14px',
                fontWeight: activeTab === 'info' ? 600 : 400,
                color: activeTab === 'info' ? 'var(--color-accent)' : 'var(--color-muted)',
                cursor: userPlanStatus === 'active' ? 'pointer' : 'not-allowed',
                padding: '4px 12px',
                borderBottom: activeTab === 'info' ? '2px solid var(--color-accent)' : 'none',
                marginBottom: '-10px',
                opacity: userPlanStatus === 'active' ? 1 : 0.5
              }}
            >
              Informações Gerais
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '14px',
                fontWeight: activeTab === 'billing' ? 600 : 400,
                color: activeTab === 'billing' ? 'var(--color-accent)' : 'var(--color-muted)',
                cursor: 'pointer',
                padding: '4px 12px',
                borderBottom: activeTab === 'billing' ? '2px solid var(--color-accent)' : 'none',
                marginBottom: '-10px'
              }}
            >
              Assinatura & Faturamento
            </button>
          </div>

          {activeTab === 'info' ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="input-label">Nome do Estabelecimento</label>
                <input 
                  type="text" 
                  className="input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="input-label">Categoria do Estabelecimento</label>
                <select 
                  className="input" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Barbearia">Barbearia</option>
                  <option value="Salão de Beleza">Salão de Beleza</option>
                  <option value="Clínica de Estética">Clínica de Estética</option>
                  <option value="Outros">Outros (Especifique abaixo)</option>
                </select>
              </div>

              {category === 'Outros' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Especifique a Categoria</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ex: Estúdio de Tattoo, Petshop, Spa"
                    required={category === 'Outros'}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="input-label">Telefone (WhatsApp)</label>
                <input 
                  type="tel" 
                  className="input" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="input-label">Rua/Avenida</label>
                <input 
                  type="text" 
                  className="input" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123"
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '100px 1.2fr 1.2fr', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Estado (UF)</label>
                  <input 
                    type="text" 
                    list="uf-suggestions"
                    className="input" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onBlur={(e) => setState(normalizeState(e.target.value))}
                    placeholder="Ex: BA"
                    required 
                    maxLength={25}
                  />
                  <datalist id="uf-suggestions">
                    {BRAZIL_STATES.map(s => (
                      <option key={s.uf} value={s.uf}>{s.name}</option>
                    ))}
                  </datalist>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Cidade</label>
                  <input 
                    type="text" 
                    list="city-suggestions"
                    className="input" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cidade"
                    required 
                    disabled={!state || state.length !== 2}
                  />
                  <datalist id="city-suggestions">
                    {citySuggestions.map(cityName => (
                      <option key={cityName} value={cityName} />
                    ))}
                  </datalist>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Bairro</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Bairro"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="input-label">Descrição</label>
                <textarea 
                  className="input" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                  placeholder="Fale um pouco sobre o seu estabelecimento e especialidades..."
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="input-label">Comodidades do Estabelecimento</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', padding: '12px', background: 'var(--color-background)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--color-border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={wifi} 
                      onChange={(e) => setWifi(e.target.checked)} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-accent)' }} 
                    />
                    🛜 Wi-Fi grátis
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={ar} 
                      onChange={(e) => setAr(e.target.checked)} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-accent)' }} 
                    />
                    ❄️ Ar Condicionado
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={bebida} 
                      onChange={(e) => setBebida(e.target.checked)} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-accent)' }} 
                    />
                    🥤 Bebida disponível
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', color: 'var(--color-text)' }}>
                    <input 
                      type="checkbox" 
                      checked={jogos} 
                      onChange={(e) => setJogos(e.target.checked)} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--color-accent)' }} 
                    />
                    🎮 Área de Jogos
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Horário de Abertura</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Horário de Fechamento</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {/* Configurações de Domingo */}
              <div style={{ 
                background: 'rgba(232, 213, 183, 0.05)', 
                border: '1px dashed rgba(232, 213, 183, 0.25)', 
                padding: 'var(--space-4)', 
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label className="input-label" style={{ margin: 0, fontWeight: 600, color: 'var(--color-text)' }}>Funcionamento aos Domingos</label>
                    <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Liberar agendamentos para clientes aos domingos</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={sundayActive}
                    onChange={(e) => setSundayActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                  />
                </div>

                {sundayActive && (
                  <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderTop: '0.5px solid rgba(232, 213, 183, 0.15)', paddingTop: '10px' }}>
                    <label className="input-label">Até que horas funciona aos domingos?</label>
                    <input 
                      type="time" 
                      className="input" 
                      value={sundayClosingTime}
                      onChange={(e) => setSundayClosingTime(e.target.value)}
                      required 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Almoço (Início)</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={lunchStart}
                    onChange={(e) => setLunchStart(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="input-label">Almoço (Fim)</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={lunchEnd}
                    onChange={(e) => setLunchEnd(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label className="input-label">Foto de Capa do Estabelecimento</label>
                
                <div style={{ 
                  position: 'relative', 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: imageUrl ? '1px solid var(--color-border)' : '1.5px dashed var(--color-border)', 
                  backgroundColor: 'var(--color-background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-muted)',
                  fontSize: '13px',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Preview da Capa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '32px' }}>📷</span>
                      <span>Nenhuma foto cadastrada. Envie uma foto abaixo.</span>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label className="btn btn-secondary btn-full" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '42px', padding: '0 16px', margin: 0 }}>
                    Selecionar Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>

              {successMsg && (
                <div style={{ background: '#EAF7EC', color: '#2A6B31', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid #B8E4BC' }}>
                  ✓ {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{ background: '#FCEAEA', color: '#8B2222', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid #F3C3C3' }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full press" disabled={isSubmitting} style={{ marginTop: 'var(--space-2)' }}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div style={{ background: 'var(--color-background)', padding: '20px', borderRadius: '12px', border: '0.5px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>Plano Atual</h3>
                    <p className="text-muted" style={{ fontSize: '13px', margin: 0, textTransform: 'capitalize' }}>
                      {userPlan === 'Nenhum' ? 'Sem plano contratado' : `Plano ${userPlan}`}
                    </p>
                  </div>
                  <span className="badge" style={{
                    backgroundColor: userPlanStatus === 'active' ? '#EAF7EC' : '#FCEAEA',
                    color: userPlanStatus === 'active' ? '#2A6B31' : '#8B2222',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}>
                    {userPlanStatus === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {userPlanStatus === 'active' && userTrialUntil && (
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0, borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
                    {cancelAtPeriodEnd ? (
                      <>💡 Sua assinatura expira em <strong>{new Date(userTrialUntil).toLocaleDateString('pt-BR')}</strong>.</>
                    ) : (
                      <>💡 Próxima renovação em <strong>{new Date(userTrialUntil).toLocaleDateString('pt-BR')}</strong>.</>
                    )}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>Ações de Faturamento</h3>
                
                {userPlanStatus === 'active' ? (
                  cancelAtPeriodEnd ? (
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                        Sua assinatura já está programada para cancelamento. Se mudar de ideia, você pode escolher ou renovar seu plano a qualquer momento.
                      </p>
                      <Link
                        href="/profissional/alterar-plano"
                        className="btn btn-primary btn-full text-center press"
                        style={{ padding: '12px', textDecoration: 'none', display: 'block' }}
                      >
                        Assinar Novamente / Escolher Plano
                      </Link>
                    </div>
                  ) : userCustomerId && userCustomerId !== 'cus_simulado_123' ? (
                    <button
                      type="button"
                      onClick={handleCancelSubscription}
                      className="btn btn-secondary btn-full press"
                      disabled={portalLoading}
                      style={{ padding: '12px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', cursor: 'pointer', background: 'transparent' }}
                    >
                      {portalLoading ? 'Cancelando...' : 'Cancelar Assinatura Agora'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={handleSimulatedCancel}
                        className="btn btn-secondary press"
                        disabled={portalLoading}
                        style={{ flex: 1, padding: '12px', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', cursor: 'pointer' }}
                      >
                        {portalLoading ? 'Cancelando...' : 'Cancelar Assinatura (Simulado)'}
                      </button>
                      <Link
                        href="/profissional/alterar-plano"
                        className="btn btn-primary text-center press"
                        style={{ flex: 1, padding: '12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        Alterar Plano
                      </Link>
                    </div>
                  )
                ) : (
                  <div>
                    <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                      Assine um plano para ativar o recebimento de agendamentos no seu catálogo e liberar o acesso total ao painel profissional.
                    </p>
                    <Link
                      href="/profissional/alterar-plano"
                      className="btn btn-primary btn-full text-center press"
                      style={{ padding: '12px', textDecoration: 'none', display: 'block' }}
                    >
                      Escolher um Plano
                    </Link>
                  </div>
                )}
              </div>

              {successMsg && (
                <div style={{ background: '#EAF7EC', color: '#2A6B31', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid #B8E4BC' }}>
                  ✓ {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{ background: '#FCEAEA', color: '#8B2222', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '14px', border: '1px solid #F3C3C3' }}>
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Recorte de Imagem */}
      {isCropModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '540px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>Ajustar Foto de Capa</h3>
              <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                Arraste a imagem para posicionar e use a barra abaixo para ajustar o zoom.
              </p>
            </div>

            <div 
              ref={containerRef}
              style={{
                width: '100%',
                aspectRatio: '16/9',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#1E1B18',
                borderRadius: '12px',
                cursor: isDragging ? 'grabbing' : 'grab',
                border: '1px dashed var(--color-border)'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                ref={imageRef}
                src={imageSrc}
                alt="Ajustar Capa"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${zoom})`,
                  transformOrigin: 'center center',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-muted)' }}>
                <span>Zoom</span>
                <span style={{ fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.01" 
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, height: '42px' }} 
                onClick={() => setIsCropModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ flex: 2, height: '42px' }} 
                onClick={handleConfirmCrop}
              >
                Recortar & Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlockedModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FCEAEA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B2222',
              fontSize: '24px'
            }}>
              🔒
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
                Acesso Restrito
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-muted)', margin: 0, lineHeight: '1.5' }}>
                Acesso não permitido, por favor escolha um de nossos planos e tenha acesso completo a nossa plataforma!
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-full press"
              style={{ padding: '12px' }}
              onClick={() => setShowBlockedModal(false)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
