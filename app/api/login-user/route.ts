import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByEmail, getAllParticipants } from '@/lib/googleSheets';
import { loginRateLimiter } from '@/lib/rateLimiter';
import { getClientIP, sanitizeString, isValidEmail } from '@/lib/security';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimitResult = loginRateLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Demasiados intentos. Intenta de nuevo en ${resetIn} minutos.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validar que email y password estén presentes
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Sanitizar y validar email
    const sanitizedEmail = sanitizeString(email.toLowerCase());
    
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'El formato del email no es válido' },
        { status: 400 }
      );
    }

    // Buscar al participante por email
    const participant = await getParticipantByEmail(sanitizedEmail);

    if (!participant) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, participant.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
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
