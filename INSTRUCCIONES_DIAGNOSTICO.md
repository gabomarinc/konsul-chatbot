# 🔍 Instrucciones: Diagnosticar Campos Personalizados

## 🎯 Problema

El usuario "Gabriel" tiene campos personalizados en GPTMaker, pero no aparecen en el modal.

---

## 📋 Pasos para Diagnosticar

### 1. Abre la Consola

1. Abre el dashboard en tu navegador
2. Presiona **F12** (Windows/Linux) o **Cmd+Option+I** (Mac)
3. Ve a la pestaña **"Console"**

### 2. Ejecuta el Script de Prueba

**Opción A: Usar el archivo**
- Abre el archivo `EJECUTAR_PRUEBA_CAMPOS_GABRIEL.txt`
- Copia TODO el código
- Pégalo en la consola
- Presiona Enter

**Opción B: Usar función global**
Si el script se carga automáticamente, escribe:
```javascript
testProspectCustomFields();
```

---

## 📊 Qué Verás

El script mostrará:

1. ✅ **Chat de Gabriel encontrado** - Confirma que se encontró el chat
2. 📋 **Todas las propiedades del chat** - Para ver qué datos tenemos
3. 📋 **Campos personalizados disponibles** - Lista de los 11 campos
4. 🔍 **Contact IDs a probar** - Diferentes IDs que se probarán
5. 📊 **Resultados de cada intento** - Si se encontraron valores o no

---

## 🔍 Qué Buscar

Después de ejecutar, revisa:

1. **¿Qué contactId funcionó?**
   - Busca en los logs cuál contactId devolvió datos

2. **¿Cómo está estructurada la respuesta?**
   - Revisa `window.customFieldsValues` o `window.contactData`
   - Copia y comparte la estructura JSON

3. **¿Los valores están en otro lugar?**
   - El script buscará campos personalizados en todas las estructuras posibles

---

## 💡 Comparte los Resultados

Después de ejecutar, comparte:

1. ✅ **Los logs completos** de la consola
2. ✅ **La estructura del chat** (JSON completo)
3. ✅ **Si se encontraron valores** de campos personalizados
4. ✅ **Cómo están estructurados** los valores (JSON)

Con eso podremos corregir el código para que funcione correctamente.

