/**
 * Configuración de Airtable
 * Lee la API Key desde window.AIRTABLE_API_KEY (configurada en variables de entorno)
 * En desarrollo local, se puede sobrescribir con un archivo local que defina window.AIRTABLE_API_KEY
 */

// Esperar a que authService esté disponible
(function() {
    let attempts = 0;
    const maxAttempts = 50; // 5 segundos máximo
    
    function initAirtable() {
        attempts++;
        
        // Verificar que los servicios estén disponibles
        if (!window.authService) {
            if (attempts < maxAttempts) {
                setTimeout(initAirtable, 100);
                return;
            } else {
                console.error('❌ authService no está disponible después de múltiples intentos');
                return;
            }
        }
        
        if (!window.airtableService) {
            if (attempts < maxAttempts) {
                setTimeout(initAirtable, 100);
                return;
            } else {
                console.error('❌ airtableService no está disponible después de múltiples intentos');
                return;
            }
        }
        
        // Intentar obtener la API key desde window.AIRTABLE_API_KEY
        // (debe ser configurada mediante script inline o variable de entorno)
        const apiKey = window.AIRTABLE_API_KEY;
        
        console.log('🔍 Verificando configuración de Airtable...');
        console.log('📋 AIRTABLE_API_KEY disponible:', !!apiKey);
        console.log('📋 Tipo:', typeof apiKey);
        console.log('📋 Longitud:', apiKey ? apiKey.length : 0);
        
        if (apiKey && apiKey.trim() !== '') {
            window.authService.setAirtableApiKey(apiKey);
            console.log('✅ Token de Airtable configurado correctamente');
            console.log('🔑 API Key configurada en airtableService:', !!window.airtableService.apiKey);
        } else {
            console.error('❌ AIRTABLE_API_KEY no está configurada o está vacía');
            console.error('💡 Verifica que:');
            console.error('   1. La variable AIRTABLE_API_KEY esté en Vercel');
            console.error('   2. El script de postbuild la haya inyectado correctamente');
            console.error('   3. El deployment se haya completado después de agregar la variable');
            console.warn('⚠️ Usando modo mock hasta que se configure la API key');
        }
    }
    
    // Intentar configurar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAirtable);
    } else {
        initAirtable();
    }
})();



