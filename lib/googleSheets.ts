import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Configuración de las credenciales de Google Service Account
const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

// Interfaz para los participantes
export interface Participant {
  nombre: string;
  email: string;
  regalo1: string;
  regalo2: string;
  regalo3: string;
  personaje: string;
  avatar: string;
  amigoSecreto?: string; // Personaje de quien le toca regalar
  regalosAmigo?: string; // Los 3 regalos de su amigo secreto
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
        'regalo1',
        'regalo2',
        'regalo3',
        'personaje',
        'avatar',
        'amigoSecreto',
        'regalosAmigo'
      ]
    });
  } else {
    // Asegurarse de que tenga los headers correctos
    await sheet.setHeaderRow([
      'nombre',
      'email',
      'regalo1',
      'regalo2',
      'regalo3',
      'personaje',
      'avatar',
      'amigoSecreto',
      'regalosAmigo'
    ]);
  }

  return sheet;
}

// Función para agregar un participante
export async function addParticipant(participant: Participant) {
  const sheet = await getParticipantsSheet();
  await sheet.addRow(participant);
}

// Función para obtener todos los participantes
export async function getAllParticipants(): Promise<Participant[]> {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();
  
  return rows.map(row => ({
    nombre: row.get('nombre') || '',
    email: row.get('email') || '',
    regalo1: row.get('regalo1') || '',
    regalo2: row.get('regalo2') || '',
    regalo3: row.get('regalo3') || '',
    personaje: row.get('personaje') || '',
    avatar: row.get('avatar') || '',
    amigoSecreto: row.get('amigoSecreto') || '',
    regalosAmigo: row.get('regalosAmigo') || '',
  }));
}

// Función para actualizar asignaciones del sorteo
export async function updateDrawAssignments(assignments: { personaje: string; amigoSecreto: string; regalosAmigo: string }[]) {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  for (const assignment of assignments) {
    const row = rows.find(r => r.get('personaje') === assignment.personaje);
    if (row) {
      row.set('amigoSecreto', assignment.amigoSecreto);
      row.set('regalosAmigo', assignment.regalosAmigo);
      await row.save();
    }
  }
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

// Función para limpiar todo (borrar todos los participantes)
export async function clearAllData() {
  const sheet = await getParticipantsSheet();
  const rows = await sheet.getRows();

  // Borrar todas las filas
  for (const row of rows) {
    await row.delete();
  }
}
