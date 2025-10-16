/**
 * Configuración de Airtable
 * 
 * IMPORTANTE: Por seguridad, la API Key NO debe estar en el código del cliente.
 * En producción, usa una de estas opciones:
 * 
 * 1. Variable de entorno en el servidor backend
 * 2. Proxy API en tu servidor que maneje las credenciales
 * 3. Airtable Web API con autenticación OAuth
 * 
 * Para desarrollo/pruebas locales:
 * - Crea un archivo .env.local (no lo subas a git)
 * - O configura la API Key manualmente en el navegador
 */

const AirtableConfig = {
    // ID de la base de Airtable
    baseId: 'appoqCG814jMJbf4X',
    
    // Nombre de la tabla de usuarios
    tableName: 'Users',
    
    // API Key (NO poner aquí en producción)
    // Para desarrollo, configurar manualmente:
    // window.authService.setAirtableApiKey('TU_API_KEY_AQUI');
    apiKey: null,
    
    // Estructura de campos en Airtable
    fields: {
        email: 'Email',
        name: 'Name',
        company: 'Company',
        phone: 'Phone',
        password: 'Password',
        role: 'Role',
        status: 'Status',
        profileImage: 'ProfileImage',
        createdAt: 'CreatedAt',
        lastLogin: 'LastLogin'
    },
    
    // Valores por defecto para nuevos usuarios
    defaults: {
        role: 'user',
        status: 'active'
    }
};

// Exportar configuración
if (typeof window !== 'undefined') {
    window.AirtableConfig = AirtableConfig;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirtableConfig;
}


