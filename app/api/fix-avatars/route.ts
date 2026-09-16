import { NextResponse } from 'next/server';
import { fixAvatars, getAllParticipants } from '@/lib/googleSheets';

// Migración: reemplaza los avatares legacy de DiceBear de los participantes ya
// registrados por la imagen real de Disney. No re-sorte; solo actualiza avatars.
export async function POST() {
  try {
    const updated = await fixAvatars();
    const participants = await getAllParticipants();

    return NextResponse.json({
      success: true,
      message: `Se actualizaron ${updated} avatares a la imagen real de Disney.`,
      updatedAvatars: updated,
      totalParticipants: participants.length,
    });
  } catch (error) {
    console.error('Error actualizando avatares:', error);

    return NextResponse.json(
      {
        error: 'Error al actualizar los avatares',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}