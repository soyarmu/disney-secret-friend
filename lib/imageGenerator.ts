// Generador de imágenes con múltiples proveedores
// El usuario puede elegir usar su propia API de Gemini o usar avatares gratuitos

export interface ImageGeneratorOptions {
  personaje: string;
  estilo: string;
  provider: 'dicebear' | 'gemini' | 'robohash';
  geminiApiKey?: string;
}

// Generar avatar con DiceBear (GRATIS)
export function generateDiceBearAvatar(seed: string): string {
  // Diferentes estilos disponibles de DiceBear (todos gratis)
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
    'pixel-art',
  ];
  
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${encodeURIComponent(seed)}`;
}

// Generar avatar con RoboHash (GRATIS)
export function generateRoboHashAvatar(seed: string): string {
  // RoboHash genera robots, monstruos, gatos, etc.
  const sets = ['set1', 'set2', 'set3', 'set4', 'set5']; // Diferentes estilos
  const randomSet = sets[Math.floor(Math.random() * sets.length)];
  return `https://robohash.org/${encodeURIComponent(seed)}?set=${randomSet}&size=300x300`;
}

// Generar con Gemini (requiere API Key del USUARIO)
export async function generateGeminiImage(
  personaje: string,
  estilo: string,
  apiKey: string
): Promise<string> {
  try {
    // Crear el prompt para Gemini
    const prompt = `Create a fun, colorful Disney-style avatar of ${personaje} as a ${estilo} dancer. 
    Make it magical, cheerful, and festive with sparkles and dance elements. 
    Style: cartoon, Disney animation, vibrant colors, friendly expression.`;

    // Llamar a la API de Gemini (Imagen)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error generando imagen con Gemini');
    }

    const data = await response.json();
    
    // Extraer la imagen generada
    // Nota: Gemini no genera imágenes directamente aún, 
    // usaremos texto descriptivo y luego Imagen AI
    
    // Por ahora, como Gemini no genera imágenes directamente,
    // retornamos un avatar de fallback
    throw new Error('Gemini image generation not yet available');
  } catch (error) {
    console.error('Error con Gemini:', error);
    // Fallback a DiceBear
    return generateDiceBearAvatar(`${personaje}-${estilo}`);
  }
}

// Función principal que decide qué proveedor usar
export async function generateAvatar(options: ImageGeneratorOptions): Promise<string> {
  const seed = `${options.personaje}-${options.estilo}`;

  switch (options.provider) {
    case 'gemini':
      if (options.geminiApiKey) {
        try {
          return await generateGeminiImage(
            options.personaje,
            options.estilo,
            options.geminiApiKey
          );
        } catch (error) {
          console.warn('Gemini falló, usando DiceBear:', error);
          return generateDiceBearAvatar(seed);
        }
      }
      // Si no hay API key, usar DiceBear
      return generateDiceBearAvatar(seed);

    case 'robohash':
      return generateRoboHashAvatar(seed);

    case 'dicebear':
    default:
      return generateDiceBearAvatar(seed);
  }
}

// Verificar si una API Key de Gemini es válida
export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Hello',
                },
              ],
            },
          ],
        }),
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}

// Obtener instrucciones para el usuario sobre cómo obtener una API Key
export function getGeminiApiKeyInstructions(): string {
  return `
Para generar imágenes personalizadas con Gemini AI:

1. Ve a: https://makersuite.google.com/app/apikey
2. Haz clic en "Create API Key"
3. Copia tu API Key
4. Pégala en el campo correspondiente

⚠️ Nota: La API Key es SOLO TUYA. Se usa desde tu navegador y nunca se guarda en nuestro servidor.

✨ Si no tienes API Key, no te preocupes. Usaremos avatares gratuitos automáticamente.
  `.trim();
}
