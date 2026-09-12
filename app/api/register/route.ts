import { NextRequest, NextResponse } from 'next/server';
import { addParticipant, getAllParticipants } from '@/lib/googleSheets';
import { getRandomDancingCharacter, hasAvailableCombinations } from '@/lib/characters';

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del body
    const body = await request.json();
    const { nombre, email, regalo1, regalo2, regalo3 } = body;

    // Validar que todos los campos estén presentes
    if (!nombre || !email || !regalo1 || !regalo2 || !regalo3) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'El email no tiene un formato válido' },
        { status: 400 }
      );
    }

    // Obtener todos los participantes actuales
    const existingParticipants = await getAllParticipants();

    // Verificar si el email ya está registrado
    const emailExists = existingParticipants.some(
      (p) => p.email.toLowerCase() === email.toLowerCase()
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

    // Crear el objeto del participante
    const newParticipant = {
      nombre,
      email,
      regalo1,
      regalo2,
      regalo3,
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
