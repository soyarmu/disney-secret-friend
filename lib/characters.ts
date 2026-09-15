// Lista de personajes Disney
export const disneyCharacters = [
  'Mickey Mouse',
  'Minnie Mouse',
  'Pato Donald',
  'Daisy',
  'Goofy',
  'Pluto',
  'Simba',
  'Mufasa',
  'Timón',
  'Pumba',
  'Scar',
  'Mulan',
  'Ariel',
  'Úrsula',
  'Bella',
  'Bestia',
  'Jasmine',
  'Aladdin',
  'Elsa',
  'Anna',
  'Olaf',
  'Moana',
  'Maui',
  'Rapunzel',
  'Flynn Rider',
  'Cenicienta',
  'Blancanieves',
  'Aurora',
  'Woody',
  'Buzz Lightyear',
  'Jessie',
  'Rex',
  'Mike Wazowski',
  'Sulley',
  'Boo',
  'Nemo',
  'Dory',
  'Stitch',
  'Hércules',
  'Hades',
  'Tarzán',
  'Peter Pan',
  'Campanita',
  'Capitán Garfio',
  'Bruno Madrigal',
  'Héctor',
  'Alegría',
  'Tristeza',
  'Mr. Increíble',
  'Elastigirl',
  'Rayo McQueen',
  'Mate',
  'Alicia',
  'Sombrerero Loco',
  'Gato de Cheshire',
  'Winnie the Pooh',
  'Tigger',
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
  'Flamenquera',
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

// Función para generar avatar usando DiceBear API (GRATIS)
function generateAvatar(seed: string): string {
  // Diferentes estilos de DiceBear disponibles (todos gratuitos)
  const styles = [
    'avataaars',
    'big-smile', 
    'bottts',
    'fun-emoji',
    'lorelei',
    'micah',
    'miniavs',
    'open-peeps',
    'personas',
    'pixel-art'
  ];
  
  // Seleccionar un estilo aleatorio basado en el seed
  const styleIndex = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % styles.length;
  const selectedStyle = styles[styleIndex];
  
  return `https://api.dicebear.com/7.x/${selectedStyle}/svg?seed=${encodeURIComponent(seed)}`;
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
