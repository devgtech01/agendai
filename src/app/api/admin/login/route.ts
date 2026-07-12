import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Credenciais de administrador verificadas exclusivamente no servidor
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@sisagendai.online';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'AgendaiAdmin2026!';

    if (
      email && 
      password && 
      email.trim().toLowerCase() === expectedEmail.toLowerCase() && 
      password === expectedPassword
    ) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'E-mail ou senha de administrador incorretos.' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
