import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { decrypt, encrypt, encryptDeterministic, isEncrypted } from './crypto';
import { genderCorrectedFullName } from './characters';

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
    amigoSecreto: row.get('amigoSecreto') || '',
    regalosAmigo: row.get('regalosAmigo') || '',
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

// Función para limpiar todo (borrar todos los participantes)
export async function clearAllData() {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  // Borrar todas las filas
  for (const row of rows) {
    await row.delete();
  }
}
