import { NextRequest, NextResponse } from 'next/server';
import { resetDraw, clearAllData, getAllParticipants } from '@/lib/googleSheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Se requiere especificar la acción (reset-draw o clear-all)' },
        { status: 400 }
      );
    }

    if (action === 'reset-draw') {
      // Resetear solo el sorteo (mantener participantes)
      await resetDraw();

      const participants = await getAllParticipants();

      return NextResponse.json({
        success: true,
        message: 'El sorteo ha sido reseteado. Los participantes se mantienen registrados.',
        totalParticipants: participants.length,
      });
    } else if (action === 'clear-all') {
      // Limpiar todo (borrar todos los participantes)
      await clearAllData();

      return NextResponse.json({
        success: true,
        message: 'Todos los datos han sido eliminados. El juego ha sido reseteado completamente.',
        totalParticipants: 0,
      });
    } else {
      return NextResponse.json(
        { error: 'Acción no válida. Usa "reset-draw" o "clear-all"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error al resetear:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar el reseteo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
