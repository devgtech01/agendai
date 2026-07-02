-- Seed Inicial para testar a interface
-- Execute no SQL Editor do Supabase

-- Inserir Estabelecimento Fictício
INSERT INTO establishments (id, name, description, address, phone, image_url)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Barbearia Clássica Premium',
    'A melhor experiência em cortes e barboterapia da região.',
    'Rua das Tesouras, 123 - Centro',
    '(11) 99999-9999',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Inserir Serviços para este Estabelecimento
INSERT INTO services (establishment_id, name, description, duration_minutes, price, category, image_url)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Corte Degradê Premium', 'Corte moderno com acabamento perfeito, toalha quente e finalização com pomada importada.', 45, 65.00, 'Cabelo', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=500&q=80'),
    ('11111111-1111-1111-1111-111111111111', 'Barboterapia Clássica', 'Relaxamento total. Toalha quente, massagem facial, lâmina descartável e hidratação dos fios.', 30, 45.00, 'Barba', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=500&q=80'),
    ('11111111-1111-1111-1111-111111111111', 'Combo VIP (Cabelo + Barba)', 'A experiência completa de cuidados com um desconto especial para clientes premium.', 75, 95.00, 'Combos', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=500&q=80');

-- Inserir Profissional
INSERT INTO professionals (id, establishment_id, name, bio)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Carlos Mendes',
    'Barbeiro Sênior com 8 anos de experiência.'
)
ON CONFLICT (id) DO NOTHING;
