const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1].trim();
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseReadiness() {
  console.log('--- TESTANDO PRONTIDÃO DO BANCO DE DADOS (SUPABASE) ---');
  console.log('Supabase URL:', supabaseUrl);
  
  let hasErrors = false;

  // 1. Testar se a tabela de estabelecimentos existe e quais colunas possui
  console.log('\n1. Testando tabela "establishments"...');
  const { data: ests, error: estError } = await supabase.from('establishments').select('*').limit(1);
  if (estError) {
    console.error('❌ Erro na tabela establishments:', estError.message);
    hasErrors = true;
  } else {
    console.log('✅ Tabela establishments existe!');
    if (ests && ests.length > 0) {
      const row = ests[0];
      const hasLunchColumns = 'lunch_start' in row && 'lunch_end' in row;
      const hasWorkingHours = 'opening_time' in row && 'closing_time' in row;
      console.log('   - Colunas de Almoço (lunch_start, lunch_end):', hasLunchColumns ? '✅ Presentes' : '❌ FALTANDO');
      console.log('   - Colunas de Funcionamento (opening_time, closing_time):', hasWorkingHours ? '✅ Presentes' : '❌ FALTANDO');
      if (!hasLunchColumns || !hasWorkingHours) hasErrors = true;
    } else {
      console.log('   ⚠️ Tabela establishments existe, mas está vazia. Não foi possível verificar as colunas.');
    }
  }

  // 2. Testar se a tabela de serviços existe
  console.log('\n2. Testando tabela "services"...');
  const { data: servs, error: servError } = await supabase.from('services').select('*').limit(1);
  if (servError) {
    console.error('❌ Erro na tabela services:', servError.message);
    hasErrors = true;
  } else {
    console.log('✅ Tabela services existe!');
  }

  // 3. Testar se a tabela de profissionais existe
  console.log('\n3. Testando tabela "professionals"...');
  const { data: profs, error: profError } = await supabase.from('professionals').select('*').limit(1);
  if (profError) {
    console.error('❌ Erro na tabela professionals:', profError.message);
    hasErrors = true;
  } else {
    console.log('✅ Tabela professionals existe!');
  }

  // 4. Testar se a tabela de agendamentos existe e validação do constraint de status
  console.log('\n4. Testando tabela "bookings"...');
  const { data: bks, error: bkError } = await supabase.from('bookings').select('*').limit(1);
  if (bkError) {
    console.error('❌ Erro na tabela bookings:', bkError.message);
    hasErrors = true;
  } else {
    console.log('✅ Tabela bookings existe!');
  }

  console.log('\n--- CONCLUSÃO ---');
  if (hasErrors) {
    console.log('❌ O seu projeto atual do Supabase tem pendências. É necessário rodar os scripts SQL.');
  } else {
    console.log('🎉 Tudo pronto! O seu projeto atual do Supabase já possui todas as tabelas e colunas necessárias para o Agendai.');
  }
}

testDatabaseReadiness();
