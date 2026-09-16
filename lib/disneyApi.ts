// Helper para obtener la imagen real de un personaje Disney desde la API de Disney.
// Documentación: https://disneyapi.dev/

const DISNEY_API_URL = 'https://api.disneyapi.dev/character';
const FETCH_TIMEOUT_MS = 4000;

// Quita diacríticos y normaliza (ej. "Timón" -> "Timon", "Úrsula" -> "Ursula").
export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar acentos/combining marks
    .trim();
}

// La API de Disney usa nombres en inglés. Mapeo español -> inglés para los
// personajes de lib/characters.ts cuyo nombre no matchea directamente.
const DISNEY_NAME_MAP: Record<string, string> = {
  'Pato Donald': 'Donald Duck',
  Daisy: 'Daisy Duck',
  Timón: 'Timon',
  Pumba: 'Pumbaa',
  Úrsula: 'Ursula',
  Bella: 'Belle',
  Bestia: 'Beast',
  Cenicienta: 'Cinderella',
  Blancanieves: 'Snow White',
  Hércules: 'Hercules',
  Tarzán: 'Tarzan',
  Campanita: 'Tinker Bell',
  'Capitán Garfio': 'Captain Hook',
  Héctor: 'Hector',
  Alegría: 'Joy',
  Tristeza: 'Sadness',
  'Mr. Increíble': 'Mr. Incredible',
  'Rayo McQueen': 'Lightning McQueen',
  Mate: 'Mater',
  Alicia: 'Alice',
  'Sombrerero Loco': 'Mad Hatter',
  'Gato de Cheshire': 'Cheshire Cat',
};

// Cache en memoria por nombre normalizado para no repetir llamadas a la API.
const imageCache = new Map<string, string | null>();

// Resuelve el nombre de personaje a la query en inglés para la API.
function resolveQueryName(name: string): string {
  const trimmed = name.trim();
  const mapped = DISNEY_NAME_MAP[trimmed] ?? trimmed;
  return normalizeName(mapped);
}

interface DisneyCharacter {
  name?: string;
  imageUrl?: string;
}

async function fetchDisneyCharacters(query: string): Promise<DisneyCharacter[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(
      `${DISNEY_API_URL}?name=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );
    if (!response.ok) return [];
    const json = await response.json();
    const data = json?.data;
    return Array.isArray(data) ? (data as DisneyCharacter[]) : [];
  } catch (error) {
    console.error('Error consultando Disney API:', error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// Elige la mejor imagen entre los resultados.
// Prioridad: nombre exacto + "Profile_" -> nombre exacto -> primer resultado con imagen.
function pickBestImage(results: DisneyCharacter[], query: string): string | null {
  const withImage = results.filter((r) => r.imageUrl);
  if (withImage.length === 0) return null;

  const q = normalizeName(query).toLowerCase();
  const exact = withImage.filter(
    (r) => normalizeName(r.name ?? '').toLowerCase() === q
  );

  const pool = exact.length > 0 ? exact : withImage;
  const profile = pool.find((r) => r.imageUrl!.includes('Profile_'));
  return (profile ?? pool[0]).imageUrl ?? null;
}

// Obtiene la imagen real del personaje, o null si no se encuentra.
export async function getCharacterImageUrl(name: string): Promise<string | null> {
  const query = resolveQueryName(name);
  const cacheKey = query.toLowerCase();
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey) ?? null;

  const results = await fetchDisneyCharacters(query);
  const imageUrl = pickBestImage(results, query);
  imageCache.set(cacheKey, imageUrl);
  return imageUrl;
}