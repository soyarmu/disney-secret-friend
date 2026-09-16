import { NextResponse } from 'next/server';
import { fixDanceStyleGenderAssignments } from '@/lib/googleSheets';

// Migración: ajusta el género del estilo de baile de cada personaje según la
// columna 'sexo' (K). No re-sorte; preserva el círculo de asignaciones existente.
export async function POST() {
  try {
    const updated = await fixDanceStyleGenderAssignments();

    return NextResponse.json({
      success: true,
      message: `Se ajustaron ${updated} personajes al género de su sexo.`,
      updatedCharacters: updated,
    });
  } catch (error) {
    console.error('Error ajustando géneros de personajes:', error);

    return NextResponse.json(
      {
        error: 'Error al ajustar los géneros de los personajes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}