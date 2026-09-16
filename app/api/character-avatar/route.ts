import { NextRequest, NextResponse } from 'next/server';
import { getCharacterImageUrl } from '@/lib/disneyApi';
import { getDanceStyleFromFullName } from '@/lib/characters';

// Dado un personaje (con o sin sufijo de baile), devuelve la imagen real de Disney.
// Si no hay match, avatar: null (el cliente usa el fallback de DiceBear).
export async function GET(request: NextRequest) {
  const personaje = (request.nextUrl.searchParams.get('personaje') ?? '').trim();

  if (!personaje) {
    return NextResponse.json(
      { error: 'Falta el parámetro personaje' },
      { status: 400 }
    );
  }

  // Si viene nombre completo ("Simba Salsero"), quedarnos solo con la base ("Simba").
  const base =
    getDanceStyleFromFullName(personaje).length > 0
      ? personaje.slice(0, -(getDanceStyleFromFullName(personaje).length + 1))
      : personaje;

  const avatar = await getCharacterImageUrl(base);

  return NextResponse.json({ personaje: base, avatar });
}