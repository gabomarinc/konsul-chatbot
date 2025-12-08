# 📋 Crear Tabla "Prospectos" en Airtable

## ⚠️ Importante: Airtable no usa SQL Queries

Airtable **NO funciona con queries SQL** como bases de datos tradicionales. Tienes dos opciones:

1. **Crear manualmente** desde la interfaz web (5 minutos) ✅ RECOMENDADO
2. **Crear programáticamente** usando la API REST (más complejo)

---

## 🎯 Opción 1: Crear Manualmente (Más Fácil)

### Paso a Paso:

1. **Abre tu base de Airtable**
   - Ve a: https://airtable.com
   - Entra a tu base: `appoqCG814jMJbf4X`

2. **Crear la nueva tabla**
   - Haz clic en el botón **"+"** al lado de las pestañas de tablas (arriba)
   - O haz clic derecho en una tabla existente → "Add new table"
   - Nombra la tabla: **`Prospectos`**

3. **Eliminar campos por defecto** (opcional)
   - Airtable crea automáticamente "Name", "Notes", "Attachments"
   - Puedes eliminarlos si quieres empezar limpio

4. **Agregar los campos mínimos:**

   #### Campo 1: `nombre`
   - Haz clic en el botón **"+"** al lado de las columnas
   - Tipo: **Single line text**
   - Nombre: `nombre`
   - ✅ Marcar como requerido (opcional)

   #### Campo 2: `chat_id`
   - Haz clic en **"+"** para nueva columna
   - Tipo: **Single line text**
   - Nombre: `chat_id`
   - ✅ Marcar como requerido (opcional)

   #### Campo 3: `fecha_extraccion`
   - Haz clic en **"+"** para nueva columna
   - Tipo: **Date**
   - Nombre: `fecha_extraccion`
   - Opciones: ✅ Incluir hora
   - ✅ Marcar como requerido (opcional)

5. **¡Listo!** Ya tienes la tabla básica funcionando.

---

## 📋 Opción 2: Campos Opcionales (Recomendado agregar)

Si quieres la configuración completa, agrega también:

### Campo 4: `telefono`
- Tipo: **Phone number**
- Nombre: `telefono`

### Campo 5: `canal`
- Tipo: **Single select**
- Nombre: `canal`
- Opciones:
  - `WhatsApp`
  - `Instagram`
  - `Facebook`
  - `Telegram`
  - `Otro`

### Campo 6: `estado`
- Tipo: **Single select**
- Nombre: `estado`
- Opciones:
  - `Nuevo`
  - `Contactado`
  - `Interesado`
  - `Calificado`
  - `Descartado`
- Valor por defecto: `Nuevo`

### Campo 7: `imagenes_urls`
- Tipo: **Long text**
- Nombre: `imagenes_urls`
- Descripción: URLs de imágenes en formato JSON

### Campo 8: `agente_id`
- Tipo: **Single line text**
- Nombre: `agente_id`

### Campo 9: `fecha_ultimo_mensaje`
- Tipo: **Date**
- Nombre: `fecha_ultimo_mensaje`
- Opciones: ✅ Incluir hora

---

## 🚀 Opción 3: Crear con API REST (Avanzado)

Si prefieres crear la tabla programáticamente, puedes usar este código:

```javascript
// NOTA: Esto requiere permisos especiales de API de Airtable
// La creación de tablas vía API es limitada y compleja

async function createProspectosTable() {
    const baseId = 'appoqCG814jMJbf4X';
    const apiKey = 'TU_API_KEY'; // Tu API Key de Airtable
    
    // IMPORTANTE: La API de Airtable NO permite crear tablas directamente
    // Debes crearlas manualmente desde la interfaz web
    
    console.log('⚠️ Airtable no permite crear tablas vía API');
    console.log('✅ Debes crear la tabla manualmente desde la interfaz web');
}

// En su lugar, solo podemos crear los campos después de crear la tabla manualmente
```

**⚠️ Limitación importante:** Airtable **NO permite crear tablas nuevas** mediante su API REST. Solo puedes:
- Crear/leer/actualizar/eliminar **registros** en tablas existentes
- Crear **campos** en tablas existentes (con permisos especiales)

**Por eso, la Opción 1 (manual) es la única forma de crear la tabla.**

---

## ✅ Checklist Final

- [ ] Abrir base de Airtable `appoqCG814jMJbf4X`
- [ ] Crear nueva tabla "Prospectos"
- [ ] Agregar campo `nombre` (Single line text)
- [ ] Agregar campo `chat_id` (Single line text)
- [ ] Agregar campo `fecha_extraccion` (Date con hora)
- [ ] (Opcional) Agregar campo `telefono` (Phone number)
- [ ] (Opcional) Agregar campo `canal` (Single select)
- [ ] (Opcional) Agregar campo `estado` (Single select)
- [ ] (Opcional) Agregar campo `imagenes_urls` (Long text)

---

## 📸 Screenshots de Referencia (Campos Airtable)

### Tipos de Campos Disponibles:
- **Single line text** → Texto corto
- **Phone number** → Número de teléfono (formato automático)
- **Date** → Fecha (con opción de incluir hora)
- **Single select** → Dropdown con opciones predefinidas
- **Long text** → Texto largo (múltiples líneas)

---

## 🎯 Resumen

**Forma más fácil:**
1. Ir a https://airtable.com
2. Crear tabla "Prospectos" manualmente
3. Agregar 3 campos mínimos (nombre, chat_id, fecha_extraccion)
4. ¡Listo!

**No necesitas queries SQL** - Airtable usa interfaz gráfica.

---

## ✅ Una vez creada la tabla

Cuando termines de crear la tabla, avísame y continuamos con:
1. Configurar el código para conectarse a la tabla
2. Implementar la extracción de nombres
3. Guardar prospectos automáticamente

¡Es muy rápido! 🚀

