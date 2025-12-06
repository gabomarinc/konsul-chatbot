# 🔍 Diagnóstico: Página en Blanco

## ❓ Problema
La página no muestra nada, está completamente en blanco.

## 🔧 Pasos para Diagnosticar

### 1. Abre la Consola (F12)
- Ve a la pestaña **"Console"**
- Busca errores en rojo

### 2. Verifica la Pestaña "Network"
- Busca archivos que devuelvan 404 o errores 500
- Verifica que todos los archivos .js se estén cargando

### 3. Verifica la Pestaña "Elements"
- Presiona **Ctrl+Shift+C** (o Cmd+Shift+C en Mac)
- Verifica si el HTML está presente pero oculto

### 4. Ejecuta este Código en la Consola

Copia y pega esto en la consola para diagnosticar:

```javascript
// Diagnóstico rápido
console.log('🔍 DIAGNÓSTICO RÁPIDO');
console.log('1. DOM cargado:', document.readyState);
console.log('2. Body existe:', !!document.body);
console.log('3. Dashboard container:', !!document.querySelector('.dashboard-container'));
console.log('4. Errores en consola:', window.onerror);
console.log('5. Scripts cargados:');
const scripts = Array.from(document.scripts);
scripts.forEach((script, i) => {
    console.log(`   ${i + 1}. ${script.src || script.innerHTML.substring(0, 50)}`);
});
console.log('6. window.dashboard:', typeof window.dashboard);
console.log('7. window.authService:', typeof window.authService);
console.log('8. Errores de carga:', performance.getEntriesByType('resource').filter(r => r.responseStatus >= 400));
```

### 5. Revisa Estos Archivos Específicos

En la consola, escribe:

```javascript
// Verificar si los archivos principales se cargaron
console.log('GPTMakerAPI:', typeof GPTMakerAPI);
console.log('DataService:', typeof DataService);
console.log('ChatbotDashboard:', typeof ChatbotDashboard);
console.log('AuthService:', typeof window.authService);
```

## 💡 Posibles Causas

1. **Error de JavaScript**: Un error está deteniendo la ejecución
2. **Archivo no encontrado**: Algún archivo .js está devolviendo 404
3. **Error de autenticación**: La página está redirigiendo pero falla
4. **CSS ocultando contenido**: El contenido está ahí pero invisible

## ✅ Comparte

Por favor comparte:
- Los errores de la consola (pestaña Console)
- Los errores de Network (pestaña Network, filtra por errores)
- El resultado del código de diagnóstico

Con eso podré ayudarte a solucionarlo.

