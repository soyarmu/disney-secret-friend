# 🎭✨ Amigo Secreto - Disney Bailarín

Una aplicación mágica de Secret Santa con temática Disney donde cada participante recibe un personaje bailarín único como identidad secreta.

## 🌟 Características

- **Registro Interactivo**: Formulario con animaciones mágicas estilo Disney
- **Identidades Únicas**: Combinación aleatoria de 50 personajes Disney + 20 estilos de baile (1000 combinaciones)
- **Sorteo Perfecto**: Algoritmo circular que garantiza que nadie se regale a sí mismo
- **Sin Base de Datos**: Usa Google Sheets como almacenamiento (perfecto para Vercel)
- **UI Mágica**: Diseño con gradientes, animaciones y efectos visuales inspirados en Disney

## 🚀 Tecnologías

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Animaciones**: Framer Motion
- **Base de Datos**: Google Sheets API
- **Deployment**: Vercel

## 📦 Instalación

1. **Clona el repositorio**:
```bash
git clone <tu-repositorio>
cd SecretFriend
```

2. **Instala las dependencias**:
```bash
npm install
```

3. **Configura las variables de entorno** (ver sección de configuración abajo)

4. **Ejecuta el servidor de desarrollo**:
```bash
npm run dev
```

5. **Abre en tu navegador**:
```
http://localhost:3000
```

## ⚙️ Configuración de Google Sheets API

### Paso 1: Crear un Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "Amigo Secreto Disney"

### Paso 2: Habilitar Google Sheets API

1. En el menú lateral, ve a **"APIs & Services"** → **"Library"**
2. Busca **"Google Sheets API"**
3. Haz clic en **"Enable"** (Habilitar)

### Paso 3: Crear Service Account (Cuenta de Servicio)

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"Create Credentials"** → **"Service Account"**
3. Dale un nombre como "secret-santa-service"
4. Haz clic en **"Create and Continue"**
5. Asigna el rol **"Editor"** (opcional, puedes dejarlo sin rol)
6. Haz clic en **"Done"**

### Paso 4: Generar la Clave Privada (Private Key)

1. En la página de Credentials, encuentra tu Service Account recién creado
2. Haz clic en el email del Service Account
3. Ve a la pestaña **"Keys"**
4. Haz clic en **"Add Key"** → **"Create new key"**
5. Selecciona **"JSON"** y haz clic en **"Create"**
6. Se descargará automáticamente un archivo JSON con tus credenciales

### Paso 5: Crear tu Google Spreadsheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Dale un nombre como "Amigo Secreto Disney - Participantes"
4. Copia el **ID del Spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit
   ```

### Paso 6: Compartir el Sheet con el Service Account

**MUY IMPORTANTE**: Debes dar acceso al Service Account

1. En tu Google Sheet, haz clic en el botón **"Compartir"** (Share)
2. Pega el **email del Service Account** (lo encuentras en el archivo JSON descargado, campo `client_email`)
3. Asegúrate de darle permisos de **"Editor"**
4. Haz clic en **"Enviar"** (o desmarca la opción de notificar)

### Paso 7: Configurar Variables de Entorno

1. **Crea un archivo `.env.local`** en la raíz del proyecto:

```bash
cp .env.example .env.local
```

2. **Abre el archivo JSON descargado** y extrae los valores:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@tu-proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA_COMPLETA\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=el-id-de-tu-spreadsheet
```

**IMPORTANTE sobre GOOGLE_PRIVATE_KEY**:
- Copia el valor completo del campo `private_key` del archivo JSON
- Debe incluir `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`
- Mantén los `\n` (saltos de línea) tal como están
- Encierra todo entre comillas dobles

Ejemplo:
```env
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## 🚢 Deployment en Vercel

### 1. Conecta tu Repositorio

1. Ve a [Vercel](https://vercel.com)
2. Haz clic en **"Import Project"**
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona el proyecto

### 2. Configura las Variables de Entorno en Vercel

1. En la página de configuración del proyecto, ve a **"Environment Variables"**
2. Agrega las 3 variables una por una:

   - **Name**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
     - **Value**: `tu-service-account@tu-proyecto.iam.gserviceaccount.com`

   - **Name**: `GOOGLE_PRIVATE_KEY`
     - **Value**: Pega toda la clave privada (incluyendo `-----BEGIN` y `-----END`)
     - **IMPORTANTE**: Vercel maneja automáticamente los saltos de línea

   - **Name**: `GOOGLE_SPREADSHEET_ID`
     - **Value**: `el-id-de-tu-spreadsheet`

3. Marca las 3 variables para todos los entornos (Production, Preview, Development)

### 3. Deploy

1. Haz clic en **"Deploy"**
2. Espera a que termine el build (1-2 minutos)
3. ¡Tu aplicación estará en línea! 🎉

### 4. Verifica que Funcione

1. Abre la URL de tu deployment
2. Registra un participante de prueba
3. Ve a la ruta `/admin` y verifica que puedas ver las estadísticas
4. Revisa tu Google Sheet - debe tener una nueva fila con los datos

## 📁 Estructura del Proyecto

```
SecretFriend/
├── app/
│   ├── api/
│   │   ├── register/
│   │   │   └── route.ts          # Endpoint de registro
│   │   └── draw/
│   │       └── route.ts          # Endpoint de sorteo
│   ├── admin/
│   │   └── page.tsx              # Página de administración
│   ├── page.tsx                  # Página principal (registro)
│   ├── layout.tsx                # Layout global
│   └── globals.css               # Estilos globales
├── lib/
│   ├── googleSheets.ts           # Utilidad para Google Sheets API
│   └── characters.ts             # Personajes y estilos de baile
├── .env.example                  # Ejemplo de variables de entorno
├── .env.local                    # Variables de entorno (NO SUBIR A GIT)
├── package.json                  # Dependencias
├── tailwind.config.ts            # Configuración de Tailwind
└── README.md                     # Este archivo
```

## 🎮 Uso de la Aplicación

### Para Participantes:

1. **Accede a la página principal**: `https://tu-dominio.vercel.app`
2. **Completa el formulario**:
   - Tu nombre real
   - Tu email
   - Una contraseña (mínimo 6 caracteres) para consultar tu amigo secreto después
   - 3 opciones de regalo que te gustarían recibir
3. **Haz clic en "Registrarme"**
4. **¡Descubre tu identidad secreta!** Verás tu personaje Disney bailarín asignado

### Para Administradores:

1. **Accede al panel de admin**: `https://tu-dominio.vercel.app/admin`
2. **Verifica las estadísticas**:
   - Total de participantes registrados
   - Estado del sorteo
3. **Cuando todos se hayan registrado**:
   - Haz clic en **"Hacer Magia y Sortear"**
   - Confirma la acción
   - El sistema asignará automáticamente los amigos secretos
4. **Revisa los resultados** en el Google Sheet

## 📊 Estructura del Google Sheet

La aplicación creará automáticamente estas columnas:

| nombre | email | password | regalo1 | regalo2 | regalo3 | personaje | avatar | amigoSecreto | regalosAmigo |
|--------|-------|----------|---------|---------|---------|-----------|--------|--------------|--------------|
| María | maria@example.com | $2b$10$... (hash bcrypt) | Libro | Audífonos | Skincare | Simba Salsero | https://... | Mulan Bachatera | 1. Café \| 2. Vela \| 3. Planta |

> Si ya tenías una hoja con datos antes de agregar contraseñas, la columna `password` se agrega automáticamente al final sin mover las columnas existentes. Los participantes registrados antes de este cambio no tienen contraseña y deberán registrarse de nuevo (o el admin puede limpiar la hoja desde `/admin`).

## 🔐 Seguridad

- **Nunca subas el archivo `.env.local` a Git** (ya está en `.gitignore`)
- **Nunca compartas tu archivo JSON de credenciales**
- Las credenciales en Vercel están cifradas
- Solo el Service Account tiene acceso al Google Sheet

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno para Google Sheets"

- Verifica que las 3 variables estén configuradas en Vercel
- Asegúrate de que `GOOGLE_PRIVATE_KEY` incluya los saltos de línea (`\n`)
- Redeploya la aplicación después de agregar las variables

### Error: "No permission to access spreadsheet"

- Verifica que hayas compartido el Google Sheet con el email del Service Account
- El Service Account debe tener permisos de "Editor"

### Error: "Invalid grant" o "Unauthorized"

- Verifica que el `GOOGLE_PRIVATE_KEY` esté completo (incluyendo BEGIN y END)
- Asegúrate de que no haya espacios extra o saltos de línea incorrectos

### La aplicación no guarda datos

- Abre la consola del navegador (F12) y revisa los errores
- Verifica que el `GOOGLE_SPREADSHEET_ID` sea correcto
- Comprueba que Google Sheets API esté habilitada en Google Cloud Console

## 🎨 Personalización

### Cambiar Personajes o Estilos de Baile

Edita el archivo `lib/characters.ts`:

```typescript
export const disneyCharacters = [
  'Tu Personaje 1',
  'Tu Personaje 2',
  // ...
];

export const danceStyles = [
  'Tu Estilo 1',
  'Tu Estilo 2',
  // ...
];
```

### Cambiar Colores del Tema

Edita `tailwind.config.ts`:

```typescript
colors: {
  disney: {
    blue: "#tu-color",
    gold: "#tu-color",
    // ...
  },
}
```

## 🔐 Seguridad

Este proyecto implementa múltiples capas de seguridad:

- ✅ **Autenticación con Contraseña**: Cada usuario crea su contraseña al registrarse
- ✅ **Contraseñas Hasheadas**: Usando bcrypt (nunca en texto plano)
- ✅ **Rate Limiting**: Protección contra ataques de fuerza bruta
- ✅ **Validación de Inputs**: Sanitización contra XSS e inyecciones
- ✅ **Headers HTTP Seguros**: CSP, X-Frame-Options, etc.
- ✅ **Detección de Bots**: Bloqueo de scrapers maliciosos
- ✅ **Protección de Credenciales**: Variables de entorno nunca en el código
- ✅ **GitHub Security**: CODEOWNERS, Secret Scanning, Dependabot

### Seguridad de Contraseñas

- Los usuarios crean su contraseña al registrarse (mínimo 6 caracteres)
- Las contraseñas se hashean con bcrypt (salt rounds: 10)
- Se requiere email + contraseña para ver el amigo secreto
- El admin tiene sus propias credenciales separadas

Para más detalles, consulta [SECURITY.md](./SECURITY.md)

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 💡 Créditos

- **Avatares**: Generados con [DiceBear API](https://dicebear.com)
- **Animaciones**: [Framer Motion](https://framer.com/motion)
- **Framework**: [Next.js](https://nextjs.org)

---

**¡Disfruta del sorteo mágico de Amigo Secreto! ✨🎁**

Si tienes problemas o preguntas, no dudes en abrir un issue en el repositorio.
