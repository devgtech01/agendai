import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const establishmentId = searchParams.get('establishmentId');

  if (!establishmentId) {
    return NextResponse.json({ error: 'establishmentId is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    const professionals = data.map((prof: any) => ({
      id: prof.id,
      establishmentId: prof.establishment_id,
      name: prof.name,
      bio: prof.bio,
    }));

    return NextResponse.json(professionals);
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
