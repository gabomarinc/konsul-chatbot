# 📝 Estructura Completa de la Tabla "Prospectos"

## ⚠️ Importante

**Airtable NO usa queries SQL.** Debes crear la tabla manualmente desde la interfaz web.

Sin embargo, aquí tienes la estructura completa para que sepas exactamente qué crear:

---

## 📋 Estructura Completa de Campos

### Campos Obligatorios (Mínimos)

```javascript
// Estructura mínima requerida
{
  nombre: "Single line text",           // Nombre del prospecto
  chat_id: "Single line text",          // ID del chat en GPTMaker
  fecha_extraccion: "Date"              // Fecha cuando se extrajo
}
```

### Campos Opcionales (Recomendados)

```javascript
// Estructura completa recomendada
{
  nombre: "Single line text",
  chat_id: "Single line text",
  telefono: "Phone number",
  canal: "Single select",               // WhatsApp, Instagram, etc.
  fecha_extraccion: "Date",
  fecha_ultimo_mensaje: "Date",
  estado: "Single select",              // Nuevo, Contactado, etc.
  imagenes_urls: "Long text",           // JSON array de URLs
  agente_id: "Single line text",
  notas: "Long text"
}
```

---

## 🎯 Instrucciones Paso a Paso

### 1. Crear la Tabla

1. Ve a https://airtable.com
2. Abre tu base: `appoqCG814jMJbf4X`
3. Haz clic en **"+"** (crear nueva tabla)
4. Nombra la tabla: **`Prospectos`**

### 2. Crear Campos Obligatorios

#### Campo: `nombre`
- Haz clic en **"+"** (nueva columna)
- Nombre: `nombre`
- Tipo: **Single line text**
- ✅ Marcar como requerido (opcional)

#### Campo: `chat_id`
- Haz clic en **"+"** (nueva columna)
- Nombre: `chat_id`
- Tipo: **Single line text**
- ✅ Marcar como requerido (opcional)

#### Campo: `fecha_extraccion`
- Haz clic en **"+"** (nueva columna)
- Nombre: `fecha_extraccion`
- Tipo: **Date**
- ✅ Marcar "Include time" (incluir hora)
- ✅ Marcar como requerido (opcional)

### 3. Crear Campos Opcionales

#### Campo: `telefono`
- Nombre: `telefono`
- Tipo: **Phone number**

#### Campo: `canal`
- Nombre: `canal`
- Tipo: **Single select**
- Opciones:
  ```
  WhatsApp
  Instagram
  Facebook
  Telegram
  Otro
  ```

#### Campo: `estado`
- Nombre: `estado`
- Tipo: **Single select**
- Opciones:
  ```
  Nuevo
  Contactado
  Interesado
  Calificado
  Descartado
  ```
- Valor por defecto: `Nuevo`

#### Campo: `imagenes_urls`
- Nombre: `imagenes_urls`
- Tipo: **Long text**
- Descripción: URLs de imágenes en formato JSON

#### Campo: `agente_id`
- Nombre: `agente_id`
- Tipo: **Single line text`

#### Campo: `fecha_ultimo_mensaje`
- Nombre: `fecha_ultimo_mensaje`
- Tipo: **Date**
- ✅ Marcar "Include time"

#### Campo: `notas`
- Nombre: `notas`
- Tipo: **Long text**

---

## 📊 Ejemplo de Registro Completo

Una vez creada la tabla, un registro se vería así:

```
nombre: "Juan Ignacio"
chat_id: "chat_abc123xyz"
telefono: "+52 1 234 567 8900"
canal: "WhatsApp"
fecha_extraccion: "2024-01-15 14:30:00"
fecha_ultimo_mensaje: "2024-01-15 16:45:00"
estado: "Nuevo"
imagenes_urls: '["https://...", "https://..."]'
agente_id: "agent_123"
notas: "Interesado en plan premium"
```

---

## ✅ Checklist de Configuración

### Obligatorios:
- [ ] Campo `nombre` (Single line text)
- [ ] Campo `chat_id` (Single line text)
- [ ] Campo `fecha_extraccion` (Date con hora)

### Opcionales (Recomendados):
- [ ] Campo `telefono` (Phone number)
- [ ] Campo `canal` (Single select con 5 opciones)
- [ ] Campo `estado` (Single select con 5 opciones)
- [ ] Campo `imagenes_urls` (Long text)
- [ ] Campo `agente_id` (Single line text)
- [ ] Campo `fecha_ultimo_mensaje` (Date con hora)
- [ ] Campo `notas` (Long text)

---

## 🚀 Una vez creada la tabla

Cuando termines, avísame y continuamos con:
1. Configurar el código para conectarse a la tabla
2. Implementar la extracción de nombres
3. Guardar prospectos automáticamente

¡Es muy rápido! 🎉


