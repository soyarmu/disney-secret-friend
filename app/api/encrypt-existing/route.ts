import { NextResponse } from 'next/server';
import { encryptExistingAssignments, getAllParticipants } from '@/lib/googleSheets';

// Migración de una sola vez: cifra los valores legacy en texto plano de
// personaje/amigoSecreto/regalosAmigo que ya estaban en la hoja antes del deploy.
export async function POST() {
  try {
    const encrypted = await encryptExistingAssignments();
    const participants = await getAllParticipants();

    return NextResponse.json({
      success: true,
      message: `Se cifraron ${encrypted} asignaciones.`,
      encryptedRows: encrypted,
      totalParticipants: participants.length,
    });
  } catch (error) {
    console.error('Error cifrando asignaciones existentes:', error);

    return NextResponse.json(
      {
        error: 'Error al cifrar las asignaciones existentes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}