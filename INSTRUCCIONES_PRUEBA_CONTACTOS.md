# 🧪 Instrucciones: Prueba de Contactos y Campos Personalizados

## 🎯 Objetivo

Probar cómo funcionan los contactos en GPTMaker y cómo podemos usar los campos personalizados existentes para guardar datos de prospectos (sin crear nuevos campos).

---

## 📋 Pasos para Ejecutar

### 1. Abrir el Dashboard

1. Abre el dashboard en tu navegador
2. Inicia sesión si es necesario
3. Espera a que la página cargue completamente (5-10 segundos)

### 2. Abrir la Consola del Navegador

1. Presiona **F12** (Windows/Linux) o **Cmd+Option+I** (Mac)
2. O haz clic derecho → "Inspeccionar" → Pestaña "Console"

### 3. Ejecutar el Script de Prueba

El script debería ejecutarse automáticamente cuando cargue la página. Si no, copia y pega este código en la consola:

```javascript
// Si no se ejecutó automáticamente, ejecuta:
testContactCustomFields();
```

O simplemente espera - el script se ejecuta automáticamente cuando carga la página.

---

## 📊 Qué Verás en la Consola

El script mostrará:

1. **Estructura de un Chat**
   - ID del chat
   - Nombre (ej: "Gabriel valverde")
   - Recipient (ID del contacto)
   - Todas las propiedades del chat

2. **Estructura del Contacto** (si se encuentra)
   - Datos del contacto asociado al chat
   - Cómo se relacionan chats con contactos

3. **Campos Personalizados del Contacto**
   - Valores actuales de campos personalizados
   - Cómo se almacenan los datos

4. **Lista de Todos los Contactos** (si está disponible)
   - Cómo obtener todos los contactos

5. **Campos Personalizados Disponibles**
   - Lista de los 11 campos que ya existen
   - Sugerencias de cómo usar cada uno

---

## 🔍 Qué Buscar

### Información Crítica:

1. **¿El `chat.recipient` es el ID del contacto?**
   - Busca en los logs si aparece información del contacto usando el `recipient`

2. **¿Cómo obtener un contacto desde un chat?**
   - Mira qué endpoints funcionan para obtener datos del contacto

3. **¿Cómo se guardan los campos personalizados?**
   - Revisa la estructura de los valores de campos personalizados

4. **¿Qué campos podemos usar para prospectos?**
   - Los 11 campos existentes pueden usarse para guardar:
     - Imágenes/documentos (como JSON string)
     - Comentarios (como JSON string)
     - Datos adicionales

---

## 📝 Datos Importantes a Anotar

Después de ejecutar las pruebas, comparte:

1. ✅ **¿Qué endpoint funcionó para obtener contactos?**
   - Copia la URL del endpoint que funcionó

2. ✅ **¿Cómo se ve la estructura del contacto?**
   - Comparte el JSON del contacto (puedes copiarlo desde `window.contactData`)

3. ✅ **¿Qué campos personalizados tiene el contacto?**
   - Revisa `window.contactCustomFields`

4. ✅ **¿El nombre "Gabriel valverde" está en el contacto o solo en el chat?**
   - Esto confirmará si necesitamos guardarlo o ya está

---

## 💡 Objetos Disponibles en la Consola

Después de ejecutar, puedes acceder a:

- `window.exampleChat` - Estructura completa del chat
- `window.contactData` - Datos del contacto (si se encontraron)
- `window.contactCustomFields` - Campos personalizados del contacto
- `window.allContacts` - Lista de todos los contactos
- `window.availableCustomFields` - Campos personalizados disponibles

---

## 🚀 Siguiente Paso

Una vez que tengamos los resultados de las pruebas, podremos:

1. Confirmar cómo obtener contactos desde chats
2. Decidir qué campos personalizados usar para cada dato
3. Implementar la migración de Airtable a campos personalizados

---

## ⚠️ Notas

- El script probará múltiples endpoints automáticamente
- Algunos endpoints pueden fallar (es normal)
- Solo necesitamos que **uno** funcione
- Los errores se mostrarán pero no detendrán las pruebas




