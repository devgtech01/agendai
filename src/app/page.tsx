'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Star, 
  Check, 
  Calendar, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  Menu,
  X,
  Scissors,
  Award,
  ShieldCheck,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const establishments = [
  { name: "Barbearia Vintage", type: "Barbearia clássica", address: "São Paulo, SP", rating: 4.9, reviews: 124, badge: true, image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Salão Elegance", type: "Salão de beleza", address: "Rio de Janeiro, RJ", rating: 4.8, reviews: 89, badge: false, image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "The Grooming Club", type: "Barbearia premium", address: "Curitiba, PR", rating: 4.9, reviews: 156, badge: true, image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Studio Beleza Pura", type: "Salão completo", address: "Belo Horizonte, MG", rating: 4.7, reviews: 67, badge: false, image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Nail Art Studio", type: "Nails design & Manicure", address: "São Paulo, SP", rating: 4.9, reviews: 112, badge: true, image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Espaço Esmalteria Chic", type: "Esmalteria & Podologia", address: "Campinas, SP", rating: 4.8, reviews: 94, badge: false, image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Clínica Estética Vitality", type: "Estética & Bem-estar", address: "Porto Alegre, RS", rating: 4.7, reviews: 58, badge: false, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
  { name: "Design de Sobrancelhas & Cia", type: "Sobrancelhas & Maquiagem", address: "Salvador, BA", rating: 4.9, reviews: 73, badge: true, image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
];

const pros = [
  { initials: "RM", name: "Rafael Moraes", role: "Barbeiro master · 12 anos", rating: 4.9, reviews: 312, tags: ["Fade", "Barba", "Navalhado"], bg: "#C15A2E" },
  { initials: "JS", name: "Júlia Sant'Ana", role: "Cabeleireira sênior · 8 anos", rating: 4.8, reviews: 248, tags: ["Coloração", "Corte", "Escova"], bg: "#A34A22" },
  { initials: "LC", name: "Lucas Carvalho", role: "Barbeiro · 6 anos", rating: 5.0, reviews: 187, tags: ["Degradê", "Pigmentação"], bg: "#8B3D1B" },
];

const steps = ["Serviço", "Profissional", "Horário", "Confirmação"];
const slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

export default function Home() {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Hook de revelação ao rolar (Scroll Reveal)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState<'dashboard' | 'agenda'>('dashboard');
  const [selectedAgendaDayNumber, setSelectedAgendaDayNumber] = useState("09");

  // Estados para a Demonstração de Agendamento (id="booking-demo")
  const [demoStep, setDemoStep] = useState<1 | 2 | 3 | 4>(1);
  const [demoDate, setDemoDate] = useState("2026-06-12");
  const [demoTime, setDemoTime] = useState("10:30");
  const [demoClientName, setDemoClientName] = useState("");
  const [demoClientEmail, setDemoClientEmail] = useState("");
  const [demoClientPhone, setDemoClientPhone] = useState("");

  // Agenda mock data
  const agendaDays = [
    { dayName: "Ter", dayNumber: "06" },
    { dayName: "Qua", dayNumber: "07" },
    { dayName: "Qui", dayNumber: "08" },
    { dayName: "Sex", dayNumber: "09" },
    { dayName: "Sáb", dayNumber: "10" },
    { dayName: "Dom", dayNumber: "11" },
    { dayName: "Seg", dayNumber: "12" },
  ].map(d => ({ ...d, isSelected: d.dayNumber === selectedAgendaDayNumber }));

  const getDemoBookingsAndStats = (day: string) => {
    if (day === "09") {
      return {
        bookings: [
          { id: "1", time: "09:00", clientName: "Carlos Eduardo", clientPhone: "(11) 98765-4321", serviceName: "Corte Degradê", duration: 30, price: 50, status: "Concluido" },
          { id: "2", time: "10:30", clientName: "Bruno Henrique", clientPhone: "(11) 99123-4567", serviceName: "Corte + Barba", duration: 60, price: 90, status: "Confirmado" },
          { id: "3", time: "14:00", clientName: "Gabriel Souza", clientPhone: "(11) 97766-5544", serviceName: "Barba Modelada", duration: 45, price: 40, status: "Confirmado" },
          { id: "4", time: "16:30", clientName: "Felipe Neto", clientPhone: "(11) 96655-4433", serviceName: "Coloração", duration: 90, price: 120, status: "Pendente" },
        ],
        count: 4,
        earnings: "R$ 300,00"
      };
    } else if (day === "08") {
      return {
        bookings: [
          { id: "5", time: "09:30", clientName: "Maurício Silva", clientPhone: "(11) 98888-7777", serviceName: "Corte Degradê", duration: 30, price: 50, status: "Concluido" },
          { id: "6", time: "11:00", clientName: "Vinícius Souza", clientPhone: "(11) 97777-6666", serviceName: "Barba Modelada", duration: 45, price: 40, status: "Concluido" },
        ],
        count: 2,
        earnings: "R$ 90,00"
      };
    } else {
      return {
        bookings: [],
        count: 0,
        earnings: "R$ 0,00"
      };
    }
  };

  const { bookings: currentDemoBookings, count: demoAtendimentosCount, earnings: demoGanhos } = getDemoBookingsAndStats(selectedAgendaDayNumber);

  // Dashboard mock data
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthlyRevenue = [12000, 15000, 14000, 18000, 22000, 28000, 26000, 24000, 21000, 19000, 17000, 16000];
  const maxRevenue = Math.max(...monthlyRevenue, 100);
  const linePoints = monthlyRevenue.map((val, idx) => {
    const x = (idx / 11) * 380 + 40;
    const y = 160 - (val / maxRevenue) * 120;
    return { x, y, val: val / 1000 };
  });
  const pathD = linePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${linePoints[11].x} 160 L ${linePoints[0].x} 160 Z`;

  const weekdayClientCount = [8, 15, 22, 18, 25, 35, 42];
  const maxWeekdayClients = Math.max(...weekdayClientCount, 5);

  const forecastDays = [
    { label: "Hoje", dateFormatted: "08/06", count: 4, highlight: true },
    { label: "Amanhã", dateFormatted: "09/06", count: 6, highlight: false },
    { label: "Qua", dateFormatted: "10/06", count: 3, highlight: false },
    { label: "Qui", dateFormatted: "11/06", count: 7, highlight: true },
    { label: "Sex", dateFormatted: "12/06", count: 5, highlight: false },
    { label: "Sáb", dateFormatted: "13/06", count: 9, highlight: true },
    { label: "Dom", dateFormatted: "14/06", count: 2, highlight: false },
  ];

  const sortedServices = [
    { name: "Corte Degradê", count: 78, revenue: 7800 },
    { name: "Corte + Barba", count: 52, revenue: 9360 },
    { name: "Barba Modelada", count: 38, revenue: 3800 },
    { name: "Coloração", count: 25, revenue: 5000 },
    { name: "Hidratação", count: 18, revenue: 2160 },
  ];
  const totalServicesCount = sortedServices.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]" style={{ overflowX: 'hidden' }}>
      {/* Full-width Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full navbar-premium">
        <nav className="mx-auto flex max-w-7xl w-full items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl text-linen" style={{ textDecoration: 'none' }}>
            Agend<span className="text-accent">ai</span>
          </Link>
          
          <ul className="hidden items-center gap-8 md:flex absolute left-1/2 -translate-x-1/2" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <Link
                href="/profissional"
                className="text-sm font-medium nav-link-animated"
                style={{ color: "rgba(232,213,183,0.55)", textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
              >
                Para Profissionais
              </Link>
            </li>
            <li>
              <Link
                href="/profissional/planos"
                className="text-sm font-medium nav-link-animated"
                style={{ color: "rgba(232,213,183,0.55)", textDecoration: 'none', transition: 'color var(--transition-normal)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E8D5B7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,213,183,0.55)")}
              >
                Planos
              </Link>
            </li>
          </ul>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/catalog" className="btn-premium-primary rounded-lg px-5 py-2.5 text-sm font-medium" style={{ textDecoration: 'none' }}>
              Agendar
            </Link>
          </div>

          {/* Botão de Menu Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-1 bg-transparent border-0 cursor-pointer text-linen"
            style={{ outline: 'none' }}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Menu Drawer Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden border-t animate-fade-in"
            style={{ 
              background: 'linear-gradient(180deg, #1A1A2E 0%, #151525 100%)',
              borderColor: 'rgba(232, 213, 183, 0.15)',
              padding: '16px 20px 24px 20px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link
                href="/profissional"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(232, 213, 183, 0.1)',
                  color: '#E8D5B7',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(193, 90, 46, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C15A2E' }}>
                    <Scissors size={18} />
                  </div>
                  <span>Para Profissionais</span>
                </div>
                <ChevronRight size={18} style={{ opacity: 0.5 }} />
              </Link>

              <Link
                href="/profissional/planos"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(232, 213, 183, 0.1)',
                  color: '#E8D5B7',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(232, 213, 183, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E8D5B7' }}>
                    <Award size={18} />
                  </div>
                  <span>Planos e Preços</span>
                </div>
                <ChevronRight size={18} style={{ opacity: 0.5 }} />
              </Link>

              <div style={{ height: '1px', background: 'rgba(232, 213, 183, 0.12)', margin: '6px 0' }} />

              <Link 
                href="/catalog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-premium-primary"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  textAlign: 'center',
                  borderRadius: '12px',
                  padding: '14px 0',
                  fontSize: '15px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(193, 90, 46, 0.3)'
                }} 
              >
                <Calendar size={18} />
                <span>Agendar Horário</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 overflow-hidden">
        {/* Glow Shapes flutuantes e animadas */}
        <div className="glow-shape-1 drift-glow-1" style={{ top: '-10%', left: '15%' }} />
        <div className="glow-shape-2 drift-glow-2" style={{ bottom: '10%', right: '10%' }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Coluna de Texto */}
          <div className="lg:col-span-7 text-center lg:text-left relative z-10">
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight text-foreground md:text-6xl lg:text-7xl animate-hero-1" style={{ letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              A simplicidade da organização profissional que sua empresa precisa
            </h1>
            <p className="mx-auto lg:mx-0 mt-6 max-w-xl text-base sm:text-lg text-muted-foreground animate-hero-2" style={{ lineHeight: 1.6 }}>
              Centralize sua agenda, profissionais e clientes em uma plataforma feita para barbearias clássicas e salões que valorizam o seu cliente
            </p>
            <div className="mt-10 flex flex-col items-center lg:items-start justify-center lg:justify-start gap-3 sm:flex-row max-w-md mx-auto sm:max-w-none lg:mx-0 animate-hero-3">
              <Link href="/profissional" className="btn-premium-primary w-full rounded-lg px-7 py-3.5 text-base font-medium sm:w-auto text-center" style={{ textDecoration: 'none' }}>
                Começar agora
              </Link>
              <a href="#booking-demo" className="btn-premium-secondary w-full rounded-lg px-7 py-3.5 text-base font-medium sm:w-auto text-center" style={{ textDecoration: 'none' }}>
                Ver demonstração
              </a>
            </div>
          </div>

          {/* Coluna da Imagem / Mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center animate-hero-3" style={{ animationDelay: '350ms' }}>
            <div className="relative w-full max-w-[420px] lg:max-w-none aspect-[4/3] sm:aspect-[1.4] rounded-2xl border bg-surface overflow-hidden shadow-xl" style={{ borderWidth: '0.5px' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundImage: `url('https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')`, // Beautiful upscale hair salon styling scene
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }} 
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,26,46,0.2), transparent)' }} />
            </div>

            {/* Card Flutuante 1 (Mockup de Confirmação de Agenda) */}
            <div 
              className="glass animate-float hidden md:flex"
              style={{
                position: 'absolute',
                bottom: '10%',
                left: '-5%',
                padding: '14px 18px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                alignItems: 'center',
                gap: '12px',
                zIndex: 20,
                maxWidth: '260px'
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' }}>
                ✓
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', lineHeight: 1.2 }}>Agendamento Confirmado</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-muted)', lineHeight: 1.1 }}>Corte & Escova · Hoje 14:30</p>
              </div>
            </div>

            {/* Card Flutuante 2 (Profissional Favorito) */}
            <div 
              className="glass animate-float-delayed hidden md:flex"
              style={{
                position: 'absolute',
                top: '10%',
                right: '-5%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 20,
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Profissional Disponível</span>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--color-muted)', fontWeight: 500 }}>Renata Silva (Nails Design)</p>
            </div>
          </div>
        </div>
      </section>





      {/* Dashboard Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 reveal-on-scroll overflow-hidden" id="demo">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-accent tracking-wider uppercase">Para profissionais</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl md:text-5xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Tenha o controle do seu negócio na palma da mão
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground text-sm sm:text-base">
            Acompanhe clientes, receita, agendamentos e os serviços mais procurados em um painel pensado para barbearias e salões.
          </p>
        </div>

        <div className="mx-auto max-w-md mb-8 flex justify-center px-2">
          <div style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: '380px', padding: '5px', background: 'var(--color-background)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            {/* Sliding tab background indicator */}
            <div 
              style={{
                position: 'absolute',
                top: '5px',
                bottom: '5px',
                left: activeDemoTab === 'dashboard' ? '5px' : 'calc(50% + 2.5px)',
                width: 'calc(50% - 7.5px)',
                background: 'var(--color-surface)',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 0
              }}
            />
            <button
              onClick={() => setActiveDemoTab('dashboard')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                padding: '9px 12px',
                border: 'none',
                background: 'transparent',
                color: activeDemoTab === 'dashboard' ? 'var(--color-text)' : 'var(--color-muted)',
                fontWeight: activeDemoTab === 'dashboard' ? 600 : 500,
                fontSize: '13px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📊 Painel de Análises
            </button>
            <button
              onClick={() => setActiveDemoTab('agenda')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                padding: '9px 12px',
                border: 'none',
                background: 'transparent',
                color: activeDemoTab === 'agenda' ? 'var(--color-text)' : 'var(--color-muted)',
                fontWeight: activeDemoTab === 'agenda' ? 600 : 500,
                fontSize: '13px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📅 Agenda Diária
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl rounded-3xl border bg-surface p-5 sm:p-8 md:p-10 overflow-hidden w-full" style={{ borderWidth: "1px", borderColor: "var(--color-border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
          <div key={activeDemoTab} className="animate-tab-content">
            {activeDemoTab === 'dashboard' ? (
            <>
              {/* Header Dashboard */}
              <div className="mb-6 sm:mb-8">
                <h3 className="font-display text-2xl sm:text-3xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                  Dashboard
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">Acompanhe os resultados e o crescimento do seu negócio</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* --- CARDS DE RESUMO --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Clientes Atendidos */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                      <Users className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Clientes Atendidos
                      </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Hoje</span>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>8</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Esta Semana</span>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>42</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Mês</span>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>178</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Ano</span>
                        <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>1.247</p>
                      </div>
                    </div>
                  </div>

                  {/* Receita Faturada */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
                      <DollarSign className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Receita Faturada
                      </h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Hoje</span>
                        <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)', margin: 0 }}>R$ 1.240,00</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Esta Semana</span>
                        <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)', margin: 0 }}>R$ 7.580,00</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Mês</span>
                        <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)', margin: 0 }}>R$ 32.450,00</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Este Ano</span>
                        <p style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-accent)', margin: 0 }}>R$ 248.900,00</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- SEÇÃO DE GRÁFICOS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Gráfico 1 - Receita Mensal */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Evolução do Faturamento Mensal (R$ mil)
                      </h3>
                    </div>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <svg viewBox="0 0 440 180" className="svg-responsive" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', margin: '0 auto' }}>
                        <defs>
                          <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid Lines */}
                        <line x1="40" y1="40" x2="420" y2="40" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <line x1="40" y1="100" x2="420" y2="100" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <line x1="40" y1="160" x2="420" y2="160" stroke="var(--color-border)" strokeWidth="0.5" />

                        {/* Area under the line */}
                        <path d={areaD} fill="url(#gradient-area)" />

                        {/* Line Path */}
                        <path d={pathD} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />

                        {/* Dots & Tooltip labels */}
                        {linePoints.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4.5" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="2" />
                            <text x={p.x} y={p.y - 8} fontSize="9" fontWeight="600" fill="var(--color-text)" textAnchor="middle">
                              {p.val}k
                            </text>
                            {/* Eixo X labels */}
                            <text x={p.x} y="174" fontSize="10" fill="var(--color-muted)" textAnchor="middle">
                              {months[idx]}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Gráfico 2 - Fluxo Semanal */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <BarChart3 className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Fluxo de Clientes por Dia da Semana (Total)
                      </h3>
                    </div>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <svg viewBox="0 0 390 180" className="svg-responsive" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', margin: '0 auto' }}>
                        {/* Grid Lines */}
                        <line x1="30" y1="30" x2="380" y2="30" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <line x1="30" y1="95" x2="380" y2="95" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="3 3" />
                        <line x1="30" y1="160" x2="380" y2="160" stroke="var(--color-border)" strokeWidth="0.5" />

                        {/* Bars */}
                        {weekdayClientCount.map((val, idx) => {
                          const barWidth = 28;
                          const x = idx * 50 + 40;
                          const barHeight = (val / maxWeekdayClients) * 120;
                          const y = 160 - barHeight;

                          return (
                            <g key={idx}>
                              {/* Bar Background shadow */}
                              <rect x={x} y="30" width={barWidth} height="130" fill="var(--color-background)" opacity="0.1" rx="4" />
                              {/* Active bar */}
                              <rect 
                                x={x} 
                                y={y} 
                                width={barWidth} 
                                height={barHeight} 
                                fill="var(--color-primary)" 
                                rx="4" 
                              />
                              {/* Count text */}
                              <text x={x + barWidth / 2} y={y - 6} fontSize="10" fontWeight="600" fill="var(--color-text)" textAnchor="middle">
                                {val}
                              </text>
                              {/* Label */}
                              <text x={x + barWidth / 2} y="174" fontSize="10" fill="var(--color-muted)" textAnchor="middle">
                                {weekdays[idx]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* --- FORECAST & RANKING DE SERVIÇOS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Previsão para a Semana */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Calendar className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Previsão de Agendamentos (Próximos 7 Dias)
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {forecastDays.map((f, idx) => (
                        <div key={idx} className="bg-tag-bg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--color-text)' }}>{f.label}</span>{" "}
                            <span style={{ fontWeight: 400, fontSize: '12px', color: 'var(--color-muted)' }}>({f.dateFormatted})</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: f.highlight ? 600 : 400, fontSize: '12px', color: f.highlight ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                              {f.count === 0 ? 'Nenhum agendado' : `${f.count} ${f.count === 1 ? 'agendamento' : 'agendamentos'}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ranking de Serviços */}
                  <div style={{ background: 'var(--color-surface)', padding: '20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <Sparkles className="h-4 w-4 text-accent" />
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                        Serviços Mais Procurados
                      </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {sortedServices.map((srv, idx) => {
                        const percentage = Math.round((srv.count / totalServicesCount) * 100);
                        return (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                              <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                                {idx + 1}. {srv.name}
                              </span>
                              <span style={{ color: 'var(--color-muted)', fontSize: '12px' }}>
                                {srv.count} agendamentos ({percentage}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--color-background)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${percentage}%`, 
                                  height: '100%', 
                                  background: 'var(--color-accent)', 
                                  borderRadius: '99px' 
                                }} 
                              />
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: 500, marginTop: '2px' }}>
                              Faturou: R$ {srv.revenue.toFixed(2).replace('.', ',')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Header Agenda */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 w-full">
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
                    Minha Agenda
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground">Controle seus agendamentos diários</p>
                </div>
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100%' }}>
                    <label style={{ fontSize: '11px', color: 'var(--color-muted)', marginBottom: '4px', fontWeight: 500 }}>Data da Agenda</label>
                    <input 
                      type="date" 
                      className="input text-xs sm:text-sm" 
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: '12px', 
                        border: '1px solid var(--color-border)', 
                        background: 'var(--color-surface)', 
                        color: 'var(--color-text)',
                        outline: 'none',
                        width: '100%',
                        maxWidth: '100%',
                        boxSizing: 'border-box'
                      }}
                      value={`2026-06-${selectedAgendaDayNumber}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        const parts = val.split('-');
                        if (parts.length === 3) {
                          setSelectedAgendaDayNumber(parts[2]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Resumo / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                <div className="w-full" style={{ background: 'var(--color-surface)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--color-muted)', fontWeight: 500 }}>Atendimentos no Dia</p>
                  <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{demoAtendimentosCount}</h3>
                </div>
                <div className="w-full" style={{ background: 'var(--color-surface)', padding: '16px 20px', borderRadius: '18px', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--color-muted)', fontWeight: 500 }}>Ganhos do Dia (Est.)</p>
                  <h3 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{demoGanhos}</h3>
                </div>
              </div>

              {/* Ribbon de Navegação de Dias - SUAVIZADO COM BORDAS EFEITO PILL */}
              <div 
                className="flex items-center bg-background p-2 rounded-2xl border border-border mb-6 gap-2 overflow-x-auto w-full"
                style={{ 
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  scrollbarWidth: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {agendaDays.map((rd, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAgendaDayNumber(rd.dayNumber)}
                    className="flex-1 min-w-[44px] sm:min-w-[54px] flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border cursor-pointer transition-all duration-200"
                    style={{
                      borderRadius: '14px',
                      background: rd.isSelected ? 'var(--color-accent)' : 'var(--color-surface)',
                      color: rd.isSelected ? '#FFFFFF' : 'var(--color-text)',
                      border: rd.isSelected ? '1px solid transparent' : '1px solid var(--color-border)',
                      boxShadow: rd.isSelected ? '0 4px 12px rgba(193, 90, 46, 0.3)' : '0 1px 3px rgba(0,0,0,0.02)',
                      flexShrink: 0,
                      transform: rd.isSelected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', opacity: rd.isSelected ? 0.95 : 0.6, marginBottom: '2px' }}>
                      {rd.dayName}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 700 }}>
                      {rd.dayNumber}
                    </span>
                  </button>
                ))}
              </div>

              {/* Lista de Agendamentos */}
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '12px' }}>Clientes Agendados</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                {currentDemoBookings.length === 0 ? (
                  <div style={{ 
                    padding: '36px 20px', 
                    textAlign: 'center', 
                    background: 'var(--color-surface)', 
                    borderRadius: '18px', 
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-muted)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📅</div>
                    <p style={{ fontWeight: 500, fontSize: '15px', color: 'var(--color-text)', margin: 0 }}>Folga!</p>
                    <p style={{ fontSize: '13px', marginTop: '2px', margin: 0 }}>Nenhum agendamento marcado para esta data.</p>
                  </div>
                ) : (
                  currentDemoBookings.map((apt) => {
                    let leftBorderColor = 'var(--color-border)';
                    let statusBg = 'var(--color-background)';
                    let statusColor = 'var(--color-muted)';
                    
                    if (apt.status === 'Confirmado') {
                      leftBorderColor = 'var(--color-accent)';
                      statusBg = '#EAF7EC';
                      statusColor = '#2A6B31';
                    } else if (apt.status === 'Concluido') {
                      leftBorderColor = 'var(--color-success)';
                      statusBg = 'var(--color-border)';
                      statusColor = 'var(--color-muted)';
                    } else if (apt.status === 'Pendente') {
                      leftBorderColor = 'var(--color-warning)';
                      statusBg = '#FEF3E2';
                      statusColor = '#8B5A0A';
                    }

                    return (
                      <div 
                        key={apt.id} 
                        style={{ 
                          background: 'var(--color-surface)', 
                          borderRadius: '16px', 
                          border: '1px solid var(--color-border)', 
                          borderLeft: `4px solid ${leftBorderColor}`,
                          padding: '14px 16px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full"
                      >
                        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                            {apt.time}
                          </div>
                          <span 
                            className="sm:hidden"
                            style={{ 
                              background: statusBg,
                              color: statusColor,
                              padding: '3px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '20px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {apt.status}
                          </span>
                        </div>

                        <div className="flex-1 flex flex-col gap-1 min-w-0 w-full">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {apt.clientName}
                            </span>
                            <span style={{ fontSize: '12px', color: '#25D366', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              💬 {apt.clientPhone}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>{apt.serviceName}</span>
                            <span>•</span>
                            <span>⏱ {apt.duration} min</span>
                            <span>•</span>
                            <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>R$ {apt.price.toFixed(2).replace('.', ',')}</span>
                          </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-3">
                          <span 
                            style={{ 
                              background: statusBg,
                              color: statusColor,
                              padding: '4px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '20px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
          </div>
        </div>
      </section>

      {/* Booking Demo Section */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 reveal-on-scroll" id="booking-demo">
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-accent tracking-wider uppercase">Demonstração</p>
          <h2 className="font-display mt-2 text-2xl sm:text-3xl md:text-5xl text-foreground" style={{ letterSpacing: "-0.02em" }}>
            Agendar em três toques
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-sm sm:text-base">
            Uma experiência fluida, sem fricção e extremamente veloz pensada para o seu cliente final.
          </p>
        </div>

        <div style={{ 
          background: 'var(--color-surface)', 
          width: '100%', 
          maxWidth: '600px', 
          padding: 'var(--space-6)', 
          borderRadius: 'var(--radius-lg)', 
          border: '0.5px solid var(--color-border)', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          margin: '0 auto',
          overflow: 'hidden'
        }}>
          {demoStep < 4 && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: demoStep >= 1 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
                <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: demoStep >= 2 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
                <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: demoStep >= 3 ? 'var(--color-primary)' : 'var(--color-border)' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-muted)' }}>
                <span style={{ color: demoStep >= 1 ? 'var(--color-accent)' : '', fontWeight: demoStep >= 1 ? 500 : 400 }}>Data & Hora</span>
                <span style={{ color: demoStep >= 2 ? 'var(--color-accent)' : '', fontWeight: demoStep >= 2 ? 500 : 400 }}>Seus Dados</span>
                <span style={{ color: demoStep >= 3 ? 'var(--color-accent)' : '', fontWeight: demoStep >= 3 ? 500 : 400 }}>Confirmação</span>
              </div>
            </div>
          )}

          <div key={demoStep} className="animate-step-transition">

          {/* ETAPA 1: SELEÇÃO DE DATA E HORA */}
          {demoStep === 1 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div>
                <span className="badge badge-neutral" style={{ marginBottom: '8px' }}>GBR Barber</span>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px 0' }}>Corte Degradê</h2>
                <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Selecione o melhor dia e horário para o seu agendamento.</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>Data</label>
                <input 
                  type="date" 
                  className="input"
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={demoDate}
                  onChange={(e) => {
                    setDemoDate(e.target.value);
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                  Horários Disponíveis
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[
                    { time: '08:00', isBooked: false },
                    { time: '08:30', isBooked: false },
                    { time: '09:00', isBooked: false },
                    { time: '09:30', isBooked: false },
                    { time: '10:00', isBooked: false },
                    { time: '10:30', isBooked: false },
                    { time: '11:00', isBooked: false },
                    { time: '13:00', isBooked: false },
                    { time: '13:30', isBooked: true },
                    { time: '14:00', isBooked: false },
                    { time: '14:30', isBooked: false },
                    { time: '15:00', isBooked: false },
                    { time: '15:30', isBooked: false },
                    { time: '16:00', isBooked: false },
                    { time: '16:30', isBooked: false },
                    { time: '17:00', isBooked: false },
                    { time: '17:30', isBooked: false },
                    { time: '18:00', isBooked: false }
                  ].map(({ time, isBooked }) => {
                    const isSelected = demoTime === time;
                    return (
                      <button
                        key={time}
                        disabled={isBooked}
                        onClick={() => setDemoTime(time)}
                        style={{
                          padding: '10px 0',
                          textAlign: 'center',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: isSelected ? '1.5px solid var(--color-primary)' : '0.5px solid var(--color-border)',
                          background: isSelected 
                            ? 'var(--color-primary)' 
                            : isBooked 
                              ? '#EDEAE5' 
                              : 'var(--color-surface)',
                          color: isSelected 
                            ? 'var(--color-linen)' 
                            : isBooked 
                              ? 'var(--color-muted)' 
                              : 'var(--color-text)',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          opacity: isBooked ? 0.5 : 1,
                          transition: 'all var(--transition-normal)',
                          position: 'relative'
                        }}
                      >
                        {time}
                        {isBooked && (
                          <span style={{ display: 'block', fontSize: '9px', fontWeight: 400, color: 'var(--color-danger)' }}>
                            Ocupado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                className="btn btn-primary btn-full" 
                style={{ marginTop: 'var(--space-4)' }}
                disabled={!demoDate || !demoTime}
                onClick={() => setDemoStep(2)}
              >
                Continuar
              </button>
            </div>
          )}

          {/* ETAPA 2: DADOS DO CLIENTE */}
          {demoStep === 2 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px 0' }}>Seus Dados de Contato</h2>
                <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>Precisamos de algumas informações para confirmar sua reserva.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>Nome Completo</label>
                <input 
                  type="text" 
                  className="input"
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={demoClientName}
                  placeholder="Ex: João da Silva"
                  onChange={(e) => setDemoClientName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>E-mail</label>
                <input 
                  type="email" 
                  className="input"
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={demoClientEmail}
                  placeholder="Ex: joao@email.com"
                  onChange={(e) => setDemoClientEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="input-label" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  className="input"
                  style={{ 
                    padding: '10px 12px', 
                    borderRadius: '8px', 
                    border: '1px solid var(--color-border)', 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  value={demoClientPhone}
                  placeholder="Ex: (11) 99999-9999"
                  onChange={(e) => setDemoClientPhone(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-4" style={{ marginTop: 'var(--space-4)' }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDemoStep(1)}>Voltar</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 2 }}
                  disabled={!demoClientName || !demoClientEmail || !demoClientPhone}
                  onClick={() => setDemoStep(3)}
                >
                  Revisar Detalhes
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 3: REVISAR E CONFIRMAR */}
          {demoStep === 3 && (
            <div className="animate-fade-in flex flex-col gap-6">
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px 0' }}>Revisar e Confirmar</h2>
              
              <div style={{ background: '#F7F5F2', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Estabelecimento</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>GBR Barber</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Serviço</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>Corte Degradê (45 min)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Data</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>{demoDate.split('-').reverse().join('/')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Horário</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>{demoTime} hs</span>
                </div>
                
                <hr style={{ borderTop: '0.5px solid var(--color-border)', margin: '4px 0' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>Cliente</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>{demoClientName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '13px' }}>WhatsApp</span>
                  <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--color-text)' }}>{demoClientPhone}</span>
                </div>

                <hr style={{ borderTop: '0.5px solid var(--color-border)', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>Total</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-accent)', fontSize: '18px' }}>R$ 25,00</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setDemoStep(2)}>Voltar</button>
                <button className="btn btn-dark" style={{ flex: 2 }} onClick={() => setDemoStep(4)}>
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}

          {/* ETAPA 4: SUCESSO */}
          {demoStep === 4 && (
            <div className="animate-fade-in flex flex-col items-center text-center gap-6" style={{ padding: 'var(--space-6) 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-success)', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' }}>
                ✓
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 8px 0' }}>Agendamento Confirmado!</h2>
                <p className="text-muted" style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
                  Parabéns, <strong>{demoClientName}</strong>! Seu horário para o serviço <strong>Corte Degradê</strong> na <strong>GBR Barber</strong> foi reservado para o dia <strong>{demoDate.split('-').reverse().join('/')}</strong> às <strong>{demoTime}</strong>.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => setDemoStep(1)} style={{ marginTop: '16px' }}>
                Reiniciar Demonstração
              </button>
            </div>
          )}
          </div>
        </div>
      </section>

      {/* Seção Banner Teste Grátis UI/UX Reformulada */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 reveal-on-scroll overflow-hidden" id="services">
        <div 
          className="relative rounded-3xl border bg-surface p-6 sm:p-12 md:p-16 flex flex-col items-center text-center overflow-hidden shadow-xl"
          style={{ 
            borderColor: 'var(--color-border)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.04)',
            background: 'linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%)'
          }}
        >
          {/* Efeitos sutis de iluminação de fundo */}
          <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'var(--color-accent)', opacity: 0.08, filter: 'blur(90px)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Badge Topo */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-accent mb-6 border" style={{ background: 'var(--color-accent-soft)', borderColor: 'rgba(193, 90, 46, 0.2)' }}>
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>30 DIAS GRÁTIS DE TESTE</span>
          </div>

          {/* Título Principal Tipográfico */}
          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl text-foreground max-w-3xl" style={{ letterSpacing: "-0.02em", lineHeight: 1.25 }}>
            Gostou da nossa plataforma? Experimente por <span className="text-accent italic font-serif">1 mês grátis</span> e cancele quando quiser.
          </h2>

          {/* Descrição em tom de voz persuasivo */}
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl" style={{ lineHeight: 1.6 }}>
            Sem letras miúdas ou complicações. Crie a conta do seu estabelecimento, configure sua equipe e ofereça agendamentos online 24h para seus clientes desde o primeiro minuto.
          </p>

          {/* Grid de Diferenciais UI/UX (3 Cards Benefícios) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 w-full max-w-3xl">
            <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border bg-surface text-xs font-medium text-foreground shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-[11px]">✓</span>
              <span>Sem cartão no cadastro</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border bg-surface text-xs font-medium text-foreground shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-[11px]">✓</span>
              <span>Configuração em 2 minutos</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border bg-surface text-xs font-medium text-foreground shadow-sm" style={{ borderColor: 'var(--color-border)' }}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent font-bold text-[11px]">✓</span>
              <span>Cancele a qualquer momento</span>
            </div>
          </div>

          {/* Botões de Ação Principais */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link 
              href="/profissional/register" 
              className="btn-premium-primary px-8 py-4 text-sm font-semibold rounded-2xl text-center shadow-lg transition-all duration-200" 
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <span>Começar Teste Grátis de 30 Dias</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/profissional/planos" 
              className="btn btn-ghost px-8 py-4 text-sm font-semibold rounded-2xl text-center transition-all duration-200" 
              style={{ 
                textDecoration: 'none', 
                color: 'var(--color-text)', 
                border: '1px solid var(--color-border)', 
                background: 'var(--color-surface)',
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              Conhecer Todos os Planos
            </Link>
          </div>

          {/* Micro-Texto de Confiança */}
          <p className="mt-5 text-xs text-muted-foreground">
            Acesso imediato a todos os recursos premium · Suporte via WhatsApp incluso
          </p>
        </div>
      </section>

      {/* Footer Simplificado */}
      <footer className="bg-primary text-linen mt-auto reveal-on-scroll">
        <div className="mx-auto max-w-7xl px-4 py-12">
          {/* Logo e Descrição */}
          <div className="space-y-4 max-w-md">
            <Link href="/" className="font-display text-2xl text-linen block" style={{ textDecoration: 'none' }}>
              Agend<span className="text-accent">ai</span>
            </Link>
            <p className="text-xs text-linen/50" style={{ lineHeight: 1.6 }}>
              A solução definitiva para o gerenciamento de agendas e atração de clientes para salões e barbearias de alto padrão.
            </p>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t pt-8 mt-8 sm:flex-row" style={{ borderColor: 'rgba(232, 213, 183, 0.1)' }}>
            <p className="text-xs text-linen/30" style={{ margin: 0 }}>© 2026 Agendai. Desenvolvido com ofício para salões e barbearias premium.</p>
            <div className="flex gap-4 text-xs text-linen/50">
              <Link href="/suporte" style={{ color: 'inherit', textDecoration: 'none' }}>Suporte</Link>
              <Link href="/termos" style={{ color: 'inherit', textDecoration: 'none' }}>Termos</Link>
              <Link href="/privacidade" style={{ color: 'inherit', textDecoration: 'none' }}>Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

