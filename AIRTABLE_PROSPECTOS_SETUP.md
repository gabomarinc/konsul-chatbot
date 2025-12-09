# 📋 Configuración de Airtable para Prospectos

## 🎯 Objetivo
Crear una nueva tabla en Airtable para almacenar información de los prospectos extraídos automáticamente de los chats.

---

## 📊 Nueva Tabla: "Prospectos"

### Crear la Tabla

1. Ve a tu base de Airtable: `appoqCG814jMJbf4X`
2. Haz clic en el botón **"+"** al lado de las pestañas de tablas
3. Nombra la nueva tabla: **`Prospectos`** (o `Prospects` si prefieres en inglés)

---

## 🔧 Campos Requeridos

Crea los siguientes campos en la tabla `Prospectos`:

| # | Nombre del Campo | Tipo | Descripción | Requerido |
|---|------------------|------|-------------|-----------|
| 1 | `nombre` | Single line text | Nombre completo extraído del chat | ✅ Sí |
| 2 | `chat_id` | Single line text | ID del chat de GPTMaker | ✅ Sí |
| 3 | `telefono` | Phone number | Teléfono del prospecto (WhatsApp) | ⚠️ Opcional |
| 4 | `canal` | Single select | Canal de comunicación (WhatsApp, Instagram, etc.) | ⚠️ Opcional |
| 5 | `fecha_extraccion` | Date | Fecha cuando se extrajo el nombre | ✅ Sí |
| 6 | `fecha_ultimo_mensaje` | Date | Fecha del último mensaje en el chat | ⚠️ Opcional |
| 7 | `estado` | Single select | Estado del prospecto (Nuevo, Contactado, etc.) | ⚠️ Opcional |
| 8 | `imagenes` | Multiple attachments | Imágenes enviadas por el prospecto | ⚠️ Opcional |
| 9 | `imagenes_urls` | Long text | URLs de las imágenes (JSON array) | ⚠️ Opcional |
| 10 | `agente_id` | Single line text | ID del agente que atendió | ⚠️ Opcional |
| 11 | `notas` | Long text | Notas adicionales sobre el prospecto | ⚠️ Opcional |

---

## 📝 Detalles de Cada Campo

### 1. `nombre` (Single line text)
- **Descripción**: Nombre completo del prospecto extraído del chat
- **Ejemplo**: "Juan Ignacio", "Omar", "María González"
- **Requerido**: Sí

### 2. `chat_id` (Single line text)
- **Descripción**: ID único del chat en GPTMaker para vincular con el chat original
- **Ejemplo**: "chat_abc123xyz"
- **Requerido**: Sí
- **Nota**: Este campo será usado para hacer clic y abrir el chat

### 3. `telefono` (Phone number)
- **Descripción**: Número de teléfono del prospecto (si está disponible)
- **Ejemplo**: "+52 1 234 567 8900"
- **Requerido**: No

### 4. `canal` (Single select)
- **Descripción**: Canal por el cual contactó el prospecto
- **Opciones**:
  - `WhatsApp`
  - `Instagram`
  - `Facebook`
  - `Telegram`
  - `Otro`
- **Requerido**: No

### 5. `fecha_extraccion` (Date)
- **Descripción**: Fecha y hora cuando se detectó y extrajo el nombre del chat
- **Formato**: Date & time
- **Requerido**: Sí

### 6. `fecha_ultimo_mensaje` (Date)
- **Descripción**: Fecha del último mensaje en la conversación
- **Formato**: Date & time
- **Requerido**: No

### 7. `estado` (Single select)
- **Descripción**: Estado actual del prospecto en el proceso de ventas
- **Opciones**:
  - `Nuevo` (por defecto)
  - `Contactado`
  - `Interesado`
  - `Calificado`
  - `Descartado`
- **Requerido**: No

### 8. `imagenes` (Multiple attachments)
- **Descripción**: Imágenes enviadas por el prospecto (si quieres almacenarlas directamente)
- **Tipo**: Multiple attachments
- **Requerido**: No
- **Nota**: Opcional, podemos usar solo URLs en lugar de adjuntos

### 9. `imagenes_urls` (Long text)
- **Descripción**: URLs de las imágenes en formato JSON array
- **Ejemplo**: `["https://...", "https://..."]`
- **Requerido**: No
- **Nota**: Preferimos usar esto para no ocupar espacio en Airtable

### 10. `agente_id` (Single line text)
- **Descripción**: ID del agente de IA que atendió al prospecto
- **Ejemplo**: "agent_123"
- **Requerido**: No

### 11. `notas` (Long text)
- **Descripción**: Notas adicionales sobre el prospecto
- **Ejemplo**: "Interesado en plan premium"
- **Requerido**: No

---

## 🎨 Vista Sugerida

Crea una vista por defecto llamada **"Todos los Prospectos"** con estas columnas visibles:

1. Nombre
2. Teléfono
3. Canal
4. Fecha Extracción
5. Estado
6. Agente ID

Ordenar por: **Fecha Extracción** (más reciente primero)

---

## 🔄 Opción Alternativa: Solo localStorage

Si prefieres **NO usar Airtable** para prospectos (más simple y rápido):

- ✅ Podemos guardar todo en `localStorage` del navegador
- ✅ No necesitas crear nada en Airtable
- ⚠️ Desventaja: Los datos se pierden si se limpia el navegador
- ⚠️ No se sincroniza entre dispositivos

---

## 📋 Checklist de Configuración

- [ ] Crear tabla "Prospectos"
- [ ] Agregar campo `nombre` (Single line text)
- [ ] Agregar campo `chat_id` (Single line text)
- [ ] Agregar campo `telefono` (Phone number) - Opcional
- [ ] Agregar campo `canal` (Single select) - Opcional
- [ ] Agregar campo `fecha_extraccion` (Date)
- [ ] Agregar campo `estado` (Single select) - Opcional
- [ ] Agregar campo `imagenes_urls` (Long text) - Opcional
- [ ] Configurar opciones para campo `canal`
- [ ] Configurar opciones para campo `estado`
- [ ] Crear vista "Todos los Prospectos"

---

## 🚀 Siguiente Paso

Una vez configurada la tabla en Airtable (o decidido usar solo localStorage), continuamos con la implementación del código.

**¿Prefieres usar Airtable o localStorage?**
- Airtable = Datos persistentes, sincronización, más profesional
- localStorage = Más rápido, sin configuración, solo local


