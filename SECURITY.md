# 🔐 Política de Seguridad

## Medidas de Seguridad Implementadas

### 1. Protección del Repositorio

- **CODEOWNERS**: Solo @soyarmu puede aprobar cambios en archivos críticos
- **GitHub Actions**: Análisis automático de seguridad en cada push
- **Branch Protection**: Se recomienda activar protección en la rama main

### 2. Protección contra Ataques Comunes

#### Rate Limiting
- **Registro**: 3 intentos por hora por IP
- **Login Usuario**: 5 intentos cada 15 minutos por IP
- **Login Admin**: 3 intentos cada 15 minutos por IP (más estricto)
- **Sorteo**: 10 intentos por minuto por IP

#### Validación de Inputs
- Sanitización de todos los datos de entrada
- Validación estricta de emails
- Límite de caracteres en todos los campos
- Prevención de XSS mediante sanitización
- Prevención de inyección SQL (no aplicable, pero protegido)

#### Headers de Seguridad HTTP
- `X-Frame-Options: DENY` - Prevenir clickjacking
- `X-Content-Type-Options: nosniff` - Prevenir MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Protección XSS
- `Content-Security-Policy` - Política de contenido estricta
- `Referrer-Policy` - Control de referenciadores
- `Permissions-Policy` - Deshabilitar APIs peligrosas

### 3. Protección de Credenciales

#### Variables de Entorno Sensibles (NUNCA en el código):
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

#### Buenas Prácticas:
- ✅ Usa el archivo `.env.local` para desarrollo
- ✅ Configura las variables en Vercel para producción
- ❌ NUNCA hagas commit de `.env.local`
- ❌ NUNCA compartas tus credenciales
- ❌ NUNCA expongas las variables en el frontend

### 4. Protección de la Base de Datos (Google Sheets)

- Service Account con permisos mínimos necesarios
- Solo acceso al spreadsheet específico
- Validación de todos los datos antes de guardar
- Sanitización de datos al leer y escribir

### 5. Protección contra Bots

- Detección de user-agents sospechosos
- Bloqueo de scrapers y crawlers maliciosos
- Límite de tamaño de payload (10KB)

## Configuración Recomendada en GitHub

### Activar Branch Protection en `main`:

1. Ve a: **Settings** → **Branches** → **Add rule**
2. Branch name pattern: `main`
3. Activa:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Require review from Code Owners
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators (para máxima seguridad)
4. Guarda los cambios

### Activar Dependabot:

1. Ve a: **Settings** → **Security & analysis**
2. Activa:
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

### Activar Secret Scanning:

1. Ve a: **Settings** → **Security & analysis**
2. Activa:
   - ✅ Secret scanning

## Reportar una Vulnerabilidad

Si encuentras una vulnerabilidad de seguridad, por favor:

1. **NO** abras un issue público
2. Envía un email a: armucode@gmail.com
3. Incluye:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducirla
   - Impacto potencial
   - Sugerencias de solución (opcional)

Responderé dentro de 48 horas y trabajaré en un parche lo antes posible.

## Auditorías de Seguridad

### Ejecutar manualmente:

```bash
# Auditar dependencias
npm audit

# Auditar solo producción
npm audit --production

# Ver todas las vulnerabilidades
npm audit --json

# Corregir automáticamente (con precaución)
npm audit fix
```

### Revisar logs de seguridad:

- Vercel Dashboard → Proyecto → Logs
- Buscar códigos 429 (rate limit excedido)
- Buscar códigos 403 (bloqueados)
- Buscar códigos 401 (intentos de login fallidos)

## Lista de Verificación de Seguridad

Antes de hacer deploy a producción:

- [ ] Todas las variables de entorno están configuradas en Vercel
- [ ] `.env.local` está en `.gitignore` (y nunca se ha commiteado)
- [ ] Las credenciales de Google Service Account funcionan
- [ ] El admin puede hacer login correctamente
- [ ] Rate limiting funciona (probar múltiples intentos)
- [ ] Los headers de seguridad están presentes (verificar con DevTools)
- [ ] Branch protection está activada en GitHub
- [ ] Dependabot está activado
- [ ] Secret scanning está activado
- [ ] `npm audit` no muestra vulnerabilidades críticas

## Actualizaciones de Seguridad

### Frecuencia recomendada:

- **Semanal**: Revisar Dependabot alerts
- **Mensual**: Ejecutar `npm audit` y actualizar dependencias
- **Trimestral**: Revisar y actualizar políticas de seguridad

### Mantener actualizado:

```bash
# Actualizar dependencias de seguridad
npm update

# Actualizar todas las dependencias (con precaución)
npm update --save

# Verificar dependencias desactualizadas
npm outdated
```

## Contacto

Para temas de seguridad: armucode@gmail.com

---

**Última actualización**: Diciembre 2024
