export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  category: string;
  imageUrl: string;
}

export const mockServices: Service[] = [
  {
    id: "svc-001",
    name: "Corte Degradê Premium",
    description: "Corte moderno com acabamento perfeito, toalha quente e finalização com pomada importada.",
    durationMinutes: 45,
    price: 65.0,
    category: "Cabelo",
    imageUrl: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80"
  },
  {
    id: "svc-002",
    name: "Barboterapia Clássica",
    description: "Relaxamento total. Toalha quente, massagem facial, lâmina descartável e hidratação dos fios.",
    durationMinutes: 30,
    price: 45.0,
    category: "Barba",
    imageUrl: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80"
  },
  {
    id: "svc-003",
    name: "Combo VIP (Cabelo + Barba)",
    description: "A experiência completa de cuidados com um desconto especial para clientes premium.",
    durationMinutes: 75,
    price: 95.0,
    category: "Combos",
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80"
  },
  {
    id: "svc-004",
    name: "Tratamento de Pele Express",
    description: "Limpeza de pele rápida com máscara de argila negra e hidratação profunda.",
    durationMinutes: 30,
    price: 60.0,
    category: "Estética",
    imageUrl: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=500&q=80"
  }
];
