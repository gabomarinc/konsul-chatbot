# 🚀 Instrucciones Rápidas para Ejecutar las Pruebas

## ⏱️ ¿Cuándo ejecutar?

**Puedes ejecutar las pruebas DESPUÉS de que el dashboard haya cargado completamente.** 

### ✅ Señales de que el dashboard está listo:

1. ✅ Ya iniciaste sesión
2. ✅ Ves el contenido del dashboard (no la pantalla de login)
3. ✅ La página está completamente cargada (no hay animaciones de carga)
4. ✅ Puedes ver la sección "Prospectos" o cualquier otra sección

---

## 🎯 Pasos Rápidos

### 1. Abre la Consola del Navegador

- **Mac**: `Cmd + Option + I` (⌘ + ⌥ + I)
- **Windows/Linux**: `F12` o `Ctrl + Shift + I`

### 2. Ve a la pestaña "Console"

Haz clic en la pestaña "Console" en las herramientas de desarrollador.

### 3. Ejecuta el Script

Escribe esto en la consola y presiona Enter:

```javascript
testCustomFields()
```

---

## ⚠️ Si no funciona inmediatamente

### Opción A: Esperar un poco

Si acabas de entrar al dashboard, espera **5-10 segundos** para que todo cargue y luego ejecuta:

```javascript
testCustomFields()
```

### Opción B: Verificar que todo esté listo

Ejecuta esto primero para verificar:

```javascript
// Verificar que el dashboard esté cargado
console.log('Dashboard:', window.dashboard ? '✅ Disponible' : '❌ No disponible');
console.log('GPTMakerAPI class:', typeof GPTMakerAPI !== 'undefined' ? '✅ Disponible' : '❌ No disponible');
```

Si ambos muestran ✅, entonces ejecuta `testCustomFields()`.

### Opción C: Esperar automáticamente

Si quieres que espere automáticamente a que todo esté listo, ejecuta:

```javascript
// Esperar hasta que el dashboard esté listo
const waitForDashboard = setInterval(() => {
    if (window.dashboard && typeof GPTMakerAPI !== 'undefined') {
        clearInterval(waitForDashboard);
        console.log('✅ Dashboard listo! Ejecutando pruebas...');
        testCustomFields();
    } else {
        console.log('⏳ Esperando que el dashboard cargue...');
    }
}, 1000);

// Timeout de seguridad (máximo 30 segundos)
setTimeout(() => {
    clearInterval(waitForDashboard);
    console.log('⚠️ Tiempo de espera agotado. Intenta ejecutar testCustomFields() manualmente.');
}, 30000);
```

---

## 📊 Qué verás cuando funcione

Cuando ejecutes `testCustomFields()`, verás en la consola:

1. ✅ **Lista de campos personalizados** encontrados en tu workspace
2. 📋 **Comparación** entre campos necesarios y encontrados
3. 💬 **Estructura de un chat** de ejemplo
4. 📨 **Análisis de mensajes** del chat

---

## 🆘 Solución de Problemas

### "GPTMakerAPI no está disponible"

**Solución**: Espera unos segundos más y vuelve a intentar. El script intentará crear una instancia automáticamente.

### "No se pudieron obtener chats"

**Solución**: Verifica que:
- Tengas chats en tu cuenta de GPTMaker
- El token de API esté configurado correctamente
- Tengas conexión a internet

### La consola está vacía

**Solución**: 
1. Verifica que estés en la pestaña "Console" (no "Elements" u otra)
2. Limpia el filtro si hay uno activo
3. Recarga la página y espera a que cargue todo

---

## 💡 Tips

- **Mejor momento**: Espera 5-10 segundos después de que el dashboard se vea completamente cargado
- **Si hay errores**: No te preocupes, el script te dirá qué está faltando
- **Captura de pantalla**: Puedes hacer screenshot de los resultados para compartirlos

---

## ✅ Listo para probar

1. Abre el dashboard
2. Inicia sesión (si es necesario)
3. Espera 5-10 segundos
4. Abre la consola (F12 o Cmd+Option+I)
5. Ejecuta: `testCustomFields()`
6. ¡Listo! 🎉




