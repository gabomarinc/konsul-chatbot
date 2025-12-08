# ✅ Pasos Después de Crear los Campos en Airtable

## 🎯 Lo que Ya Está Listo

- ✅ Campos `imagenes_urls` y `documentos_urls` creados en Airtable
- ✅ Código actualizado para guardar imágenes/documentos
- ✅ Código para leer imágenes/documentos de Airtable
- ✅ Código para mostrarlas en el modal

---

## 📋 Pasos para Ver las Imágenes y Documentos

### Paso 1: Recargar la Página
**IMPORTANTE:** Debes recargar la página con caché limpio para que cargue el código actualizado:

- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

O puedes hacer:
1. Abrir las herramientas de desarrollador (F12 o Cmd+Option+I)
2. Clic derecho en el botón de recargar
3. Seleccionar "Vaciar caché y volver a cargar de manera forzada"

---

### Paso 2: Extraer Prospectos Nuevamente

Esto es necesario porque los prospectos que ya existen **no tienen las imágenes/documentos guardadas** en Airtable. Al extraer nuevamente, el sistema:

1. Analizará todos los chats
2. Extraerá las imágenes y documentos
3. Los guardará en los campos `imagenes_urls` y `documentos_urls` en Airtable
4. Actualizará los prospectos existentes

**Cómo hacerlo:**

1. Ve a la sección **"Prospectos"** en el dashboard
2. Haz clic en el botón **"+ Extraer Prospectos"**
3. Espera a que termine el proceso (verás una notificación)

---

### Paso 3: Ver las Imágenes y Documentos

Después de extraer, las imágenes y documentos deberían estar guardados en Airtable.

**Para verlos:**

1. En la tabla de prospectos, haz clic en **"Ver Prospecto"** de cualquier prospecto
2. En el modal que se abre, deberías ver:
   - Una sección **"Imágenes"** con todas las imágenes que envió el usuario
   - Una sección **"Documentos"** con todos los documentos que envió el usuario

---

## 🔍 Verificar que Funcionó

### Opción 1: Ver en Airtable
1. Ve a tu tabla "Prospectos" en Airtable
2. Abre cualquier prospecto
3. En los campos `imagenes_urls` y `documentos_urls` deberías ver el contenido JSON

### Opción 2: Ver en la Consola del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Abre el modal de un prospecto
4. Deberías ver logs como:
   - `🖼️ Imágenes del prospecto (raw): [...]`
   - `📄 Documentos del prospecto (raw): [...]`

---

## ⚠️ Si No Aparecen las Imágenes/Documentos

### Verificar que los Campos Tengan los Nombres Correctos

Los campos deben llamarse **exactamente** así (sin espacios, en minúsculas):
- `imagenes_urls` (no `imágenes_urls` ni `imagenesUrls`)
- `documentos_urls` (no `documentos_urls` con mayúsculas)

### Verificar en la Consola

1. Abre la consola del navegador (F12)
2. Haz clic en "Extraer Prospectos"
3. Busca mensajes como:
   - `📸 Imagen extraída del usuario: [URL]`
   - `📄 Documento extraído: [URL]`
   - `✅ Prospecto guardado`

Si no ves estos mensajes, puede que no haya imágenes/documentos en ese chat específico.

---

## 🎉 ¡Listo!

Una vez que hagas estos pasos, las imágenes y documentos deberían aparecer automáticamente en el modal "Ver Prospecto" para todos los prospectos que las tengan.


