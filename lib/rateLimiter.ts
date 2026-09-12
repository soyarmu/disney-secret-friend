// Rate Limiter simple en memoria
// Previene ataques de fuerza bruta y spam

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Limpiar registros expirados cada 5 minutos
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Nueva ventana de tiempo
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.requests.set(identifier, newEntry);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      // Límite excedido
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Incrementar contador
    entry.count++;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Instancias para diferentes endpoints
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 intentos por 15 minutos
export const registerRateLimiter = new RateLimiter(3, 60 * 60 * 1000); // 3 registros por hora
export const drawRateLimiter = new RateLimiter(10, 60 * 1000); // 10 intentos por minuto
export const adminLoginRateLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 intentos por 15 minutos
