import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByEmail, getAllParticipants } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validar que el email esté presente
    if (!email) {
      return NextResponse.json(
        { error: 'El correo electrónico es requerido' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Buscar al participante por email
    const participant = await getParticipantByEmail(email);

    if (!participant) {
      return NextResponse.json(
        { error: 'Este correo no está registrado en el reino mágico' },
        { status: 404 }
      );
    }

    // Verificar si el sorteo ya se realizó
    if (!participant.amigoSecreto || participant.amigoSecreto.trim() === '') {
      // Sorteo NO realizado
      return NextResponse.json({
        success: true,
        sorteoRealizado: false,
        message: 'Paciencia... La magia del sorteo aún no ocurre. Vuelve más tarde.',
        tuPersonaje: participant.personaje,
        tuAvatar: participant.avatar,
      });
    }

    // Sorteo SÍ realizado - Buscar los datos del amigo secreto
    const allParticipants = await getAllParticipants();
    const amigoSecreto = allParticipants.find(
      (p) => p.personaje === participant.amigoSecreto
    );

    if (!amigoSecreto) {
      return NextResponse.json(
        { error: 'Error al obtener los datos de tu amigo secreto' },
        { status: 500 }
      );
    }

    // Devolver toda la información
    return NextResponse.json({
      success: true,
      sorteoRealizado: true,
      tuPersonaje: participant.personaje,
      tuAvatar: participant.avatar,
      amigoSecreto: {
        personaje: amigoSecreto.personaje,
        avatar: amigoSecreto.avatar,
        regalos: {
          opcion1: amigoSecreto.regalo1,
          opcion2: amigoSecreto.regalo2,
          opcion3: amigoSecreto.regalo3,
        },
      },
    });
  } catch (error) {
    console.error('Error en el login de usuario:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar tu solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
