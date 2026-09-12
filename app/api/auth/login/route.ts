import { NextRequest, NextResponse } from 'next/server';
import { adminLoginRateLimiter } from '@/lib/rateLimiter';
import { getClientIP, sanitizeString, isValidEmail } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP (más estricto para admin)
    const clientIP = getClientIP(request);
    const rateLimitResult = adminLoginRateLimiter.check(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetIn = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { 
          error: `Demasiados intentos de login. Intenta de nuevo en ${resetIn} minutos.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    // Validar que los campos estén presentes
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Sanitizar inputs
    const sanitizedEmail = sanitizeString(email.toLowerCase());
    
    // Validar email
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' }, // No revelar qué está mal
        { status: 401 }
      );
    }

    // Validar credenciales
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ADMIN credentials not configured');
      return NextResponse.json(
        { error: 'Configuración del servidor incorrecta' },
        { status: 500 }
      );
    }

    // Comparación de email (case insensitive) y password (case sensitive)
    if (sanitizedEmail === adminEmail.toLowerCase() && password === adminPassword) {
      // Login exitoso
      return NextResponse.json({
        success: true,
        message: 'Autenticación exitosa',
      });
    } else {
      // Credenciales incorrectas - no revelar cuál está mal
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
