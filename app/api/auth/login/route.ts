import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar credenciales
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Credenciales de administrador no configuradas' },
        { status: 500 }
      );
    }

    if (email === adminEmail && password === adminPassword) {
      // Login exitoso
      return NextResponse.json({
        success: true,
        message: 'Autenticación exitosa',
      });
    } else {
      // Credenciales incorrectas
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    return NextResponse.json(
      { error: 'Error al procesar la autenticación' },
      { status: 500 }
    );
  }
}
