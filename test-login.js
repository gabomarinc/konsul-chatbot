/**
 * Script para probar el sistema de login
 * Ejecutar en la consola del navegador
 */

function testLogin() {
    console.log('🔐 Probando sistema de login...');
    
    // Verificar que authService esté disponible
    if (!window.authService) {
        console.error('❌ AuthService no está disponible');
        return false;
    }
    
    console.log('✅ AuthService disponible');
    
    // Probar login con usuario mock
    const testUser = {
        email: 'admin@chatbot.com',
        password: 'admin123'
    };
    
    console.log('🧪 Probando login con:', testUser.email);
    
    return window.authService.login(testUser.email, testUser.password)
        .then(result => {
            if (result.success) {
                console.log('✅ Login exitoso:', result);
                console.log('👤 Usuario:', result.user);
                console.log('🔑 Token:', result.token ? 'Presente' : 'Ausente');
                
                // Verificar autenticación
                const isAuth = window.authService.isAuthenticated();
                console.log('🔐 Estado de autenticación:', isAuth ? 'Autenticado' : 'No autenticado');
                
                return true;
            } else {
                console.error('❌ Login falló:', result.error);
                return false;
            }
        })
        .catch(error => {
            console.error('❌ Error en login:', error);
            return false;
        });
}

function testLogout() {
    console.log('🚪 Probando logout...');
    
    if (!window.authService) {
        console.error('❌ AuthService no está disponible');
        return false;
    }
    
    window.authService.logout();
    console.log('✅ Logout ejecutado');
    
    const isAuth = window.authService.isAuthenticated();
    console.log('🔐 Estado después del logout:', isAuth ? 'Aún autenticado' : 'No autenticado');
    
    return !isAuth;
}

function resetAuth() {
    console.log('🔄 Reseteando autenticación...');
    
    // Limpiar localStorage
    localStorage.removeItem('authData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('authData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    
    console.log('✅ Datos de autenticación limpiados');
    
    // Recargar página
    window.location.reload();
}

function checkAuthStatus() {
    console.log('🔍 Verificando estado de autenticación...');
    
    if (!window.authService) {
        console.error('❌ AuthService no está disponible');
        return;
    }
    
    const isAuth = window.authService.isAuthenticated();
    const user = window.authService.getCurrentUser();
    const token = window.authService.token;
    
    console.log('📊 Estado actual:', {
        autenticado: isAuth,
        usuario: user ? `${user.name} (${user.email})` : 'Ninguno',
        token: token ? 'Presente' : 'Ausente',
        tokenLength: token ? token.length : 0
    });
    
    return {
        isAuthenticated: isAuth,
        user: user,
        hasToken: !!token
    };
}

// Exportar funciones
window.testLogin = testLogin;
window.testLogout = testLogout;
window.resetAuth = resetAuth;
window.checkAuthStatus = checkAuthStatus;

console.log('🔧 FUNCIONES DE PRUEBA DE LOGIN DISPONIBLES:');
console.log('- testLogin() - Probar login con usuario mock');
console.log('- testLogout() - Probar logout');
console.log('- resetAuth() - Limpiar autenticación y recargar');
console.log('- checkAuthStatus() - Verificar estado actual');
console.log('');
console.log('💡 Ejecuta checkAuthStatus() para ver el estado actual');

