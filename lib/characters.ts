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

// Pares masculino/femenino de cada estilo de baile con género.
// Los estilos neutros (Breakdancer, Vals Master) se omiten a propósito.
const danceStyleByGender: Record<string, { masc: string; fem: string }> = {
  Salsero: { masc: 'Salsero', fem: 'Salsera' },
  Salsera: { masc: 'Salsero', fem: 'Salsera' },
  Bachatero: { masc: 'Bachatero', fem: 'Bachatera' },
  Bachatera: { masc: 'Bachatero', fem: 'Bachatera' },
  Reggaetonero: { masc: 'Reggaetonero', fem: 'Reggaetonera' },
  Reggaetonera: { masc: 'Reggaetonero', fem: 'Reggaetonera' },
  Tanguero: { masc: 'Tanguero', fem: 'Tanguera' },
  Tanguera: { masc: 'Tanguero', fem: 'Tanguera' },
  Flamenco: { masc: 'Flamenco', fem: 'Flamenquera' },
  Flamenquera: { masc: 'Flamenco', fem: 'Flamenquera' },
  Merengüero: { masc: 'Merengüero', fem: 'Merengüera' },
  Merengüera: { masc: 'Merengüero', fem: 'Merengüera' },
  Cumbiambero: { masc: 'Cumbiambero', fem: 'Cumbiambera' },
  Cumbiambera: { masc: 'Cumbiambero', fem: 'Cumbiambera' },
  'Hip Hopero': { masc: 'Hip Hopero', fem: 'Hip Hopera' },
  'Hip Hopera': { masc: 'Hip Hopero', fem: 'Hip Hopera' },
  'Disco King': { masc: 'Disco King', fem: 'Disco Queen' },
  'Disco Queen': { masc: 'Disco King', fem: 'Disco Queen' },
};

// Devuelve el sufijo de estilo de baile de un personaje completo ("Simba Salsero" -> "Salsero").
export function getDanceStyleFromFullName(nombreCompleto: string): string {
  // El estilo siempre es la última palabra o las últimas dos ("Hip Hopero", "Vals Master", "Disco King").
  const longest = [...danceStyles].sort((a, b) => b.length - a.length);
  for (const style of longest) {
    if (nombreCompleto.endsWith(` ${style}`)) {
      return style;
    }
  }
  return '';
}

// Ajusta el estilo de baile de un personaje completo al género del participante.
// "Bestia Salsero" + sexo F -> "Bestia Salsera". Devuelve el nombre sin cambios si el
// estilo es neutro o el género ya coincide.
export function genderCorrectedFullName(nombreCompleto: string, sexo: string): string {
  const style = getDanceStyleFromFullName(nombreCompleto);
  if (!style) return nombreCompleto;

  const pair = danceStyleByGender[style];
  if (!pair) return nombreCompleto; // Estilo neutro (Breakdancer, Vals Master)

  const isFemale = /f|femenino|fem|mujer/i.test(sexo || '');
  const isMale = /m|masculino|mas|hombre/i.test(sexo || '');
  const target = isFemale ? pair.fem : isMale ? pair.masc : null;
  if (!target || target === style) return nombreCompleto;

  const base = nombreCompleto.slice(0, -style.length);
  return base + target;
}

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
