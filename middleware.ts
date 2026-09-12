import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers de seguridad HTTP
  response.headers.set('X-Frame-Options', 'DENY'); // Prevenir clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Prevenir MIME sniffing
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Protección XSS
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  
  // Content Security Policy (CSP) - Prevenir XSS y ataques de inyección
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js necesita unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Verificar método HTTP
  const allowedMethods = ['GET', 'POST', 'OPTIONS'];
  if (!allowedMethods.includes(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // Proteger rutas de API sensibles
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Verificar que tenga Content-Type correcto en POST
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return new NextResponse('Invalid Content-Type', { status: 400 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
