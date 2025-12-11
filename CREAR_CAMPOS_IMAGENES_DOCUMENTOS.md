# 📋 Guía: Crear Campos para Imágenes y Documentos en Airtable

## 🎯 Objetivo
Crear los campos necesarios en Airtable para guardar las URLs de las imágenes y documentos que envía el usuario.

---

## 📊 Campos a Crear

Necesitas crear **2 campos nuevos** en tu tabla "Prospectos":

### 1. Campo: `imagenes_urls`
- **Nombre del campo**: `imagenes_urls`
- **Tipo**: **Long text** (texto largo)
- **Descripción**: URLs de las imágenes enviadas por el usuario en formato JSON
- **Ejemplo de contenido**: `["https://ejemplo.com/imagen1.jpg", "https://ejemplo.com/imagen2.png"]`

### 2. Campo: `documentos_urls`
- **Nombre del campo**: `documentos_urls`
- **Tipo**: **Long text** (texto largo)
- **Descripción**: URLs de los documentos enviados por el usuario en formato JSON
- **Ejemplo de contenido**: `[{"url":"https://ejemplo.com/doc.pdf","fileName":"documento.pdf","type":"pdf"}]`

---

## 🎯 Instrucciones Paso a Paso

### Paso 1: Ir a tu tabla de Airtable

1. Abre tu base de Airtable: `appoqCG814jMJbf4X`
2. Ve a la tabla **"Prospectos"**

### Paso 2: Crear el campo `imagenes_urls`

1. Haz clic en el botón **"+"** a la derecha de la última columna
2. Selecciona el tipo de campo: **"Long text"** (Texto largo)
3. Nombra el campo: **`imagenes_urls`** (exactamente así, en minúsculas con guión bajo)
4. Haz clic en **"Create field"** (Crear campo)

### Paso 3: Crear el campo `documentos_urls`

1. Haz clic en el botón **"+"** a la derecha de la última columna (después de `imagenes_urls`)
2. Selecciona el tipo de campo: **"Long text"** (Texto largo)
3. Nombra el campo: **`documentos_urls`** (exactamente así, en minúsculas con guión bajo)
4. Haz clic en **"Create field"** (Crear campo)

---

## ✅ Verificación

Después de crear los campos, deberías ver en tu tabla "Prospectos":

| Campo | Tipo |
|-------|------|
| A nombre | Single line text |
| A chat_id | Single line text |
| fecha_extraccion | Date |
| **imagenes_urls** | **Long text** ← NUEVO |
| **documentos_urls** | **Long text** ← NUEVO |

---

## 🚀 Después de Crear los Campos

Una vez que hayas creado los campos, el código se actualizará automáticamente para:
1. ✅ Guardar las URLs de las imágenes cuando se extrae un prospecto
2. ✅ Guardar las URLs de los documentos cuando se extrae un prospecto
3. ✅ Mostrar las imágenes en el modal "Ver Prospecto"
4. ✅ Mostrar los documentos en el modal "Ver Prospecto"

---

## ⚠️ Importante

- Los nombres de los campos deben ser **exactamente** `imagenes_urls` y `documentos_urls` (en minúsculas, con guión bajo)
- El tipo debe ser **Long text** (no "Single line text")
- No es necesario que los campos sean obligatorios (pueden estar vacíos)

---

## 📝 Notas

- Estos campos almacenan las URLs (enlaces) a las imágenes/documentos, no los archivos en sí
- Esto es más eficiente que guardar los archivos directamente en Airtable
- Las URLs apuntan a los archivos almacenados en los servidores de GPTMaker




