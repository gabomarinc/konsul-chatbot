/**
 * Script de emergencia para solucionar el login
 * Ejecutar en la consola del navegador
 */

function fixLoginNow() {
    console.log('🚨 SOLUCIONANDO LOGIN INMEDIATAMENTE...');
    
    // 1. Limpiar todo
    console.log('1️⃣ Limpiando datos...');
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Forzar modo mock
    console.log('2️⃣ Configurando modo mock...');
    if (window.authService) {
        window.authService.useAirtable = false;
        console.log('✅ Modo mock activado');
    }
    
    // 3. Crear usuario de prueba si no existe
    console.log('3️⃣ Verificando datos mock...');
    if (!window.mockAuthData) {
        console.log('⚠️ Creando datos mock...');
        window.mockAuthData = {
            MOCK_USERS: [
                {
                    id: '1',
                    email: 'admin@chatbot.com',
                    password: 'admin123',
                    firstName: 'Admin',
                    lastName: 'Usuario',
                    phone: '+1234567890',
                    company: 'Chatbot Corp',
                    role: 'Administrador',
                    createdAt: '2024-01-01T00:00:00Z',
                    avatar: null
                },
                {
                    id: '2',
                    email: 'user@chatbot.com',
                    password: 'user123',
                    firstName: 'Juan',
                    lastName: 'Pérez',
                    phone: '+1234567891',
                    company: 'Mi Empresa',
                    role: 'Usuario',
                    createdAt: '2024-01-15T00:00:00Z',
                    avatar: null
                }
            ],
            findUserByEmail: function(email) {
                return this.MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
            },
            verifyPassword: function(user, password) {
                return user.password === password;
            },
            generateMockToken: function(user) {
                const payload = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
                };
                return btoa(JSON.stringify(payload));
            },
            simulateApiDelay: function(ms = 1000) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        };
        console.log('✅ Datos mock creados');
    }
    
    // 4. Probar login
    console.log('4️⃣ Probando login...');
    const user = window.mockAuthData.MOCK_USERS[0];
    
    if (window.authService) {
        return window.authService.login(user.email, user.password)
            .then(result => {
                if (result.success) {
                    console.log('✅ LOGIN EXITOSO!');
                    console.log('Usuario:', result.user);
                    console.log('Redirigiendo en 2 segundos...');
                    
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                    
                    return true;
                } else {
                    console.error('❌ Login falló:', result.error);
                    return false;
                }
            })
            .catch(error => {
                console.error('❌ Error:', error);
                return false;
            });
    } else {
        console.error('❌ AuthService no disponible');
        return false;
    }
}

function bypassLogin() {
    console.log('🚪 BYPASSING LOGIN...');
    
    // Crear datos de autenticación falsos
    const fakeUser = {
        id: '1',
        email: 'admin@chatbot.com',
        firstName: 'Admin',
        lastName: 'Usuario',
        role: 'Administrador'
    };
    
    const fakeToken = btoa(JSON.stringify({
        id: '1',
        email: 'admin@chatbot.com',
        role: 'Administrador',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    }));
    
    // Guardar en localStorage
    localStorage.setItem('authData', JSON.stringify({
        user: fakeUser,
        token: fakeToken,
        timestamp: Date.now()
    }));
    
    console.log('✅ Datos de autenticación falsos creados');
    console.log('Redirigiendo...');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Exportar funciones
window.fixLoginNow = fixLoginNow;
window.bypassLogin = bypassLogin;

console.log('🚨 FUNCIONES DE EMERGENCIA DISPONIBLES:');
console.log('- fixLoginNow() - Solucionar login completamente');
console.log('- bypassLogin() - Bypass completo del login');
console.log('');
console.log('💡 Ejecuta fixLoginNow() para solucionar el problema');

