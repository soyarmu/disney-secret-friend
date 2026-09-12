// Utilidades de seguridad para validación y sanitización

// Sanitizar strings para prevenir XSS
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Eliminar < y >
    .trim()
    .slice(0, 500); // Limitar longitud
}

// Validar email con regex estricto
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Validar que el nombre solo contenga caracteres permitidos
export function isValidName(name: string): boolean {
  // Solo letras, espacios, guiones y apóstrofes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
}

// Validar texto de regalo (sin caracteres peligrosos)
export function isValidGiftText(text: string): boolean {
  // Evitar inyecciones y caracteres raros
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick, onerror, etc
    /data:text\/html/i,
  ];
  
  return (
    !dangerousPatterns.some(pattern => pattern.test(text)) &&
    text.length >= 3 &&
    text.length <= 200
  );
}

// Obtener IP del request (considerando proxies)
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

// Generar un hash simple para identificadores (no para contraseñas)
export function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Verificar si una solicitud es sospechosa
export function isSuspiciousRequest(request: Request): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Lista de user agents sospechosos (bots maliciosos)
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
  ];
  
  // Permitir bots legítimos (Google, Bing, etc)
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
    /slackbot/i,
    /twitterbot/i,
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isAllowed = allowedBots.some(pattern => pattern.test(userAgent));
  
  return isSuspicious && !isAllowed;
}

// Limitar tamaño de payload
export function isPayloadSafe(bodyText: string): boolean {
  const maxSize = 10 * 1024; // 10KB
  return bodyText.length <= maxSize;
}
