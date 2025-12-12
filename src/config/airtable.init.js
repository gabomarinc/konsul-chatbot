/**
 * Configuración de Airtable
 * Lee la API Key desde window.AIRTABLE_API_KEY (configurada en variables de entorno)
 * En desarrollo local, se puede sobrescribir con un archivo local que defina window.AIRTABLE_API_KEY
 */

// Esperar a que authService esté disponible
(function() {
    function initAirtable() {
        if (window.authService && window.airtableService) {
            // Intentar obtener la API key desde window.AIRTABLE_API_KEY
            // (debe ser configurada mediante script inline o variable de entorno)
            const apiKey = window.AIRTABLE_API_KEY;
            
            if (apiKey) {
                window.authService.setAirtableApiKey(apiKey);
                console.log('✅ Token de Airtable configurado correctamente');
            } else {
                console.warn('⚠️ AIRTABLE_API_KEY no está configurada. Usando modo mock.');
                console.warn('💡 Para usar Airtable en producción, configura la variable de entorno AIRTABLE_API_KEY en Vercel');
            }
        } else {
            console.warn('⚠️ Esperando a que authService esté disponible...');
            setTimeout(initAirtable, 100);
        }
    }
    
    // Intentar configurar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAirtable);
    } else {
        initAirtable();
    }
})();



