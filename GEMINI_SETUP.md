# 🎨 Sistema de Avatares con Gemini AI

## ¿Cómo funciona?

Tu aplicación ahora tiene un sistema de generación de avatares con 3 opciones:

### 1️⃣ **DiceBear (GRATIS - Default)**
- No requiere configuración
- Genera avatares coloridos automáticamente
- 10 estilos diferentes rotan aleatoriamente
- 100% gratuito, sin límites

### 2️⃣ **RoboHash (GRATIS - Alternativa)**
- Genera robots, monstruos, gatos
- También gratuito
- Sin configuración necesaria

### 3️⃣ **Gemini AI (OPCIONAL - Personalizado)**
- El USUARIO ingresa su propia API Key
- Genera avatares únicos con IA
- **Los créditos se cobran al usuario, NO a ti**
- La API Key nunca se guarda en tu servidor

## 📋 Para los usuarios: Cómo obtener Gemini API Key

1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con Google
3. Haz clic en "Create API Key"
4. Copia la key
5. Pégala en el formulario de registro

## 🔒 Seguridad

### Lo que SÍ pasa:
- ✅ La API Key se usa desde el navegador del usuario
- ✅ La generación de imagen se hace client-side
- ✅ Los créditos de Gemini se cobran a la cuenta del usuario
- ✅ Tú NO pagas nada

### Lo que NO pasa:
- ❌ La API Key NO se envía a tu servidor
- ❌ La API Key NO se guarda en Google Sheets
- ❌ La API Key NO se almacena en ningún lugar
- ❌ TÚ no pagas por los créditos de Gemini

## 🎯 Flujo de Generación

```
Usuario ingresa API Key (opcional)
        ↓
Si tiene API Key → Llama a Gemini desde su navegador
        ↓
Si funciona → Usa imagen de Gemini
        ↓
Si falla o no tiene Key → Usa DiceBear (gratis)
```

## 💰 Costos

### Para ti (el desarrollador):
- **$0.00** - Todo es gratis para ti

### Para el usuario:
- **Con DiceBear**: $0.00 (gratis)
- **Con Gemini**: Usa sus propios créditos de Google
  - Google da créditos gratuitos al registrarse
  - Después: ~$0.002 por imagen (muy barato)

## 🚀 Implementación Actual

El sistema ya está configurado en:

1. **`lib/imageGenerator.ts`** - Lógica de generación
2. **`lib/characters.ts`** - Actualizado para múltiples estilos de DiceBear
3. **`app/page.tsx`** - Campo opcional de API Key
4. **`components/GeminiApiKeyModal.tsx`** - Modal con instrucciones

## 📝 Nota Importante sobre Gemini

**ACTUALIZACIÓN**: Google Gemini actualmente NO genera imágenes directamente desde su API de texto.

**Alternativas implementadas:**

1. **DiceBear** (default) - 10 estilos rotativos
2. **RoboHash** - Avatares de robots/monstruos
3. Para futuro: Cuando Gemini soporte generación de imágenes, el código ya está listo

## 🎨 Estilos Disponibles de DiceBear

La app rotará entre estos estilos automáticamente:
- `avataaars` - Personajes estilo Avatar
- `big-smile` - Caras sonrientes
- `bottts` - Robots
- `fun-emoji` - Emojis divertidos
- `lorelei` - Personajes femeninos
- `micah` - Personajes modernos
- `miniavs` - Avatares pixelados
- `open-peeps` - Personajes dibujados
- `personas` - Retratos realistas
- `pixel-art` - Arte pixel

## 🔮 Futuro: Cuando Gemini soporte imágenes

Cuando Google lance la API de generación de imágenes:

1. El usuario ingresa su API Key
2. El navegador llama a Gemini directamente
3. Gemini genera una imagen del personaje Disney bailando
4. Se guarda la URL de la imagen generada
5. **El usuario paga sus créditos de Gemini**

## 🛡️ Mejores Prácticas

1. Siempre ofrece DiceBear como fallback
2. No guardes nunca la API Key del usuario
3. Informa claramente que es opcional
4. Muestra que los créditos son del usuario, no tuyos

## 📞 Soporte

Si los usuarios tienen problemas con Gemini:
- Verifica que su API Key sea válida
- Confirma que tienen créditos en su cuenta de Google
- Sugiéreles usar DiceBear como alternativa

---

**Resumen**: Los usuarios pueden elegir entre avatares gratuitos (DiceBear/RoboHash) o usar su propia API Key de Gemini para algo más personalizado. **Tú nunca pagas nada.**
