import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zgsfkryivuwvdxfprgbj.supabase.co';
// Service Role Key is kept secure on the server side
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key-placeholder';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function verifyAdminRequest(req: Request): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedPassword = process.env.ADMIN_PASSWORD || 'AgendaiAdmin2026!';
  
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '').trim();
  return token === expectedPassword;
}

export async function getAuthenticatedUser(req: Request): Promise<{ isAdmin: boolean; user?: any } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '').trim();

  // 1. Verificar se é a senha de Super-Admin
  const expectedPassword = process.env.ADMIN_PASSWORD || 'AgendaiAdmin2026!';
  if (token === expectedPassword) {
    return { isAdmin: true };
  }

  // 2. Verificar se é um JWT válido de Usuário no Supabase Auth
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    return { isAdmin: false, user };
  } catch (err) {
    return null;
  }
}

export async function checkUserPlanIsActive(userId: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !user) return false;
    return user.user_metadata?.plan_status === 'active';
  } catch (err) {
    return false;
  }
}
