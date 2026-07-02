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

if (!supabaseUrl || !supabaseKey) {
  console.error('Keys not found in .env.local!');
  console.log('Parsed env keys:', Object.keys(env));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStatus() {
  console.log('Testing if status can be "Bloqueado"...');
  
  // Find a valid establishment and service first to avoid foreign key violations.
  const { data: ests, error: estError } = await supabase.from('establishments').select('id').limit(1);
  if (estError || !ests || ests.length === 0) {
    console.error('No establishments found or error:', estError);
    process.exit(1);
  }
  const estId = ests[0].id;

  const { data: servs, error: servError } = await supabase.from('services').select('id').eq('establishment_id', estId).limit(1);
  if (servError || !servs || servs.length === 0) {
    console.error('No services found for establishment or error:', servError);
    process.exit(1);
  }
  const servId = servs[0].id;

  console.log(`Using establishment_id: ${estId}, service_id: ${servId}`);

  const testBooking = {
    establishment_id: estId,
    service_id: servId,
    client_name: 'Bloqueio de Horário',
    client_email: 'blocked@agendai.com',
    client_phone: '00000000000',
    date: '2026-06-16',
    time: '12:00:00',
    status: 'Confirmado'
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert([testBooking])
    .select();

  if (error) {
    console.error('Error inserting with status "Bloqueado":', error);
  } else {
    console.log('Success! Status "Bloqueado" is supported. Inserted booking:', data);
    // Delete it
    const { error: delError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', data[0].id);
    console.log('Deleted test booking. Error:', delError);
  }
}

testStatus();
