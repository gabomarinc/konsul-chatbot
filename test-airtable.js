/**
 * Script para verificar y configurar usuarios en Airtable
 * Ejecutar en la consola del navegador
 */

async function checkAirtableUsers() {
    console.log('🔍 Verificando usuarios en Airtable...');
    
    if (!window.airtableService || !window.airtableService.apiKey) {
        console.error('❌ AirtableService no configurado');
        return false;
    }
    
    try {
        const result = await window.airtableService.getAllUsers({ maxRecords: 10 });
        
        if (result.success) {
            console.log(`✅ ${result.users.length} usuarios encontrados en Airtable:`);
            result.users.forEach((user, index) => {
                console.log(`  ${index + 1}. ${user.email} (${user.name}) - ${user.role}`);
            });
            
            if (result.users.length === 0) {
                console.log('⚠️ No hay usuarios en Airtable. Creando usuario de prueba...');
                return await createTestUser();
            }
            
            return true;
        } else {
            console.error('❌ Error obteniendo usuarios:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error verificando usuarios:', error);
        return false;
    }
}

async function createTestUser() {
    console.log('👤 Creando usuario de prueba en Airtable...');
    
    const testUser = {
        email: 'admin@chatbot.com',
        firstName: 'Admin',
        lastName: 'Usuario',
        password: 'admin123',
        role: 'admin',
        company: 'Chatbot Corp'
    };
    
    try {
        const result = await window.airtableService.createUser(testUser);
        
        if (result.success) {
            console.log('✅ Usuario de prueba creado:', result.user);
            return true;
        } else {
            console.error('❌ Error creando usuario:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        return false;
    }
}

async function testAirtableLogin() {
    console.log('🔐 Probando login con Airtable...');
    
    if (!window.authService) {
        console.error('❌ AuthService no disponible');
        return false;
    }
    
    // Asegurar que Airtable esté activado
    window.authService.useAirtable = true;
    console.log('✅ Airtable activado para login');
    
    // Probar con usuario de prueba
    const testEmail = 'admin@chatbot.com';
    const testPassword = 'admin123';
    
    try {
        const result = await window.authService.login(testEmail, testPassword);
        
        if (result.success) {
            console.log('✅ Login con Airtable exitoso!');
            console.log('Usuario:', result.user);
            return true;
        } else {
            console.error('❌ Login falló:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en login:', error);
        return false;
    }
}

function enableAirtableMode() {
    console.log('🗄️ Activando modo Airtable...');
    
    if (window.authService) {
        window.authService.useAirtable = true;
        console.log('✅ Modo Airtable activado');
        console.log('useAirtable:', window.authService.useAirtable);
    } else {
        console.error('❌ AuthService no disponible');
    }
}

function enableMockMode() {
    console.log('🧪 Activando modo Mock...');
    
    if (window.authService) {
        window.authService.useAirtable = false;
        console.log('✅ Modo Mock activado');
        console.log('useAirtable:', window.authService.useAirtable);
    } else {
        console.error('❌ AuthService no disponible');
    }
}

function checkAuthConfig() {
    console.log('🔧 Verificando configuración de autenticación...');
    
    console.log('AuthService:', !!window.authService);
    console.log('AirtableService:', !!window.airtableService);
    console.log('MockAuthData:', !!window.mockAuthData);
    
    if (window.authService) {
        console.log('useAirtable:', window.authService.useAirtable);
        console.log('currentUser:', window.authService.currentUser);
        console.log('token:', window.authService.token ? 'Presente' : 'Ausente');
    }
    
    if (window.airtableService) {
        console.log('API Key configurada:', !!window.airtableService.apiKey);
        console.log('Base ID:', window.airtableService.baseId);
        console.log('Table Name:', window.airtableService.tableName);
    }
}

// Exportar funciones
window.checkAirtableUsers = checkAirtableUsers;
window.createTestUser = createTestUser;
window.testAirtableLogin = testAirtableLogin;
window.enableAirtableMode = enableAirtableMode;
window.enableMockMode = enableMockMode;
window.checkAuthConfig = checkAuthConfig;

console.log('🔧 FUNCIONES DE AIRTABLE DISPONIBLES:');
console.log('- checkAirtableUsers() - Verificar usuarios en Airtable');
console.log('- createTestUser() - Crear usuario de prueba');
console.log('- testAirtableLogin() - Probar login con Airtable');
console.log('- enableAirtableMode() - Activar modo Airtable');
console.log('- enableMockMode() - Activar modo Mock');
console.log('- checkAuthConfig() - Verificar configuración');
console.log('');
console.log('💡 Ejecuta checkAuthConfig() para ver el estado actual');

