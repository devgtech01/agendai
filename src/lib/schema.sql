-- Schema Inicial - SaaS Agendai

-- Habilitar a extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Estabelecimentos
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    image_url TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opening_time TIME DEFAULT '08:00:00',
    closing_time TIME DEFAULT '19:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Serviços
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Profissionais (Equipe)
CREATE TABLE professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de Agendamentos
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Confirmado', 'Pendente', 'Cancelado', 'Concluido')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Habilitar Row Level Security (RLS) básico para permitir leitura pública inicial
-- (Mais tarde, quando houver autenticação, fecharemos isso apenas para donos/clientes)

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estabelecimentos visiveis para todos" ON establishments FOR SELECT USING (true);
CREATE POLICY "Dono pode inserir seu proprio estabelecimento" ON establishments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Dono pode atualizar seu proprio estabelecimento" ON establishments FOR UPDATE USING (auth.uid() = owner_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servicos visiveis para todos" ON services FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir servico (temporario)" ON services FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar servico (temporario)" ON services FOR UPDATE USING (true);
CREATE POLICY "Qualquer um pode deletar servico (temporario)" ON services FOR DELETE USING (true);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais visiveis para todos" ON professionals FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode inserir profissional (temporario)" ON professionals FOR INSERT WITH CHECK (true);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agendamentos visiveis para todos" ON bookings FOR SELECT USING (true);
CREATE POLICY "Qualquer um pode criar agendamento (temporario)" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Qualquer um pode atualizar agendamento (temporario)" ON bookings FOR UPDATE USING (true);

-- Consultas de Atualização (execute no SQL Editor do Supabase se a tabela já existir):
-- ALTER TABLE establishments ADD COLUMN opening_time TIME DEFAULT '08:00:00';
-- ALTER TABLE establishments ADD COLUMN closing_time TIME DEFAULT '19:00:00';
-- ALTER TABLE establishments ADD COLUMN lunch_start TIME DEFAULT '12:00:00';
-- ALTER TABLE establishments ADD COLUMN lunch_end TIME DEFAULT '13:00:00';

