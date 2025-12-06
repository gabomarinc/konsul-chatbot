# ⚡ Solución Rápida - Copia y Pega Esto

## 🎯 Si no encuentras la función `testCustomFields()`

### Opción 1: Recargar la página primero

1. **Presiona F5** para recargar
2. **Espera 10 segundos**
3. **Abre la consola** (F12)
4. **Busca este mensaje**: `✅ Script de prueba cargado`
5. Si aparece, ejecuta: `testCustomFields()`

---

### Opción 2: Copiar código completo (MÁS RÁPIDO)

Si no quieres esperar, **copia TODO este código** y pégalo en la consola:

```javascript
(async function() {
    console.log('🧪 INICIANDO PRUEBAS DE CAMPOS PERSONALIZADOS\n');
    
    // Buscar API
    let api = window.gptmakerAPI || window.dashboard?.api || window.dashboard?.dataService?.api;
    if (!api && typeof GPTMakerAPI !== 'undefined') {
        api = new GPTMakerAPI();
    }
    
    if (!api) {
        console.error('❌ API no disponible. Espera 5 segundos y recarga la página.');
        return;
    }
    
    console.log('✅ API encontrada\n');
    console.log('📋 Obteniendo campos personalizados...\n');
    
    try {
        const result = await api.getCustomFields();
        if (result.success) {
            console.log(`✅ ${result.data.length} campos encontrados:\n`);
            
            const necesarios = [
                'Zona de Interes', 'Perfil Laboral', 'DUI', 'Constancia de salario',
                'Comprobante de AFP', 'Declaración de renta', 'Comprobante de domicilio',
                'Declaraciones de impuestos (1-2 años)',
                'Estados de cuenta bancarios personales o del domicilio',
                'Constancias de ingreso o contratos con clientes'
            ];
            
            result.data.forEach(f => {
                console.log(`- "${f.name}" (${f.type || 'N/A'})`);
            });
            
            console.log('\n📊 COMPARACIÓN:\n');
            necesarios.forEach(nombre => {
                const existe = result.data.find(f => 
                    f.name?.toLowerCase().includes(nombre.toLowerCase())
                );
                console.log(existe ? `✅ ${nombre}` : `❌ ${nombre} (FALTA)`);
            });
            
            window.customFieldsData = result.data;
        } else {
            console.error('❌ Error:', result.error);
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
})();
```

---

## 📝 Paso a Paso

1. **Abre la consola** (F12 o Cmd+Option+I)
2. **Ve a la pestaña "Console"**
3. **Selecciona TODO el código de arriba** (desde `(async function()` hasta `})();`)
4. **Copia** (Cmd+C o Ctrl+C)
5. **Pega en la consola** (Cmd+V o Ctrl+V)
6. **Presiona Enter**
7. **¡Listo!** Verás los resultados

---

## ✅ Verificación Rápida

Si quieres verificar qué está disponible, ejecuta esto primero:

```javascript
console.log('Dashboard:', !!window.dashboard);
console.log('GPTMakerAPI:', typeof GPTMakerAPI !== 'undefined');
console.log('testCustomFields:', typeof testCustomFields !== 'undefined');
```

