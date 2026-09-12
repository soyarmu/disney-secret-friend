import { NextRequest, NextResponse } from 'next/server';
import { addParticipant, getAllParticipants } from '@/lib/googleSheets';
import { getRandomDancingCharacter, hasAvailableCombinations } from '@/lib/characters';
import { registerRateLimiter } from '@/lib/rateLimiter';
import bcrypt from 'bcryptjs';
import { 
  sanitizeString, 
  isValidEmail, 
  isValidName, 
  isValidGiftText,
  getClientIP,
  isSuspiciousRequest,
  isPayloadSafe
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Verificar si la solicitud es sospechosa
    if (isSuspiciousRequest(request)) {
      return NextResponse.json(
        { error: 'Solicitud no permitida' },
        { status: 403 }
      );
    }

    // Rate limiting por IP
    const clientIP = getClientIP(request);
    const rateLimitResult = registerRateLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Demasiados intentos de registro. Intenta de nuevo en ${resetIn} minutos.`,
          retryAfter: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Obtener y validar tamaño del body
    const bodyText = await request.text();
    if (!isPayloadSafe(bodyText)) {
      return NextResponse.json(
        { error: 'Datos demasiado grandes' },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    const { nombre, email, password, regalo1, regalo2, regalo3 } = body;

    // Validar que todos los campos estén presentes
    if (!nombre || !email || !password || !regalo1 || !regalo2 || !regalo3) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar longitud de la contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        { error: 'La contraseña es demasiado larga' },
        { status: 400 }
      );
    }

    // Sanitizar y validar inputs
    const sanitizedNombre = sanitizeString(nombre);
    const sanitizedEmail = sanitizeString(email.toLowerCase());
    const sanitizedRegalo1 = sanitizeString(regalo1);
    const sanitizedRegalo2 = sanitizeString(regalo2);
    const sanitizedRegalo3 = sanitizeString(regalo3);

    // Validaciones específicas
    if (!isValidName(sanitizedNombre)) {
      return NextResponse.json(
        { error: 'El nombre contiene caracteres no permitidos' },
        { status: 400 }
      );
    }

    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'El email no tiene un formato válido' },
        { status: 400 }
      );
    }

    if (!isValidGiftText(sanitizedRegalo1) || 
        !isValidGiftText(sanitizedRegalo2) || 
        !isValidGiftText(sanitizedRegalo3)) {
      return NextResponse.json(
        { error: 'Las opciones de regalo contienen caracteres no permitidos' },
        { status: 400 }
      );
    }

    // Obtener todos los participantes actuales
    const existingParticipants = await getAllParticipants();

    // Verificar si el email ya está registrado
    const emailExists = existingParticipants.some(
      (p) => p.email.toLowerCase() === sanitizedEmail
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      );
    }

    // Verificar que haya combinaciones disponibles
    if (!hasAvailableCombinations(existingParticipants.length)) {
      return NextResponse.json(
        { error: 'No hay más combinaciones de personajes disponibles' },
        { status: 400 }
      );
    }

    // Obtener personajes ya asignados
    const usedCharacters = existingParticipants.map((p) => p.personaje);

    // Asignar un personaje bailarín único y aleatorio
    const dancingCharacter = getRandomDancingCharacter(usedCharacters);

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el objeto del participante con datos sanitizados
    const newParticipant = {
      nombre: sanitizedNombre,
      email: sanitizedEmail,
      password: hashedPassword,
      regalo1: sanitizedRegalo1,
      regalo2: sanitizedRegalo2,
      regalo3: sanitizedRegalo3,
      personaje: dancingCharacter.nombreCompleto,
      avatar: dancingCharacter.avatar,
    };

    // Agregar al Google Sheet
    await addParticipant(newParticipant);

    // Retornar el personaje asignado y avatar
    return NextResponse.json(
      {
        success: true,
        message: '¡Registro exitoso! Tu identidad mágica ha sido asignada',
        data: {
          personaje: dancingCharacter.nombreCompleto,
          avatar: dancingCharacter.avatar,
          nombre: dancingCharacter.personaje,
          estilo: dancingCharacter.estilobaile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en el registro:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el registro',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET opcional para verificar el estado
export async function GET() {
  try {
    const participants = await getAllParticipants();
    
    return NextResponse.json({
      totalParticipants: participants.length,
      hasDrawBeenMade: participants.some(p => p.amigoSecreto),
    });
  } catch (error) {
    console.error('Error obteniendo información:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener información' },
      { status: 500 }
    );
  }
}
