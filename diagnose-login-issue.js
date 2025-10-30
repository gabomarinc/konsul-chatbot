/**
 * Script de diagnóstico específico para el login
 * Ejecutar en la consola del navegador
 */

function diagnoseLoginIssue() {
    console.log('🔍 DIAGNÓSTICO DEL PROBLEMA DE LOGIN');
    console.log('=====================================');
    
    // 1. Verificar estado de autenticación
    console.log('1️⃣ Estado de autenticación:');
    if (window.authService) {
        const isAuth = window.authService.isAuthenticated();
        const user = window.authService.getCurrentUser();
        const token = window.authService.token;
        
        console.log('isAuthenticated:', isAuth);
        console.log('currentUser:', user);
        console.log('token:', token ? 'Presente' : 'Ausente');
        
        if (!isAuth) {
            console.log('❌ Usuario no autenticado - esto causa la redirección');
        }
    } else {
        console.log('❌ AuthService no disponible');
    }
    
    // 2. Verificar localStorage
    console.log('2️⃣ Datos en localStorage:');
    const authData = localStorage.getItem('authData');
    const authToken = localStorage.getItem('authToken');
    const currentUser = localStorage.getItem('currentUser');
    
    console.log('authData:', authData ? 'Presente' : 'Ausente');
    console.log('authToken:', authToken ? 'Presente' : 'Ausente');
    console.log('currentUser:', currentUser ? 'Presente' : 'Ausente');
    
    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            console.log('authData contenido:', parsed);
        } catch (e) {
            console.log('❌ Error parseando authData:', e);
        }
    }
    
    // 3. Verificar configuración de Airtable
    console.log('3️⃣ Configuración de Airtable:');
    if (window.authService) {
        console.log('useAirtable:', window.authService.useAirtable);
    }
    if (window.airtableService) {
        console.log('API Key configurada:', !!window.airtableService.apiKey);
    }
    
    // 4. Verificar si estamos en login.html
    console.log('4️⃣ Página actual:');
    console.log('pathname:', window.location.pathname);
    console.log('es login.html:', window.location.pathname.includes('login.html'));
}

function fixLoginIssue() {
    console.log('🔧 SOLUCIONANDO PROBLEMA DE LOGIN...');
    
    // 1. Limpiar datos corruptos
    console.log('1️⃣ Limpiando datos corruptos...');
    localStorage.removeItem('authData');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.clear();
    console.log('✅ Datos limpiados');
    
    // 2. Asegurar que Airtable esté configurado
    console.log('2️⃣ Configurando Airtable...');
    if (window.authService) {
        window.authService.useAirtable = true;
        console.log('✅ Airtable activado');
    }
    
    // 3. Probar login automático
    console.log('3️⃣ Probando login automático...');
    if (window.authService && window.mockAuthData) {
        const user = window.mockAuthData.MOCK_USERS[0];
        
        window.authService.login(user.email, user.password)
            .then(result => {
                if (result.success) {
                    console.log('✅ Login exitoso!');
                    console.log('Usuario:', result.user);
                    
                    // Verificar autenticación
                    const isAuth = window.authService.isAuthenticated();
                    console.log('Estado después del login:', isAuth ? 'Autenticado' : 'No autenticado');
                    
                    if (isAuth) {
                        console.log('✅ Redirigiendo al dashboard...');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    } else {
                        console.error('❌ Login exitoso pero no está autenticado');
                    }
                } else {
                    console.error('❌ Login falló:', result.error);
                }
            })
            .catch(error => {
                console.error('❌ Error en login:', error);
            });
    } else {
        console.error('❌ Servicios no disponibles');
    }
}

function forceLogin() {
    console.log('🚨 FORZANDO LOGIN...');
    
    // Crear datos de autenticación falsos pero válidos
    const fakeUser = {
        id: '1',
        email: 'admin@chatbot.com',
        firstName: 'Admin',
        lastName: 'Usuario',
        role: 'admin'
    };
    
    const fakeToken = btoa(JSON.stringify({
        id: '1',
        email: 'admin@chatbot.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }));
    
    // Guardar en localStorage
    localStorage.setItem('authData', JSON.stringify({
        user: fakeUser,
        token: fakeToken,
        timestamp: Date.now()
    }));
    
    // Configurar AuthService si está disponible
    if (window.authService) {
        window.authService.currentUser = fakeUser;
        window.authService.token = fakeToken;
        console.log('✅ AuthService configurado');
    }
    
    console.log('✅ Datos de autenticación forzados');
    console.log('Redirigiendo al dashboard...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function clearAllAndReload() {
    console.log('🧹 LIMPIANDO TODO Y RECARGANDO...');
    
    // Limpiar todo
    localStorage.clear();
    sessionStorage.clear();
    
    // Recargar página
    window.location.reload();
}

// Exportar funciones
window.diagnoseLoginIssue = diagnoseLoginIssue;
window.fixLoginIssue = fixLoginIssue;
window.forceLogin = forceLogin;
window.clearAllAndReload = clearAllAndReload;

console.log('🚨 FUNCIONES DE DIAGNÓSTICO DE LOGIN DISPONIBLES:');
console.log('- diagnoseLoginIssue() - Diagnosticar problema');
console.log('- fixLoginIssue() - Solucionar problema');
console.log('- forceLogin() - Forzar login');
console.log('- clearAllAndReload() - Limpiar todo y recargar');
console.log('');
console.log('💡 Ejecuta diagnoseLoginIssue() para ver qué está fallando');

