import { NextRequest, NextResponse } from 'next/server';
import { getAllParticipants, updateDrawAssignments } from '@/lib/googleSheets';

/**
 * Algoritmo de sorteo circular perfecto para Secret Santa
 * Garantiza que:
 * 1. Nadie se regale a sí mismo
 * 2. Todos reciban exactamente un regalo
 * 3. Todos den exactamente un regalo
 * 4. Se forme un ciclo perfecto (A → B → C → ... → A)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createSecretSantaCircle(participants: string[]): Map<string, string> {
  // Barajear los participantes para aleatoriedad
  const shuffled = shuffleArray(participants);
  
  // Crear el mapa de asignaciones (giver -> receiver)
  const assignments = new Map<string, string>();
  
  // Crear un círculo: cada persona le da al siguiente
  for (let i = 0; i < shuffled.length; i++) {
    const giver = shuffled[i];
    const receiver = shuffled[(i + 1) % shuffled.length]; // El último vuelve al primero
    assignments.set(giver, receiver);
  }
  
  return assignments;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener todos los participantes
    const participants = await getAllParticipants();

    // Validar que haya participantes
    if (participants.length === 0) {
      return NextResponse.json(
        { error: 'No hay participantes registrados para realizar el sorteo' },
        { status: 400 }
      );
    }

    // Validar que haya al menos 2 participantes
    if (participants.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 participantes para realizar el sorteo' },
        { status: 400 }
      );
    }

    // Verificar si ya se realizó el sorteo
    const alreadyDrawn = participants.some((p) => p.amigoSecreto && p.amigoSecreto.trim() !== '');
    
    if (alreadyDrawn) {
      return NextResponse.json(
        { error: 'El sorteo ya ha sido realizado. No se puede sortear nuevamente.' },
        { status: 409 }
      );
    }

    // Obtener lista de personajes (identificadores únicos)
    const characterNames = participants.map((p) => p.personaje);

    // Ejecutar el algoritmo de sorteo circular
    const assignments = createSecretSantaCircle(characterNames);

    // Preparar las asignaciones para actualizar en Google Sheets
    const updateData = participants.map((participant) => {
      const receiverCharacter = assignments.get(participant.personaje);
      
      // Encontrar los datos del receptor
      const receiver = participants.find((p) => p.personaje === receiverCharacter);
      
      if (!receiver) {
        throw new Error(`No se encontró el receptor para ${participant.personaje}`);
      }

      // Concatenar los 3 regalos del receptor
      const regalosAmigo = `1. ${receiver.regalo1} | 2. ${receiver.regalo2} | 3. ${receiver.regalo3}`;

      return {
        personaje: participant.personaje,
        amigoSecreto: receiver.personaje,
        regalosAmigo,
      };
    });

    // Actualizar el Google Sheet con las asignaciones
    await updateDrawAssignments(updateData);

    // Retornar éxito
    return NextResponse.json(
      {
        success: true,
        message: '¡El sorteo mágico ha sido completado con éxito!',
        data: {
          totalParticipants: participants.length,
          assignments: updateData.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en el sorteo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al realizar el sorteo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar el estado del sorteo
export async function GET() {
  try {
    const participants = await getAllParticipants();
    
    const hasDrawn = participants.some(p => p.amigoSecreto && p.amigoSecreto.trim() !== '');
    
    return NextResponse.json({
      totalParticipants: participants.length,
      drawCompleted: hasDrawn,
      canDraw: participants.length >= 2 && !hasDrawn,
    });
  } catch (error) {
    console.error('Error obteniendo estado del sorteo:', error);
    
    return NextResponse.json(
      { error: 'Error al obtener el estado del sorteo' },
      { status: 500 }
    );
  }
}
