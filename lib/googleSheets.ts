import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { decrypt, encrypt, encryptDeterministic, isEncrypted } from './crypto';
import {
  genderCorrectedFullName,
  getDanceStyleFromFullName,
  getBaseCharacterName,
  isCharacterGenderValid,
  getAppropriateDanceStyle,
  generateAvatar,
  feminineCharacters,
  masculineCharacters,
  disneyCharacters,
} from './characters';
import { getCharacterImageUrl } from './disneyApi';

// Configuración de las credenciales de Google Service Account
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Interfaz para los participantes
export interface Participant {
  nombre: string;
  email: string;
  password: string; // Hash de la contraseña
  regalo1: string;
  regalo2: string;
  regalo3: string;
  personaje: string;
  avatar: string;
  amigoSecreto?: string; // Personaje de quien le toca regalar
  regalosAmigo?: string; // Los 3 regalos de su amigo secreto
  sexo?: string; // Género del participante (columna K): M / F
}

// Función para obtener el documento de Google Sheets
export async function getSheetDocument() {
  try {
    // Obtener credenciales desde variables de entorno
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      throw new Error('Faltan variables de entorno para Google Sheets');
    }

    // Crear instancia de JWT
    const serviceAccountAuth = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: SCOPES,
    });

    // Cargar el documento
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    return doc;
  } catch (error) {
    console.error('Error conectando a Google Sheets:', error);
    throw error;
  }
}

// Función para obtener o crear la hoja de participantes
export async function getParticipantsSheet() {
  const doc = await getSheetDocument();
  
  // Intentar obtener la primera hoja, o crearla
  let sheet = doc.sheetsByIndex[0];
  
  if (!sheet) {
    sheet = await doc.addSheet({ 
      headerValues: [
        'nombre',
        'email',
        'password',
        'regalo1',
        'regalo2',
        'regalo3',
        'personaje',
        'avatar',
        'amigoSecreto',
        'regalosAmigo',
        'sexo'
      ]
    });
  } else {
    // Asegurarse de que tenga los headers correctos sin mover columnas existentes.
    // Si la hoja ya tiene datos con headers antiguos (sin 'password'), las columnas
    // que falten se agregan al final para no corromper las filas existentes.
    const requiredHeaders = [
      'nombre',
      'email',
      'password',
      'regalo1',
      'regalo2',
      'regalo3',
      'personaje',
      'avatar',
      'amigoSecreto',
      'regalosAmigo',
      'sexo'
    ];

    let currentHeaders: string[] = [];
    try {
      await sheet.loadHeaderRow();
      currentHeaders = sheet.headerValues.filter((h) => h && h.trim() !== '');
    } catch {
      // Hoja vacía sin header row
      currentHeaders = [];
    }

    if (currentHeaders.length === 0) {
      await sheet.setHeaderRow(requiredHeaders);
    } else {
      const missing = requiredHeaders.filter((h) => !currentHeaders.includes(h));
      if (missing.length > 0) {
        await sheet.setHeaderRow([...currentHeaders, ...missing]);
      }
    }
  }

  return sheet;
}

// Función para agregar un participante
export async function addParticipant(participant: Participant) {
  const sheet = await getParticipantsSheet();
  // insert: true fuerza INSERT_ROWS. Sin esto la hoja (con fila de encabezado
  // congelada) usa OVERWRITE y el algoritmo de detección de tabla de la API
  // de Sheets confunde el rango, pisando siempre la fila 2 en vez de agregar
  // una fila nueva: cada registro borraba al participante anterior.
  await sheet.addRow(
    {
      ...participant,
      personaje: encryptDeterministic(participant.personaje),
    },
    { insert: true }
  );
}

// Función para obtener todos los participantes
export async function getAllParticipants(): Promise<Participant[]> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    nombre: row.get('nombre') || '',
    email: row.get('email') || '',
    password: row.get('password') || '',
    regalo1: row.get('regalo1') || '',
    regalo2: row.get('regalo2') || '',
    regalo3: row.get('regalo3') || '',
    personaje: decrypt(row.get('personaje') || ''),
    avatar: row.get('avatar') || '',
    amigoSecreto: decrypt(row.get('amigoSecreto') || ''),
    regalosAmigo: decrypt(row.get('regalosAmigo') || ''),
    sexo: row.get('sexo') || '',
  }));
}

// Función para actualizar asignaciones del sorteo
export async function updateDrawAssignments(assignments: { personaje: string; amigoSecreto: string; regalosAmigo: string }[]) {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  for (const assignment of assignments) {
    // El personaje se guarda cifrado de forma determinista, así que se busca
    // por su ciphertext. El fallback a texto plano cubre filas legacy que aún
    // no hayan pasado por la migración de cifrado.
    const storedPersonaje = encryptDeterministic(assignment.personaje);
    const row = rows.find(
      r => r.get('personaje') === storedPersonaje || r.get('personaje') === assignment.personaje
    );
    if (row) {
      row.set('amigoSecreto', encrypt(assignment.amigoSecreto));
      row.set('regalosAmigo', encrypt(assignment.regalosAmigo));
      await row.save();
    }
  }
}

// Migración de una sola vez: cifra los valores legacy en texto plano.
// Idempotente: salta los que ya traen el prefijo de cifrado.
export async function encryptExistingAssignments(): Promise<number> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  let encrypted = 0;
  for (const row of rows) {
    let changed = false;

    const personaje = row.get('personaje') || '';
    if (personaje.trim() !== '' && !isEncrypted(personaje)) {
      row.set('personaje', encryptDeterministic(personaje));
      changed = true;
    }

    const amigo = row.get('amigoSecreto') || '';
    if (amigo.trim() !== '' && !isEncrypted(amigo)) {
      row.set('amigoSecreto', encrypt(amigo));
      changed = true;
    }

    const regalos = row.get('regalosAmigo') || '';
    if (regalos.trim() !== '' && !isEncrypted(regalos)) {
      row.set('regalosAmigo', encrypt(regalos));
      changed = true;
    }

    if (changed) {
      await row.save();
      encrypted++;
    }
  }
  return encrypted;
}

// Función para verificar si ya existen participantes
export async function hasParticipants(): Promise<boolean> {
  const participants = await getAllParticipants();
  return participants.length > 0;
}

// Función para buscar un participante por email
export async function getParticipantByEmail(email: string): Promise<Participant | null> {
  const participants = await getAllParticipants();
  const participant = participants.find(
    (p) => p.email.toLowerCase() === email.toLowerCase()
  );
  return participant || null;
}

// Función para resetear el sorteo (borrar asignaciones pero mantener participantes)
export async function resetDraw() {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  for (const row of rows) {
    row.set('amigoSecreto', '');
    row.set('regalosAmigo', '');
    await row.save();
  }
}

// Migración: ajusta el género del estilo de baile de cada personaje según la columna 'sexo'
// (columna K). Como 'personaje' es la llave de join del sorteo, se actualizan de forma
// consistente también las referencias 'amigoSecreto' para que el círculo del sorteo ya
// realizado no se rompa. Idempotente: las filas cuyo estilo ya coincide con su sexo no cambian.
export async function fixDanceStyleGenderAssignments(): Promise<number> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  // 1) Calcular el mapeo old -> new de cada personaje que necesita cambio.
  const oldToNew = new Map<string, string>();
  const rowPersonaje = new Map<string, { row: typeof rows[0]; sexo: string }>();

  for (const row of rows) {
    const personaje = decrypt(row.get('personaje') || '');
    const sexo = row.get('sexo') || '';
    if (!personaje) continue;
    rowPersonaje.set(personaje, { row, sexo });
    const corrected = genderCorrectedFullName(personaje, sexo);
    if (corrected !== personaje) {
      oldToNew.set(personaje, corrected);
    }
  }

  // 2) Aplicar el nuevo personaje a cada fila (cifrado determinista para que el join siga igual).
  for (const [oldP, newP] of oldToNew) {
    const entry = rowPersonaje.get(oldP);
    if (!entry) continue;
    entry.row.set('personaje', encryptDeterministic(newP));
    await entry.row.save();
  }

  // 3) Remapear las referencias amigoSecreto: si apuntaban al personaje viejo, apuntar al nuevo.
  for (const row of rows) {
    const amigo = decrypt(row.get('amigoSecreto') || '');
    if (!amigo) continue;
    const newAmigo = oldToNew.get(amigo);
    if (newAmigo && newAmigo !== amigo) {
      row.set('amigoSecreto', encrypt(newAmigo));
      await row.save();
    }
  }

  return oldToNew.size;
}

// Migración: reemplaza los avatares legacy de DiceBear por la imagen real de
// Disney de los personajes ya existentes en la hoja (registrados antes de que
// existiera lib/disneyApi.ts). Idempotente: salta filas cuyo avatar ya no es
// de DiceBear y filas donde la API no devuelve imagen.
export async function fixAvatars(): Promise<number> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  let updated = 0;
  for (const row of rows) {
    const personaje = decrypt(row.get('personaje') || '');
    const avatar = row.get('avatar') || '';
    if (!personaje) continue;

    // Solo nos interesa reemplazar los avatares legacy de DiceBear. Los que ya
    // tengan otra imagen (ej. la real de Disney) se dejan intactos.
    if (avatar && !avatar.includes('api.dicebear.com')) continue;

    // Quitar el sufijo de baile ("Simba Salsero" -> "Simba") para buscar por nombre base.
    const style = getDanceStyleFromFullName(personaje);
    const base = style ? personaje.slice(0, -(style.length + 1)) : personaje;

    const disneyAvatar = await getCharacterImageUrl(base);
    if (disneyAvatar && disneyAvatar !== avatar) {
      row.set('avatar', disneyAvatar);
      await row.save();
      updated++;
    }
  }

  return updated;
}

// Migración: corrige duplicados de personajes Disney y desajustes de género (M/F),
// reasignando personajes únicos y acordes al género a cada participante.
// PRESERVA ESTRICTAMENTE EL SORTEO: remapea todas las referencias 'amigoSecreto'
// para que el círculo de regalos y asignaciones permanezca 100% idéntico.
export interface CharacterFixResult {
  totalParticipants: number;
  reassignedCount: number;
  remappedDrawsCount: number;
  changes: {
    nombre: string;
    email: string;
    sexo: string;
    oldPersonaje: string;
    newPersonaje: string;
    reason: string;
  }[];
}

export async function fixDuplicatesAndGenderAssignments(): Promise<CharacterFixResult> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  // 1) Leer y desencriptar la información de cada participante
  const participantsData = rows.map((row) => {
    const rawPersonaje = row.get('personaje') || '';
    const decryptedPersonaje = decrypt(rawPersonaje);
    const sexo = (row.get('sexo') || '').trim();
    const base = getBaseCharacterName(decryptedPersonaje);
    const email = row.get('email') || '';
    const nombre = row.get('nombre') || '';

    return {
      row,
      rawPersonaje,
      decryptedPersonaje,
      sexo,
      base,
      email,
      nombre,
    };
  });

  // Trackear personajes base que se mantienen ocupados
  const usedBaseCharacters = new Set<string>();
  const oldToNew = new Map<string, string>();
  const changes: CharacterFixResult['changes'] = [];

  // 2) Primera pasada: Validar quiénes conservan su personaje base
  // Solo lo conservan si el género coincide Y no es duplicado de una fila anterior
  const pendingReassignment: typeof participantsData = [];

  for (const p of participantsData) {
    if (!p.decryptedPersonaje) continue;

    const isGenderValid = isCharacterGenderValid(p.base, p.sexo);
    const isDuplicate = usedBaseCharacters.has(p.base);

    if (isGenderValid && !isDuplicate) {
      // Conserva su personaje base
      usedBaseCharacters.add(p.base);

      // Asegurar que el sufijo de estilo de baile coincida con su género
      const correctedFullName = genderCorrectedFullName(p.decryptedPersonaje, p.sexo);
      if (correctedFullName !== p.decryptedPersonaje) {
        oldToNew.set(p.decryptedPersonaje, correctedFullName);
        changes.push({
          nombre: p.nombre,
          email: p.email,
          sexo: p.sexo,
          oldPersonaje: p.decryptedPersonaje,
          newPersonaje: correctedFullName,
          reason: 'Ajuste de género en estilo de baile',
        });
      }
    } else {
      pendingReassignment.push(p);
    }
  }

  // 3) Segunda pasada: Reasignar personajes únicos y acordes al género
  for (const p of pendingReassignment) {
    const isFemale = /f|femenino|fem|mujer/i.test(p.sexo);
    const isMale = /m|masculino|mas|hombre/i.test(p.sexo);
    const pool = isFemale ? feminineCharacters : isMale ? masculineCharacters : disneyCharacters;

    // Buscar disponibles en el pool de su género que no estén usados
    const available = pool.filter((char) => !usedBaseCharacters.has(char));
    if (available.length === 0) {
      throw new Error(`No hay suficientes personajes Disney disponibles para el género ${p.sexo}`);
    }

    // Elegir el primer personaje disponible
    const newBase = available[0];
    usedBaseCharacters.add(newBase);

    // Obtener estilo de baile apropiado
    const style = getAppropriateDanceStyle(p.decryptedPersonaje, p.sexo);
    const newFullName = `${newBase} ${style}`;

    // Obtener avatar Disney real
    const disneyAvatar = await getCharacterImageUrl(newBase);
    const avatar = disneyAvatar || generateAvatar(newFullName);

    oldToNew.set(p.decryptedPersonaje, newFullName);

    p.row.set('personaje', encryptDeterministic(newFullName));
    p.row.set('avatar', avatar);

    const isGenderValid = isCharacterGenderValid(p.base, p.sexo);
    const reason = !isGenderValid
      ? `Género incorrecto (${p.base} no coincide con sexo ${p.sexo})`
      : `Personaje duplicado (${p.base} ya estaba asignado)`;

    changes.push({
      nombre: p.nombre,
      email: p.email,
      sexo: p.sexo,
      oldPersonaje: p.decryptedPersonaje,
      newPersonaje: newFullName,
      reason,
    });
  }

  // 4) Tercera pasada: Actualizar filas que conservaron personaje si cambió su sufijo o avatar
  for (const p of participantsData) {
    if (pendingReassignment.includes(p)) continue;

    const newFullName = oldToNew.get(p.decryptedPersonaje) || p.decryptedPersonaje;

    // Asegurar cifrado determinista
    p.row.set('personaje', encryptDeterministic(newFullName));

    // Actualizar avatar a imagen real de Disney si está usando DiceBear o está vacío
    const currentAvatar = p.row.get('avatar') || '';
    if (!currentAvatar || currentAvatar.includes('api.dicebear.com')) {
      const disneyAvatar = await getCharacterImageUrl(p.base);
      if (disneyAvatar) {
        p.row.set('avatar', disneyAvatar);
      }
    }
  }

  // 5) Cuarta pasada: PRESERVAR EL SORTEO
  // Remapear cualquier referencia en 'amigoSecreto' que apuntaba al personaje viejo
  let remappedDrawsCount = 0;
  for (const row of rows) {
    const rawAmigo = row.get('amigoSecreto') || '';
    if (rawAmigo.trim() !== '') {
      const decryptedAmigo = decrypt(rawAmigo);
      const newAmigo = oldToNew.get(decryptedAmigo) || decryptedAmigo;
      if (newAmigo !== decryptedAmigo || !isEncrypted(rawAmigo)) {
        row.set('amigoSecreto', encrypt(newAmigo));
        remappedDrawsCount++;
      }
    }

    const rawRegalos = row.get('regalosAmigo') || '';
    if (rawRegalos.trim() !== '' && !isEncrypted(rawRegalos)) {
      row.set('regalosAmigo', encrypt(rawRegalos));
    }

    await row.save();
  }

  return {
    totalParticipants: rows.length,
    reassignedCount: changes.length,
    remappedDrawsCount,
    changes,
  };
}

// Función para limpiar todo (borrar todos los participantes)
export async function clearAllData() {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  // Borrar todas las filas
  for (const row of rows) {
    await row.delete();
  }
}
