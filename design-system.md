# Design System — SaaS de Agendamento de Serviços

> Baseado na análise de **Booksy**, **Fresha** e **Vagaro**. Identidade visual que une sofisticação de barbearia clássica com calor artesanal — adequada para barbearias, salões de beleza e serviços similares.

---

## Sumário

- [Paleta de Cores](#paleta-de-cores)
- [Tipografia](#tipografia)
- [Espaçamento](#espaçamento)
- [Border Radius](#border-radius)
- [Elevação e Sombras](#elevação-e-sombras)
- [Componentes — Botões](#componentes--botões)
- [Componentes — Badges e Status](#componentes--badges-e-status)
- [Componentes — Inputs](#componentes--inputs)
- [Componentes — Cards](#componentes--cards)
- [Componentes — Navegação](#componentes--navegação)
- [Componentes — Fluxo de Agendamento](#componentes--fluxo-de-agendamento)
- [Motion e Feedback](#motion-e-feedback)
- [Diretrizes de Uso](#diretrizes-de-uso)
- [Variáveis CSS (Tokens)](#variáveis-css-tokens)

---

## Paleta de Cores

| Token | Nome | Hex | Uso |
|---|---|---|---|
| `--color-primary` | Noite Profunda | `#1A1A2E` | Navbar · Headers de card · Botão confirmar |
| `--color-accent` | Terracota | `#C15A2E` | CTA principal · Preços · Rating · Ações |
| `--color-linen` | Linho | `#E8D5B7` | Texto sobre fundos escuros |
| `--color-background` | Off-White | `#F7F5F2` | Background geral da aplicação |
| `--color-text` | Carvão | `#2E2B25` | Texto de corpo principal |
| `--color-muted` | Pedra | `#8C8378` | Labels · Texto secundário · Placeholders |
| `--color-success` | Verde Oliva | `#3A7D44` | Confirmado · Sucesso |
| `--color-warning` | Âmbar | `#D4860A` | Pendente · Aguardando |
| `--color-danger` | Vermelho Suave | `#B83232` | Cancelado · Erro |
| `--color-surface` | Branco | `#FFFFFF` | Superfície de cards e modais |
| `--color-border` | Cinza Claro | `#E4E1DC` | Bordas padrão |

### Variações de Acento (para estados)

| Estado | Cor | Hex |
|---|---|---|
| Hover do acento | Terracota escuro | `#A34A22` |
| Pressed do acento | Terracota mais escuro | `#8B3D1B` |
| Acento suave (bg) | Terracota 10% | `#FAECE7` |
| Acento suave (texto) | Terracota escuro | `#993C1D` |

---

## Tipografia

### Fontes

```
Títulos hero:      DM Serif Display — serifada, elegant
Corpo e UI:        Inter — sans-serif, legível em qualquer tamanho
Fallback:          system-ui, -apple-system, sans-serif
```

### Escala Tipográfica

| Nível | Tamanho | Peso | Letter Spacing | Uso |
|---|---|---|---|---|
| Display | 36–48px | 400 (DM Serif) | -0.03em | Hero sections, destaque |
| H1 | 28px | 500 | -0.02em | Títulos de página |
| H2 | 22px | 500 | -0.01em | Títulos de seção |
| H3 | 18px | 500 | 0 | Títulos de card |
| H4 | 16px | 500 | 0 | Subtítulos |
| Body | 14px | 400 | 0 | Texto de corpo |
| Small | 13px | 400 | 0 | Informações secundárias |
| Caption | 12px | 400 | 0.01em | Labels, metadados |
| Micro | 11px | 500 | 0.08em | Badges, tags uppercase |

### Regras de Uso

- `line-height: 1.6` para corpo de texto
- `line-height: 1.3` para títulos
- Títulos de seção e UI em **sentence case** (nunca ALL CAPS, exceto em labels micro com `letter-spacing: 0.12em`)
- Usar DM Serif Display apenas em elementos hero — nunca em UI funcional

---

## Espaçamento

Sistema baseado em múltiplos de 4px:

| Token | Valor | Uso |
|---|---|---|
| `--space-1` | 4px | Micro gaps internos |
| `--space-2` | 8px | Gap entre ícone e texto |
| `--space-3` | 12px | Gap entre elementos de um componente |
| `--space-4` | 16px | Padding interno padrão de cards |
| `--space-5` | 20px | Gap entre componentes próximos |
| `--space-6` | 24px | Padding de seções |
| `--space-8` | 32px | Espaço entre seções maiores |
| `--space-10` | 40px | Gutter de grid |
| `--space-12` | 48px | Margens de página |
| `--space-16` | 64px | Seções de hero |

---

## Border Radius

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 4px | Badges · Chips · Tags |
| `--radius-md` | 8px | Inputs · Botões · Slots de horário |
| `--radius-lg` | 12px | Cards · Painéis |
| `--radius-xl` | 16px | Modais · Drawers |
| `--radius-full` | 9999px | Avatares · Pills |

---

## Elevação e Sombras

Filosofia: bordas ao invés de sombras. Sombras apenas para modais e dropdowns.

| Nível | CSS | Uso |
|---|---|---|
| Nível 0 — padrão | `border: 0.5px solid #E4E1DC` | Cards, inputs em repouso |
| Nível 1 — hover | `border: 0.5px solid #C0BDB7` + `box-shadow: 0 1px 4px rgba(0,0,0,0.06)` | Cards em hover |
| Nível 2 — selecionado | `border: 1.5px solid #C15A2E` | Item ativo/selecionado |
| Nível 3 — flutuante | `box-shadow: 0 4px 16px rgba(0,0,0,0.10)` | Dropdowns, tooltips |
| Nível 4 — modal | `box-shadow: 0 8px 32px rgba(0,0,0,0.14)` | Modais, sheets |

---

## Componentes — Botões

### Variantes

```css
/* Primário — CTA principal */
.btn-primary {
  background: #C15A2E;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  transition: background 200ms ease-out;
}
.btn-primary:hover { background: #A34A22; }
.btn-primary:active { background: #8B3D1B; transform: scale(0.98); }

/* Secundário — ação alternativa */
.btn-secondary {
  background: transparent;
  color: #C15A2E;
  border: 1.5px solid #C15A2E;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}
.btn-secondary:hover { background: #FAECE7; }

/* Escuro — confirmação final */
.btn-dark {
  background: #1A1A2E;
  color: #E8D5B7;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}
.btn-dark:hover { background: #262640; }

/* Ghost — ação neutra / cancelar */
.btn-ghost {
  background: #F7F5F2;
  color: #2E2B25;
  border: 0.5px solid #E4E1DC;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
}
.btn-ghost:hover { background: #EDEAE5; }
```

### Tamanhos

| Tamanho | Padding | Font-size | Uso |
|---|---|---|---|
| `sm` | `7px 14px` | 12px | Dentro de cards compactos |
| `md` (padrão) | `10px 20px` | 14px | Maioria das ações |
| `lg` | `13px 28px` | 16px | CTAs de hero |
| `full` | `12px 0` (width: 100%) | 14px | Mobile / dentro de cards |

---

## Componentes — Badges e Status

```css
/* Base */
.badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

/* Variantes semânticas */
.badge-popular  { background: #FAECE7; color: #993C1D; } /* "Mais pedido" */
.badge-premium  { background: #1A1A2E; color: #E8D5B7; } /* "Premium" */
.badge-neutral  { background: #F0EDE8; color: #5F5A54; } /* duração, tipo */
.badge-success  { background: #EAF7EC; color: #2A6B31; } /* Confirmado */
.badge-warning  { background: #FEF3E2; color: #8B5A0A; } /* Pendente */
.badge-danger   { background: #FCEAEA; color: #8B2222; } /* Cancelado */
```

---

## Componentes — Inputs

```css
/* Input padrão */
.input {
  background: #F7F5F2;
  border: 0.5px solid #E4E1DC;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
  color: #2E2B25;
  width: 100%;
  transition: border-color 200ms ease-out;
}
.input::placeholder { color: #8C8378; }
.input:hover  { border-color: #C0BDB7; }
.input:focus  { border-color: #C15A2E; outline: none; box-shadow: 0 0 0 3px rgba(193,90,46,0.12); }
.input.error  { border-color: #B83232; box-shadow: 0 0 0 3px rgba(184,50,50,0.10); }

/* Label */
.input-label {
  font-size: 12px;
  font-weight: 500;
  color: #8C8378;
  margin-bottom: 4px;
  display: block;
}
```

### Slot de Horário

```css
.time-slot {
  padding: 8px 0;
  text-align: center;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 0.5px solid #E4E1DC;
  background: #FFFFFF;
  color: #2E2B25;
  cursor: pointer;
  transition: all 200ms ease-out;
}
.time-slot:hover     { border-color: #C15A2E; color: #C15A2E; }
.time-slot.selected  { background: #1A1A2E; color: #E8D5B7; border-color: #1A1A2E; }
.time-slot.disabled  { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
```

---

## Componentes — Cards

### Card de Serviço

```
┌─────────────────────────────────────┐
│  [Imagem / ícone — fundo escuro]    │  ← height: 72–96px, bg: #1A1A2E
├─────────────────────────────────────┤
│  Nome do Serviço         [Popular]  │  ← 15px/500 + badge
│  60 min · Barbeiro                  │  ← 12px, color: muted
│                                     │
│  R$ 65                              │  ← 16px/500, color: terracota
│                                     │
│  [      Agendar      ]              │  ← btn-primary full width
└─────────────────────────────────────┘
```

```css
.service-card {
  background: #FFFFFF;
  border: 0.5px solid #E4E1DC;
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 200ms ease-out, border-color 200ms ease-out;
}
.service-card:hover {
  border-color: #C0BDB7;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.service-card-image {
  height: 88px;
  background: #1A1A2E;
  display: flex;
  align-items: center;
  justify-content: center;
}
.service-card-body  { padding: 12px 14px; }
.service-card-name  { font-size: 15px; font-weight: 500; color: #2E2B25; }
.service-card-meta  { font-size: 12px; color: #8C8378; margin-top: 2px; }
.service-card-price { font-size: 16px; font-weight: 500; color: #C15A2E; margin-top: 8px; }
```

### Card de Profissional

```
┌─────────────────────────────────────┐
│  [CM]  Carlos Mendes                │  ← avatar 48px + nome 15px/500
│        Barbeiro Sênior · 8 anos     │  ← 12px, muted
│                                     │
│  ★★★★★  4.9  (312 avaliações)      │  ← stars: terracota, nota: bold
│                                     │
│  [Fade]  [Barba]  [Navalhado]      │  ← badges neutros
└─────────────────────────────────────┘
```

### Card de Agendamento

```
┌─────────────────────────────────────┐  ← bg: #1A1A2E
│  Próximo agendamento   14:30        │  ← header escuro
│  Qui, 22 Mai           60 min       │  ← cor: linho (#E8D5B7), hora: terracota
├─────────────────────────────────────┤
│  [CM]  Carlos Mendes                │  ← avatar sm + nome
│        Corte + Barba                │  ← serviço, 12px muted
│                                     │
│  [Cancelar]   [Reagendar]           │  ← ghost + primary
└─────────────────────────────────────┘
```

### Avatar

```css
.avatar {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  background: #2E2B25;
  color: #E8D5B7;
  flex-shrink: 0;
}
.avatar-lg { width: 48px; height: 48px; font-size: 16px; }
.avatar-md { width: 40px; height: 40px; font-size: 14px; }
.avatar-sm { width: 32px; height: 32px; font-size: 12px; }

/* Avatar selecionado */
.avatar.selected {
  border: 2px solid #C15A2E;
}
```

---

## Componentes — Navegação

### Navbar

```
┌─────────────────────────────────────────────────────┐
│  ✂ Barber[Hub]    Início  Serviços  Profissionais  [Agendar] │
└─────────────────────────────────────────────────────┘
```

```css
.navbar {
  background: #1A1A2E;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 12px; /* ou 0 se full-width */
}
.navbar-logo {
  font-size: 18px;
  font-weight: 500;
  color: #E8D5B7;
  letter-spacing: 0.02em;
}
.navbar-logo span { color: #C15A2E; } /* parte do acento */
.navbar-link        { font-size: 14px; color: rgba(232,213,183,0.55); }
.navbar-link.active { color: #E8D5B7; }
.navbar-link:hover  { color: rgba(232,213,183,0.85); }
```

---

## Componentes — Fluxo de Agendamento

### Barra de Progresso em Etapas

```
Serviço ──●────────── Profissional ──────────── Data ──────────── Confirmar
         done              active                 —                   —
```

```css
.step-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}
.step-bar-item {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: #E4E1DC;
}
.step-bar-item.done   { background: #C15A2E; }
.step-bar-item.active { background: #1A1A2E; }
```

### Labels das etapas

```css
.step-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8C8378;
  margin-bottom: 6px;
}
.step-labels .active { color: #C15A2E; font-weight: 500; }
```

### Grade de Horários

Layout recomendado: `grid-template-columns: repeat(4, 1fr)` com `gap: 6px`. Em mobile, usar `repeat(3, 1fr)`.

---

## Motion e Feedback

| Elemento | Propriedade | Valor |
|---|---|---|
| Hover geral | `transition` | `all 200ms ease-out` |
| Hover de card | `transform` | `scale(1.01)` (opcional, sutil) |
| Botão clicado | `transform` | `scale(0.98)` |
| Entrada de modal | `animation` | `slide-up 220ms ease-out` |
| Confirmação | `animation` | `fade-in + checkmark 300ms` |
| Erro/shake | `animation` | `shake 300ms ease-in-out` |
| Toast/notificação | `animation` | `slide-in-right 250ms ease-out` |

```css
@keyframes slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## Diretrizes de Uso

### Quando usar cada cor

| Cor | Usar para | Evitar em |
|---|---|---|
| `#1A1A2E` Noite Profunda | Navbar, header de card de agendamento, botão de confirmação final | Texto de corpo, backgrounds de página |
| `#C15A2E` Terracota | CTAs, preços, estrelas de avaliação, slot selecionado, foco de input | Texto grande corrido, backgrounds de seção inteira |
| `#E8D5B7` Linho | Texto sobre `#1A1A2E`, logo sobre fundo escuro | Texto sobre fundo claro (contraste insuficiente) |
| `#F7F5F2` Off-White | Background geral da app | Cards (usar branco `#FFF` para elevar) |
| `#2E2B25` Carvão | Texto de corpo principal, nomes, títulos no fundo claro | — |
| `#8C8378` Pedra | Labels, metadados, placeholders, texto secundário | Texto principal — contraste baixo demais para corpo |

### Hierarquia visual de uma tela

1. **Fundo geral** — `#F7F5F2`
2. **Cards / superfícies** — `#FFFFFF` com borda `#E4E1DC`
3. **Header / navbar** — `#1A1A2E`
4. **CTA principal** — `#C15A2E`
5. **Texto principal** — `#2E2B25`
6. **Texto secundário** — `#8C8378`

### Imagens e ícones

- **Thumbnails de serviço**: fundo `#1A1A2E`, ícone em `#E8D5B7` com opacidade 70%
- **Fotos de profissionais**: tom quente, evitar fundos muito claros
- **Ícones de UI**: outline, 16–20px em ações inline, 24px decorativo
- **Estilo geral das fotos**: vintage suave, tons quentes — coerente com a paleta terracota/linho

### Responsividade

| Breakpoint | Grid | Slots de horário | Cards de serviço |
|---|---|---|---|
| Mobile `< 640px` | 1 coluna | 3 por linha | 1 por linha |
| Tablet `640–1024px` | 2 colunas | 4 por linha | 2 por linha |
| Desktop `> 1024px` | 3–4 colunas | 5–6 por linha | 3–4 por linha |

---

## Variáveis CSS (Tokens)

Cole isso no `:root` do seu projeto:

```css
:root {
  /* Cores principais */
  --color-primary:     #1A1A2E;
  --color-accent:      #C15A2E;
  --color-accent-dark: #A34A22;
  --color-accent-soft: #FAECE7;
  --color-linen:       #E8D5B7;

  /* Backgrounds */
  --color-background:  #F7F5F2;
  --color-surface:     #FFFFFF;

  /* Texto */
  --color-text:        #2E2B25;
  --color-muted:       #8C8378;

  /* Bordas */
  --color-border:      #E4E1DC;
  --color-border-hover:#C0BDB7;

  /* Semânticas */
  --color-success:     #3A7D44;
  --color-warning:     #D4860A;
  --color-danger:      #B83232;

  /* Tipografia */
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body:    'Inter', system-ui, -apple-system, sans-serif;

  /* Espaçamento */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Border radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Transições */
  --transition-fast:   150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow:   300ms ease-out;
}
```

---

## Referências de Inspiração

| Plataforma | O que absorver | O que evitar |
|---|---|---|
| **Booksy** | Cards de serviço claros, badges de popularidade, separação profissional/serviço | Excesso de cores sem hierarquia |
| **Fresha** | Minimalismo elegante, step flow progressivo, respiro generoso | Frieza excessiva — adaptar para contexto brasileiro |
| **Vagaro** | Avatares com chips de especialidade, densidade organizada em dashboard | Identidade violeta genérica |

---

*Design System v1.0 — MVP de Agendamento de Serviços*
