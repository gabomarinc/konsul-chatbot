# 🚀 Cómo Ejecutar la Prueba - Paso a Paso

## ⚠️ Si no aparece `testCustomFields()` en la consola

### Solución 1: Recargar la página

1. **Presiona F5** o **Cmd+R** para recargar la página
2. **Espera 5-10 segundos** a que todo cargue
3. **Abre la consola** (F12 o Cmd+Option+I)
4. **Busca este mensaje**: `✅ Script de prueba cargado. Ejecuta: testCustomFields()`
5. Si ves ese mensaje, entonces ejecuta: `testCustomFields()`

---

### Solución 2: Copiar y pegar el código directamente

Si el script no se carga, puedes **copiar y pegar este código directamente en la consola**:

```javascript
// Verificar si el script se cargó
if (typeof testCustomFields === 'function') {
    console.log('✅ La función testCustomFields está disponible');
    testCustomFields();
} else {
    console.log('⚠️ El script no se cargó. Cargando manualmente...');
    
    // Cargar el script manualmente
    const script = document.createElement('script');
    script.src = 'test-custom-fields.js';
    script.onload = () => {
        console.log('✅ Script cargado manualmente. Ejecutando pruebas...');
        setTimeout(() => testCustomFields(), 500);
    };
    script.onerror = () => {
        console.error('❌ Error cargando el script. Usando versión inline...');
        // Cargar versión inline...
    };
    document.head.appendChild(script);
}
```

---

### Solución 3: Verificar errores en la consola

1. Abre la consola (F12)
2. Ve a la pestaña **"Console"**
3. **Busca errores en rojo** que puedan estar bloqueando el script
4. Si hay errores, compártelos para solucionarlos

---

### Solución 4: Ejecutar código inline (más rápido)

Copia y pega esto directamente en la consola:

```javascript
// Código inline para probar campos personalizados
(async function testCustomFieldsInline() {
    console.log('🧪 ==========================================');
    console.log('🧪 INICIANDO PRUEBAS DE CAMPOS PERSONALIZADOS');
    console.log('🧪 ==========================================\n');

    // Buscar API
    let api = null;
    if (window.gptmakerAPI) {
        api = window.gptmakerAPI;
    } else if (window.dashboard?.api) {
        api = window.dashboard.api;
    } else if (window.dashboard?.dataService?.api) {
        api = window.dashboard.dataService.api;
    } else if (typeof GPTMakerAPI !== 'undefined') {
        api = new GPTMakerAPI();
    }
    
    if (!api) {
        console.error('❌ GPTMakerAPI no está disponible');
        console.log('💡 Verifica que el dashboard esté completamente cargado');
        return;
    }

    console.log('✅ API disponible\n');
    console.log('📋 Obteniendo campos personalizados...\n');
    
    try {
        const result = await api.getCustomFields();
        if (result.success) {
            console.log(`✅ Se encontraron ${result.data.length} campos personalizados:\n`);
            result.data.forEach((field, i) => {
                console.log(`${i + 1}. "${field.name}" - Tipo: ${field.type || 'N/A'}`);
            });
        } else {
            console.error('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
```

---

## ✅ Verificación Rápida

Ejecuta esto en la consola para ver qué está disponible:

```javascript
console.log('Dashboard:', typeof window.dashboard !== 'undefined' ? '✅' : '❌');
console.log('GPTMakerAPI class:', typeof GPTMakerAPI !== 'undefined' ? '✅' : '❌');
console.log('testCustomFields function:', typeof testCustomFields !== 'undefined' ? '✅' : '❌');
```

---

## 📸 Si sigues teniendo problemas

1. **Haz un screenshot** de la consola
2. **Comparte los errores** que aparezcan
3. Te ayudo a solucionarlo




