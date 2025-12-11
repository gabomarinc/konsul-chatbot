/**
 * Script de diagnóstico para problemas de sesión
 * Ejecutar en la consola del navegador para diagnosticar problemas de autenticación
 */

function debugSession() {
    console.log('🔍 DIAGNÓSTICO DE SESIÓN');
    console.log('========================');
    
    // 1. Verificar localStorage
    console.log('\n1️⃣ Verificando localStorage:');
    const authDataLocal = localStorage.getItem('authData');
    if (authDataLocal) {
        try {
            const parsed = JSON.parse(authDataLocal);
            console.log('✅ authData encontrado en localStorage:', {
                hasUser: !!parsed.user,
                hasToken: !!parsed.token,
                userEmail: parsed.user?.email,
                timestamp: parsed.timestamp,
                rememberMe: parsed.rememberMe,
                age: parsed.timestamp ? Math.floor((Date.now() - parsed.timestamp) / (24 * 60 * 60 * 1000)) + ' días' : 'N/A'
            });
        } catch (e) {
            console.error('❌ Error parseando authData:', e);
        }
    } else {
        console.log('❌ No hay authData en localStorage');
    }
    
    // 2. Verificar sessionStorage
    console.log('\n2️⃣ Verificando sessionStorage:');
    const authDataSession = sessionStorage.getItem('authData');
    if (authDataSession) {
        console.log('✅ authData encontrado en sessionStorage');
    } else {
        console.log('❌ No hay authData en sessionStorage');
    }
    
    // 3. Verificar AuthService
    console.log('\n3️⃣ Verificando AuthService:');
    if (window.authService) {
        console.log('✅ AuthService disponible');
        console.log('Estado:', {
            hasUser: !!window.authService.currentUser,
            hasToken: !!window.authService.token,
            userEmail: window.authService.currentUser?.email,
            isAuthenticated: window.authService.isAuthenticated()
        });
        
        // Forzar recarga
        console.log('\n🔄 Forzando recarga de datos...');
        window.authService.loadAuthData();
        
        console.log('Estado después de recargar:', {
            hasUser: !!window.authService.currentUser,
            hasToken: !!window.authService.token,
            userEmail: window.authService.currentUser?.email,
            isAuthenticated: window.authService.isAuthenticated()
        });
    } else {
        console.error('❌ AuthService no disponible');
    }
    
    // 4. Verificar todas las claves de localStorage relacionadas con auth
    console.log('\n4️⃣ Todas las claves relacionadas con auth:');
    const authKeys = Object.keys(localStorage).filter(k => 
        k.toLowerCase().includes('auth') || 
        k.toLowerCase().includes('user') || 
        k.toLowerCase().includes('token')
    );
    console.log('Claves encontradas:', authKeys);
    authKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`  - ${key}:`, value ? (value.length > 100 ? value.substring(0, 100) + '...' : value) : 'vacío');
    });
    
    console.log('\n✅ Diagnóstico completo');
}

function fixSession() {
    console.log('🔧 INTENTANDO REPARAR SESIÓN...');
    
    // 1. Verificar si hay datos en localStorage
    const authData = localStorage.getItem('authData');
    if (!authData) {
        console.error('❌ No hay datos de autenticación guardados');
        console.log('💡 Necesitas hacer login nuevamente');
        return false;
    }
    
    try {
        const parsed = JSON.parse(authData);
        
        // 2. Verificar si AuthService está disponible
        if (!window.authService) {
            console.error('❌ AuthService no disponible');
            return false;
        }
        
        // 3. Forzar carga de datos
        console.log('🔄 Forzando carga de datos...');
        window.authService.currentUser = parsed.user;
        window.authService.token = parsed.token;
        
        // 4. Verificar autenticación
        const isAuth = window.authService.isAuthenticated();
        console.log('Estado después de reparar:', {
            isAuthenticated: isAuth,
            hasUser: !!window.authService.currentUser,
            hasToken: !!window.authService.token
        });
        
        if (isAuth) {
            console.log('✅ Sesión reparada! Recarga la página.');
            return true;
        } else {
            console.error('❌ No se pudo reparar la sesión');
            return false;
        }
    } catch (error) {
        console.error('❌ Error reparando sesión:', error);
        return false;
    }
}

// Exportar funciones
window.debugSession = debugSession;
window.fixSession = fixSession;

console.log('🔧 FUNCIONES DE DIAGNÓSTICO DISPONIBLES:');
console.log('- debugSession() - Diagnosticar problema de sesión');
console.log('- fixSession() - Intentar reparar sesión');




