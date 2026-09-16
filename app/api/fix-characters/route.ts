import { NextResponse } from 'next/server';
import { fixDuplicatesAndGenderAssignments } from '@/lib/googleSheets';

// Migración: corrige duplicados de personajes Disney y desajustes de género,
// reasignando personajes únicos preservando estrictamente el sorteo (sorteo circular y referencias).
export async function POST() {
  try {
    const result = await fixDuplicatesAndGenderAssignments();

    return NextResponse.json({
      success: true,
      message: `Se reasignaron ${result.reassignedCount} participantes a personajes Disney únicos y acordes a su género. Se actualizaron ${result.remappedDrawsCount} referencias del sorteo.`,
      data: result,
    });
  } catch (error) {
    console.error('Error al corregir personajes y duplicados:', error);

    return NextResponse.json(
      {
        error: 'Error al corregir personajes y duplicados',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
