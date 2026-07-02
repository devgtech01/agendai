const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgsfkryivuwvdxfprgbj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnc2ZrcnlpdnV3dmR4ZnByZ2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTE3MDYsImV4cCI6MjA5NTkyNzcwNn0.3Iu_NLdE9wqNBYcbGIN3bo9L6tgWc-kvY3xTk9scIAs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAccount() {
  console.log('1. Iniciando cadastro do usuário...');
  const email = 'gabrielsoares.live20@gmail.com';
  const password = 'senhafacil123';
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: 'Gabriel Soares',
      }
    }
  });

  if (authError) {
    console.error('Erro no Auth:', authError);
    return;
  }

  console.log('Usuário Auth criado/retornado com sucesso!');
  console.log('User ID:', authData.user?.id);
  console.log('Sessão existe?', !!authData.session);

  if (!authData.session) {
    console.log('AVISO: A sessão é nula. Isso significa que a confirmação de e-mail ainda está ativada no Supabase ou ocorreu outro problema que impede o login automático após o signup.');
    // Vamos tentar fazer o login explicitamente para ver se dá erro de confirmação
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email, password
    });
    if (loginError) {
        console.error('Erro ao tentar logar explicitamente:', loginError);
        return;
    }
    console.log('Login explícito funcionou! Sessão obtida.');
  }

  console.log('2. Tentando inserir estabelecimento...');
  const { data: estData, error: estError } = await supabase
    .from('establishments')
    .insert([
      {
        name: 'Gb Barber',
        description: 'Bem-vindo ao meu estabelecimento!',
        address: 'Endereço pendente',
        phone: '71981032968',
        image_url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        owner_id: authData.user?.id
      }
    ])
    .select()
    .single();

  if (estError) {
    console.error('Erro ao inserir estabelecimento:', estError);
  } else {
    console.log('Estabelecimento inserido com sucesso!', estData);
  }
}

createAccount();
