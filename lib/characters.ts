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

// Lista de personajes Disney masculinos (para asignación según género)
export const masculineCharacters = [
  'Mickey Mouse',
  'Pato Donald',
  'Goofy',
  'Pluto',
  'Simba',
  'Mufasa',
  'Timón',
  'Pumba',
  'Scar',
  'Bestia',
  'Aladdin',
  'Olaf',
  'Maui',
  'Flynn Rider',
  'Woody',
  'Buzz Lightyear',
  'Rex',
  'Mike Wazowski',
  'Sulley',
  'Nemo',
  'Stitch',
  'Hércules',
  'Hades',
  'Tarzán',
  'Peter Pan',
  'Capitán Garfio',
  'Bruno Madrigal',
  'Héctor',
  'Mr. Increíble',
  'Rayo McQueen',
  'Mate',
  'Sombrerero Loco',
  'Gato de Cheshire',
  'Winnie the Pooh',
  'Tigger',
];

// Lista de personajes Disney femeninos (para asignación según género)
export const feminineCharacters = [
  'Minnie Mouse',
  'Daisy',
  'Mulan',
  'Ariel',
  'Úrsula',
  'Bella',
  'Jasmine',
  'Elsa',
  'Anna',
  'Moana',
  'Rapunzel',
  'Cenicienta',
  'Blancanieves',
  'Aurora',
  'Jessie',
  'Boo',
  'Dory',
  'Campanita',
  'Alegría',
  'Tristeza',
  'Elastigirl',
  'Alicia',
];

// Danzas canónicas con sus variantes masculina/femenina.
// UNA sola entrada por danza: Cumbia -> { Cumbiambero, Cumbiambera }, sin duplicar.
// Los estilos neutros (Breakdancer, Vals Master) usan la misma forma en ambos géneros.
const danceStyleByGender: Record<string, { base: string; masc: string; fem: string }> = {
  Salsa: { base: 'Salsa', masc: 'Salsero', fem: 'Salsera' },
  Bachata: { base: 'Bachata', masc: 'Bachatero', fem: 'Bachatera' },
  Reggaeton: { base: 'Reggaeton', masc: 'Reggaetonero', fem: 'Reggaetonera' },
  Tango: { base: 'Tango', masc: 'Tanguero', fem: 'Tanguera' },
  Flamenco: { base: 'Flamenco', masc: 'Flamenco', fem: 'Flamenquera' },
  Merengue: { base: 'Merengue', masc: 'Merengüero', fem: 'Merengüera' },
  Cumbia: { base: 'Cumbia', masc: 'Cumbiambero', fem: 'Cumbiambera' },
  'Hip Hop': { base: 'Hip Hop', masc: 'Hip Hopero', fem: 'Hip Hopera' },
  Disco: { base: 'Disco', masc: 'Disco King', fem: 'Disco Queen' },
  Breakdance: { base: 'Breakdance', masc: 'Breakdancer', fem: 'Breakdancer' },
  Vals: { base: 'Vals', masc: 'Vals Master', fem: 'Vals Master' },
};

// Todas las variantes posibles, para reconocer un estilo dentro de un nombre completo.
export const danceStyles: string[] = Object.values(danceStyleByGender).flatMap(({ masc, fem }) =>
  masc === fem ? [masc] : [masc, fem]
);

// Lookup variante -> { masc, fem } (derivado de una sola fuente, sin duplicados a mano).
const variantToPair = new Map<string, { masc: string; fem: string }>();
for (const { masc, fem } of Object.values(danceStyleByGender)) {
  variantToPair.set(masc, { masc, fem });
  variantToPair.set(fem, { masc, fem });
}

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

  const pair = variantToPair.get(style);
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

// Función para obtener una combinación única aleatoria.
// Según el sexo del participante filtra el pool de personajes:
//   M -> masculino, F -> femenino, O/sin valor -> cualquiera.
export function getRandomDancingCharacter(existingCharacters: string[], sexo?: string): DancingCharacter {
  // Actualizar el set de combinaciones usadas
  usedCombinations = new Set(existingCharacters);

  // Seleccionar el pool de personajes según el género
  const s = (sexo || '').toUpperCase();
  const isFemale = s === 'F';
  const isMale = s === 'M';
  const pool =
    isMale ? masculineCharacters :
    isFemale ? feminineCharacters :
    disneyCharacters;

  // Crear todas las combinaciones posibles que no han sido usadas.
  // El estilo de baile se elige acorde al género: mujer -> forma femenina (Cumbiambera),
  // hombre -> forma masculina (Cumbiambero). Así nunca se asigna un género incorrecto.
  const availableCombinations: DancingCharacter[] = [];

  for (const character of pool) {
    for (const { masc, fem } of Object.values(danceStyleByGender)) {
      const style = isFemale ? fem : isMale ? masc : Math.random() < 0.5 ? masc : fem;
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

  // Si no hay combinaciones disponibles en el pool filtrado, lanzar error
  if (availableCombinations.length === 0) {
    throw new Error('No hay más combinaciones de personajes disponibles para tu género');
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
  return disneyCharacters.length * Object.keys(danceStyleByGender).length;
}

// Validar que haya suficientes combinaciones
export function hasAvailableCombinations(existingCount: number): boolean {
  return existingCount < getTotalCombinations();
}
