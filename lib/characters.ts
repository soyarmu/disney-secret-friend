// Lista de personajes Disney
export const disneyCharacters = [
  'Mickey Mouse',
  'Minnie Mouse',
  'Donald Duck',
  'Goofy',
  'Pluto',
  'Simba',
  'Nala',
  'Timon',
  'Pumba',
  'Mulan',
  'Mushu',
  'Ariel',
  'Sebastian',
  'Flounder',
  'Bella',
  'Bestia',
  'Lumière',
  'Jasmine',
  'Aladdin',
  'Genio',
  'Elsa',
  'Anna',
  'Olaf',
  'Kristoff',
  'Moana',
  'Maui',
  'Rapunzel',
  'Flynn Rider',
  'Tiana',
  'Naveen',
  'Pocahontas',
  'Meeko',
  'Merida',
  'Cenicienta',
  'Blancanieves',
  'Aurora',
  'Woody',
  'Buzz Lightyear',
  'Mike Wazowski',
  'Sulley',
  'Nemo',
  'Dory',
  'Stitch',
  'Lilo',
  'Hercules',
  'Megara',
  'Tarzan',
  'Jane',
  'Peter Pan',
  'Campanita',
];

// Lista de estilos de baile
export const danceStyles = [
  'Salsero',
  'Salsera',
  'Bachatero',
  'Bachatera',
  'Reggaetonero',
  'Reggaetonera',
  'Breakdancer',
  'Tanguero',
  'Tanguera',
  'Flamenco',
  'Merengüero',
  'Merengüera',
  'Cumbiambero',
  'Cumbiambera',
  'Hip Hopero',
  'Hip Hopera',
  'Vals Master',
  'Disco King',
  'Disco Queen',
];

// Interfaz para la combinación de personaje bailarín
export interface DancingCharacter {
  personaje: string;
  estilobaile: string;
  nombreCompleto: string; // Ej: "Simba Salsero"
  avatar: string;
}

// Array para trackear combinaciones ya usadas
let usedCombinations: Set<string> = new Set();

// Función para generar avatar usando DiceBear API
function generateAvatar(seed: string): string {
  // Usamos la API de DiceBear con el estilo "fun-emoji" o "avataaars"
  return `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(seed)}`;
}

// Función para obtener una combinación única aleatoria
export function getRandomDancingCharacter(existingCharacters: string[]): DancingCharacter {
  // Actualizar el set de combinaciones usadas
  usedCombinations = new Set(existingCharacters);

  // Crear todas las combinaciones posibles que no han sido usadas
  const availableCombinations: DancingCharacter[] = [];

  for (const character of disneyCharacters) {
    for (const style of danceStyles) {
      const nombreCompleto = `${character} ${style}`;
      
      if (!usedCombinations.has(nombreCompleto)) {
        availableCombinations.push({
          personaje: character,
          estilobaile: style,
          nombreCompleto,
          avatar: generateAvatar(nombreCompleto),
        });
      }
    }
  }

  // Si no hay combinaciones disponibles, lanzar error
  if (availableCombinations.length === 0) {
    throw new Error('No hay más combinaciones de personajes disponibles');
  }

  // Seleccionar una combinación aleatoria
  const randomIndex = Math.floor(Math.random() * availableCombinations.length);
  const selected = availableCombinations[randomIndex];

  // Marcar como usada
  usedCombinations.add(selected.nombreCompleto);

  return selected;
}

// Función para resetear las combinaciones usadas (útil para testing)
export function resetUsedCombinations() {
  usedCombinations.clear();
}

// Función para obtener el total de combinaciones posibles
export function getTotalCombinations(): number {
  return disneyCharacters.length * danceStyles.length;
}

// Validar que haya suficientes combinaciones
export function hasAvailableCombinations(existingCount: number): boolean {
  return existingCount < getTotalCombinations();
}
