import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Prefijo para distinguir texto cifrado de valores legacy en texto plano.
export const ENCRYPTION_PREFIX = 'enc:v1:';

// Obtiene la clave de 32 bytes a partir de ENCRYPTION_KEY.
// Si es un hex de 64 chars se usa directo; si no, se deriva con SHA-256.
function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY no está configurada. Genera una con: openssl rand -hex 32'
    );
  }
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  return crypto.createHash('sha256').update(key).digest();
}

// Cifra texto plano → ENCRYPTION_PREFIX + base64(iv || ciphertext || authTag)
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return ENCRYPTION_PREFIX + Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

// Cifrado determinista (para campos que funcionan como llave de join, ej. 'personaje'):
// el IV se deriva del plaintext con HMAC-SHA256, por lo que el mismo texto plano produce
// siempre el mismo cifrado. Permite buscar por igualdad exacta sobre la columna cifrada.
export function encryptDeterministic(text: string): string {
  const key = getKey();
  const iv = crypto
    .createHmac('sha256', key)
    .update(text, 'utf8')
    .digest()
    .subarray(0, IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return ENCRYPTION_PREFIX + Buffer.concat([iv, encrypted, authTag]).toString('base64');
}

// Desencripta. Si no trae el prefijo, se asume texto plano legacy y se devuelve tal cual.
export function decrypt(data: string): string {
  if (!data.startsWith(ENCRYPTION_PREFIX)) {
    return data;
  }
  const buf = Buffer.from(data.slice(ENCRYPTION_PREFIX.length), 'base64');
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(buf.length - AUTH_TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH, buf.length - AUTH_TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

// Utilidad para la migración: ¿el valor ya está cifrado?
export function isEncrypted(data: string): boolean {
  return data.startsWith(ENCRYPTION_PREFIX);
}