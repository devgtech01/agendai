-- 0. ADICIONAR COLUNA DE CATEGORIA EM ESTABELECIMENTOS
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE establishments ADD COLUMN IF NOT EXISTS amenities TEXT;

-- 1. CORREÇÃO DA TABELA DE SERVIÇOS (services)
DROP POLICY IF EXISTS "Dono pode gerenciar servico (insert)" ON services;
DROP POLICY IF EXISTS "Dono pode gerenciar servico (update)" ON services;
DROP POLICY IF EXISTS "Dono pode gerenciar servico (delete)" ON services;

CREATE POLICY "Dono pode gerenciar servico (insert)" ON services 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = services.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode gerenciar servico (update)" ON services 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = services.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode gerenciar servico (delete)" ON services 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = services.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);


-- 2. CORREÇÃO DA TABELA DE PROFISSIONAIS (professionals)
DROP POLICY IF EXISTS "Dono pode gerenciar profissionais (insert)" ON professionals;
DROP POLICY IF EXISTS "Dono pode gerenciar profissionais (update)" ON professionals;
DROP POLICY IF EXISTS "Dono pode gerenciar profissionais (delete)" ON professionals;

CREATE POLICY "Dono pode gerenciar profissionais (insert)" ON professionals 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = professionals.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode gerenciar profissionais (update)" ON professionals 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = professionals.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode gerenciar profissionais (delete)" ON professionals 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = professionals.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);


-- 3. CORREÇÃO DA TABELA DE AGENDAMENTOS (bookings)
DROP POLICY IF EXISTS "Dono pode ver agendamentos do seu estabelecimento" ON bookings;
DROP POLICY IF EXISTS "Dono pode atualizar agendamentos do seu estabelecimento" ON bookings;
DROP POLICY IF EXISTS "Dono pode deletar agendamentos do seu estabelecimento" ON bookings;

CREATE POLICY "Dono pode ver agendamentos do seu estabelecimento" ON bookings 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = bookings.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode atualizar agendamentos do seu estabelecimento" ON bookings 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = bookings.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);

CREATE POLICY "Dono pode deletar agendamentos do seu estabelecimento" ON bookings 
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM establishments 
        WHERE establishments.id = bookings.establishment_id 
        AND establishments.owner_id = auth.uid()
    )
);


-- 4. TABELA PARA LIBERAR ACESSO SEM CARTÃO
CREATE TABLE IF NOT EXISTS no_card_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE no_card_access ENABLE ROW LEVEL SECURITY;

-- Como as operações no_card_access no Next.js usam supabaseAdmin (com a service role key bypassando RLS),
-- criamos uma política para permitir acesso completo em desenvolvimento e garantir RLS correto.
DROP POLICY IF EXISTS "Acesso total para o Admin" ON no_card_access;
CREATE POLICY "Acesso total para o Admin" ON no_card_access
    USING (true)
    WITH CHECK (true);

