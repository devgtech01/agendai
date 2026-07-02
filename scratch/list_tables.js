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

async function listTables() {
  // We can query postgrest to see table names
  const { data, error } = await supabase.from('establishments').select('id').limit(1);
  console.log('Test establishments select:', data, error);
  
  // Let's try to query 'profiles' or other tables to see if they exist
  const tables = ['profiles', 'users', 'professionals', 'settings'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    console.log(`Table ${t}:`, error ? `Error: ${error.message}` : `Exists! Row: ${JSON.stringify(data)}`);
  }
}

listTables();
