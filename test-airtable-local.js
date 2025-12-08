/**
 * Script de prueba para verificar la conexión con Airtable en local
 * Ejecuta este código en la consola del navegador (F12) cuando estés en localhost
 */

async function testAirtableLocal() {
    console.log('🔍 Verificando configuración de Airtable en local...\n');
    
    // 1. Verificar que los servicios estén disponibles
    console.log('1️⃣ Verificando servicios...');
    if (!window.airtableService) {
        console.error('❌ airtableService no está disponible');
        return false;
    }
    console.log('✅ airtableService disponible');
    
    if (!window.authService) {
        console.error('❌ authService no está disponible');
        return false;
    }
    console.log('✅ authService disponible\n');
    
    // 2. Verificar API Key
    console.log('2️⃣ Verificando API Key...');
    const apiKey = window.AIRTABLE_API_KEY;
    if (!apiKey || apiKey === 'TU_API_KEY_AQUI') {
        console.error('❌ API Key no configurada');
        console.log('💡 Edita src/config/dev.config.js y agrega tu API Key');
        return false;
    }
    console.log('✅ API Key configurada:', apiKey.substring(0, 10) + '...');
    
    if (!window.airtableService.apiKey) {
        console.error('❌ API Key no está configurada en airtableService');
        console.log('💡 Intentando configurar...');
        window.authService.setAirtableApiKey(apiKey);
    }
    console.log('✅ API Key configurada en airtableService\n');
    
    // 3. Verificar modo de autenticación
    console.log('3️⃣ Verificando modo de autenticación...');
    if (!window.authService.useAirtable) {
        console.error('❌ useAirtable es false');
        console.log('💡 Intentando activar Airtable...');
        window.authService.setAirtableApiKey(apiKey);
    }
    console.log('✅ useAirtable:', window.authService.useAirtable, '\n');
    
    // 4. Probar conexión con Airtable
    console.log('4️⃣ Probando conexión con Airtable...');
    try {
        const result = await window.airtableService.getAllUsers({ maxRecords: 5 });
        if (result.success) {
            console.log(`✅ Conexión exitosa! Se encontraron ${result.users.length} usuarios`);
            if (result.users.length > 0) {
                console.log('📋 Usuarios encontrados:');
                result.users.forEach((user, i) => {
                    console.log(`   ${i + 1}. ${user.email} - ${user.name}`);
                });
            }
            return true;
        } else {
            console.error('❌ Error en la conexión:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error al probar conexión:', error);
        console.error('   Detalles:', error.message);
        return false;
    }
}

// Ejecutar automáticamente
console.log('🚀 Iniciando prueba de Airtable...\n');
testAirtableLocal().then(success => {
    if (success) {
        console.log('\n✅ ¡Todo funciona correctamente! Airtable está conectado.');
    } else {
        console.log('\n❌ Hay problemas con la configuración. Revisa los mensajes arriba.');
    }
});

// Exportar función para uso manual
window.testAirtableLocal = testAirtableLocal;
