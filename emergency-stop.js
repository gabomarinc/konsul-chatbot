/**
 * Script de emergencia para detener las solicitudes infinitas
 * Ejecutar en la consola del navegador
 */

function stopInfiniteRequests() {
    console.log('🛑 Deteniendo solicitudes infinitas...');
    
    // Detener el polling service si existe
    if (window.dashboard && window.dashboard.pollingService) {
        window.dashboard.pollingService.stopPolling();
        console.log('✅ Polling detenido');
    }
    
    // Limpiar todos los intervalos
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }
    
    const highestIntervalId = setInterval(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
        clearInterval(i);
    }
    
    console.log('✅ Todos los intervalos y timeouts limpiados');
    
    // Deshabilitar el dashboard temporalmente
    if (window.dashboard) {
        window.dashboard.pollingListenersInitialized = false;
        console.log('✅ Dashboard deshabilitado temporalmente');
    }
}

function enableMockMode() {
    console.log('🧪 Activando modo mock...');
    
    // Configurar para usar solo datos mock
    if (window.gptmakerConfig) {
        window.gptmakerConfig.config.useMockMode = true;
        console.log('✅ Modo mock activado');
    }
    
    // Detener solicitudes infinitas
    stopInfiniteRequests();
}

function restartWithProxy() {
    console.log('🔄 Reiniciando con configuración de proxy...');
    
    // Limpiar cache
    localStorage.clear();
    console.log('✅ Cache limpiado');
    
    // Recargar página
    window.location.reload();
}

// Exportar funciones
window.stopInfiniteRequests = stopInfiniteRequests;
window.enableMockMode = enableMockMode;
window.restartWithProxy = restartWithProxy;

console.log('🚨 FUNCIONES DE EMERGENCIA DISPONIBLES:');
console.log('- stopInfiniteRequests() - Detener solicitudes infinitas');
console.log('- enableMockMode() - Activar solo datos mock');
console.log('- restartWithProxy() - Reiniciar con proxy');
console.log('');
console.log('💡 Ejecuta stopInfiniteRequests() AHORA para detener el spam');

