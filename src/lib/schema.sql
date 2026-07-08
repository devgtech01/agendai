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
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Habilitar Row Level Security (RLS) básico para permitir leitura pública inicial
-- (Mais tarde, quando houver autenticação, fecharemos isso apenas para donos/clientes)

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Estabelecimentos visiveis para todos" ON establishments FOR SELECT USING (true);
CREATE POLICY "Dono pode inserir seu proprio estabelecimento" ON establishments FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Dono pode atualizar seu proprio estabelecimento" ON establishments FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Dono pode deletar seu proprio estabelecimento" ON establishments FOR DELETE USING (auth.uid() = owner_id);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Servicos visiveis para todos" ON services FOR SELECT USING (true);
CREATE POLICY "Dono pode gerenciar servico (insert)" ON services FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Dono pode gerenciar servico (update)" ON services FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Dono pode gerenciar servico (delete)" ON services FOR DELETE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profissionais visiveis para todos" ON professionals FOR SELECT USING (true);
CREATE POLICY "Dono pode gerenciar profissionais (insert)" ON professionals FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Dono pode gerenciar profissionais (update)" ON professionals FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Dono pode gerenciar profissionais (delete)" ON professionals FOR DELETE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dono pode ver agendamentos do seu estabelecimento" ON bookings FOR SELECT USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Qualquer um pode criar agendamento" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Dono pode atualizar agendamentos do seu estabelecimento" ON bookings FOR UPDATE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);
CREATE POLICY "Dono pode deletar agendamentos do seu estabelecimento" ON bookings FOR DELETE USING (
    auth.uid() IN (SELECT owner_id FROM establishments WHERE id = establishment_id)
);

-- Tabela de Chamados de Suporte
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_type TEXT NOT NULL DEFAULT 'professional' CHECK (user_type IN ('professional', 'client', 'guest')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aberto' CHECK (status IN ('Aberto', 'Em Andamento', 'Resolvido', 'Fechado')),
    priority TEXT NOT NULL DEFAULT 'Media' CHECK (priority IN ('Baixa', 'Media', 'Alta', 'Urgente')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer um pode criar chamado de suporte" ON support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Chamados visiveis para o criador" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Criador pode atualizar seu proprio chamado" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);


