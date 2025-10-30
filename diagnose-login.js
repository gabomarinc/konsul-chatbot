/**
 * Script de diagnóstico rápido para el login
 * Ejecutar en la consola del navegador en login.html
 */

function diagnoseLogin() {
    console.log('🔍 DIAGNÓSTICO DEL LOGIN');
    console.log('========================');
    
    // 1. Verificar que los scripts estén cargados
    console.log('1️⃣ Verificando scripts...');
    console.log('AuthService:', typeof window.authService);
    console.log('MockAuthData:', typeof window.mockAuthData);
    console.log('AirtableService:', typeof window.airtableService);
    
    // 2. Verificar configuración de AuthService
    if (window.authService) {
        console.log('2️⃣ Configuración de AuthService:');
        console.log('useAirtable:', window.authService.useAirtable);
        console.log('currentUser:', window.authService.currentUser);
        console.log('token:', window.authService.token ? 'Presente' : 'Ausente');
        console.log('isAuthenticated:', window.authService.isAuthenticated());
    }
    
    // 3. Verificar datos mock
    if (window.mockAuthData) {
        console.log('3️⃣ Datos mock disponibles:');
        console.log('Usuarios:', window.mockAuthData.MOCK_USERS.length);
        window.mockAuthData.MOCK_USERS.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.email} (${user.password})`);
        });
    }
    
    // 4. Probar login directamente
    console.log('4️⃣ Probando login...');
    if (window.authService && window.mockAuthData) {
        const testUser = window.mockAuthData.MOCK_USERS[0];
        console.log('Probando con:', testUser.email);
        
        return window.authService.login(testUser.email, testUser.password)
            .then(result => {
                console.log('Resultado del login:', result);
                if (result.success) {
                    console.log('✅ Login exitoso!');
                    console.log('Usuario:', result.user);
                    console.log('Estado de autenticación:', window.authService.isAuthenticated());
                } else {
                    console.error('❌ Login falló:', result.error);
                }
                return result;
            })
            .catch(error => {
                console.error('❌ Error en login:', error);
                return { success: false, error: error.message };
            });
    } else {
        console.error('❌ Servicios no disponibles');
        return Promise.resolve({ success: false, error: 'Servicios no disponibles' });
    }
}

function forceMockMode() {
    console.log('🧪 Forzando modo mock...');
    
    if (window.authService) {
        window.authService.useAirtable = false;
        console.log('✅ Modo mock activado');
        console.log('useAirtable:', window.authService.useAirtable);
    }
}

function clearAllAuth() {
    console.log('🧹 Limpiando toda la autenticación...');
    
    // Limpiar localStorage
    localStorage.removeItem('authData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('gptmaker_token');
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    console.log('✅ Datos limpiados');
    
    // Recargar página
    window.location.reload();
}

function quickLogin() {
    console.log('⚡ Login rápido...');
    
    if (!window.authService) {
        console.error('❌ AuthService no disponible');
        return;
    }
    
    // Forzar modo mock
    window.authService.useAirtable = false;
    
    // Usar primer usuario mock
    const user = window.mockAuthData.MOCK_USERS[0];
    
    return window.authService.login(user.email, user.password)
        .then(result => {
            if (result.success) {
                console.log('✅ Login exitoso! Redirigiendo...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                console.error('❌ Login falló:', result.error);
            }
            return result;
        });
}

// Exportar funciones
window.diagnoseLogin = diagnoseLogin;
window.forceMockMode = forceMockMode;
window.clearAllAuth = clearAllAuth;
window.quickLogin = quickLogin;

console.log('🚨 FUNCIONES DE DIAGNÓSTICO DISPONIBLES:');
console.log('- diagnoseLogin() - Diagnóstico completo');
console.log('- forceMockMode() - Forzar modo mock');
console.log('- clearAllAuth() - Limpiar todo y recargar');
console.log('- quickLogin() - Login rápido con datos mock');
console.log('');
console.log('💡 Ejecuta diagnoseLogin() para ver qué está fallando');

