const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let envFile = '';
try {
  envFile = fs.readFileSync('.env.local', 'utf8');
} catch (e) {}

const env = {};
envFile.split('\n').forEach(line => {
  const cleanLine = line.trim();
  if (!cleanLine || cleanLine.startsWith('#')) return;
  const idx = cleanLine.indexOf('=');
  if (idx > 0) {
    const key = cleanLine.substring(0, idx).trim();
    let val = cleanLine.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Testing select on bookings table...');
  const { data, error } = await supabase.from('bookings').select('id, rating').limit(1);
  
  if (error) {
    console.log('Error selecting rating column:', error.message);
  } else {
    console.log('Select rating column succeeded! Sample:', data);
  }
}

run();
