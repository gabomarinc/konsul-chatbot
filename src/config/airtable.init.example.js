/**
 * Archivo de ejemplo para configurar Airtable
 * 
 * INSTRUCCIONES:
 * 1. Copia este archivo y renómbralo a 'airtable.init.js'
 * 2. Reemplaza 'TU_API_KEY_AQUI' con tu API Key personal de Airtable
 * 3. NO subas el archivo airtable.init.js a Git (está en .gitignore)
 * 
 * Para obtener tu API Key:
 * 1. Ve a https://airtable.com/create/tokens
 * 2. Crea un nuevo token personal
 * 3. Dale permisos de lectura/escritura a tu base 'appoqCG814jMJbf4X'
 * 4. Copia el token generado
 */

// Configurar la API Key de Airtable
if (window.authService) {
    window.authService.setAirtableApiKey('TU_API_KEY_AQUI');
    console.log('🔑 API Key de Airtable configurada');
} else {
    console.warn('⚠️ authService no está disponible aún');
}



