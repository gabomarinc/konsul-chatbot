# 🎯 Estrategia de Implementación: Prospectos con Campos Personalizados

## ✅ Lo que Ya Sabemos

1. **Campos personalizados disponibles:** 11 campos tipo STRING
2. **Nombre del prospecto:** Ya está en `chat.name` (no necesitamos guardarlo)
3. **Chat ID:** Disponible en `chat.id` para identificar
4. **Recipient:** `chat.recipient` podría ser el ID del contacto

---

## 📋 Mapeo de Datos a Campos Personalizados

### Datos que Ya Tenemos (sin guardar):
- ✅ **Nombre:** `chat.name` → Ya está, no guardar
- ✅ **Chat ID:** `chat.id` → Ya está, no guardar
- ✅ **Teléfono:** `chat.whatsappPhone` → Ya está, no guardar
- ✅ **Agente:** `chat.agentName` → Ya está, no guardar

### Datos a Guardar en Campos Personalizados:

| Dato del Prospecto | Campo Personalizado a Usar | Formato |
|-------------------|---------------------------|---------|
| **Imágenes enviadas** | `constanciaDeSalario` | JSON string con array de URLs |
| **Documentos/PDFs** | `comprobanteDeAfp` | JSON string con array de URLs |
| **Comentarios** | `comprobanteDeDomicilio` | JSON string con array de comentarios |
| **DUI** (si se captura) | `dui` | String simple |
| **Zona de interés** (si se captura) | `zonaDeInteres` | String simple |
| **Perfil laboral** (si se captura) | `perfilLaboral` | String simple |

---

## 🔧 Implementación Propuesta

### 1. Modificar `ProspectsService`

**Cambiar de:**
- Guardar en Airtable
- Leer de Airtable

**A:**
- Guardar en campos personalizados del contacto/chat
- Leer desde campos personalizados del contacto/chat

### 2. Estructura de Datos

```javascript
// Prospecto guardado en campos personalizados
{
  // Usar chat.recipient como contactId
  contactId: chat.recipient,
  
  // Datos en campos personalizados:
  constanciaDeSalario: JSON.stringify([...imagenesUrls]),
  comprobanteDeAfp: JSON.stringify([...documentosUrls]),
  comprobanteDeDomicilio: JSON.stringify([...comentarios]),
  dui: "12345678-9",
  zonaDeInteres: "San Salvador",
  perfilLaboral: "Ingeniero"
}
```

### 3. Métodos Necesarios

En `GPTMakerAPI`:
- ✅ `getContactCustomFields(contactId)` - Ya creado
- ✅ `updateContactCustomFields(contactId, values)` - Ya creado

En `ProspectsService`:
- `saveProspectToCustomFields(prospectData)` - Nuevo
- `getProspectFromCustomFields(contactId)` - Nuevo
- `getAllProspectsFromCustomFields()` - Nuevo

---

## 🚀 Plan de Implementación

### Fase 1: Métodos de Lectura/Escritura ✅
- [x] Crear métodos en GPTMakerAPI para campos personalizados
- [ ] Crear métodos en ProspectsService para usar campos personalizados

### Fase 2: Migración de Datos
- [ ] Modificar `saveProspect()` para usar campos personalizados
- [ ] Modificar `getAllProspects()` para leer desde campos personalizados
- [ ] Modificar `getProspectByChatId()` para buscar por contactId

### Fase 3: Actualizar Dashboard
- [ ] Modificar `loadProspects()` para usar nuevo método
- [ ] Asegurar que el modal funcione con datos de campos personalizados

### Fase 4: Eliminar Airtable
- [ ] Remover referencias a Airtable en ProspectsService
- [ ] Limpiar código no usado

---

## ⚠️ Consideraciones

1. **Identificar Contacto:**
   - Usar `chat.recipient` como `contactId`
   - Si no existe, usar `chat.id` como fallback

2. **Compatibilidad:**
   - Mantener estructura de datos similar a Airtable
   - Facilitar migración de datos existentes

3. **Error Handling:**
   - Manejar casos donde contactId no existe
   - Manejar errores de API gracefully

---

## 📝 ¿Seguimos con la Implementación?

¿Quieres que proceda a modificar `ProspectsService` para usar campos personalizados?

