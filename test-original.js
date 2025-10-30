/**
 * Script de prueba final para verificar que todo funcione como antes
 * Ejecutar en la consola del navegador
 */

function testOriginalFunctionality() {
    console.log('🚀 PRUEBA DE FUNCIONALIDAD ORIGINAL');
    console.log('===================================');
    
    // 1. Verificar configuración de GPTMaker
    console.log('1️⃣ Verificando GPTMaker...');
    console.log('GPTMAKER_CONFIG:', window.GPTMAKER_CONFIG);
    console.log('gptmakerConfig:', window.gptmakerConfig ? 'Disponible' : 'No disponible');
    
    if (window.gptmakerConfig) {
        console.log('Token:', window.gptmakerConfig.getToken() ? 'Presente' : 'Ausente');
        console.log('BaseURL:', window.gptmakerConfig.getBaseURL());
    }
    
    // 2. Verificar AuthService
    console.log('2️⃣ Verificando AuthService...');
    if (window.authService) {
        console.log('useAirtable:', window.authService.useAirtable);
        console.log('isAuthenticated:', window.authService.isAuthenticated());
    }
    
    // 3. Probar GPTMaker API
    console.log('3️⃣ Probando GPTMaker API...');
    if (window.gptmakerConfig) {
        const api = new GPTMakerAPI();
        console.log('API creada con baseURL:', api.baseURL);
        console.log('API tiene token:', !!api.token);
        
        // Probar endpoint simple
        api.request('/v2/workspaces')
            .then(result => {
                if (result.success) {
                    console.log('✅ GPTMaker API funcionando:', result.data);
                } else {
                    console.error('❌ Error en GPTMaker API:', result.error);
                }
            })
            .catch(error => {
                console.error('❌ Error en prueba:', error);
            });
    }
    
    // 4. Probar login
    console.log('4️⃣ Probando login...');
    if (window.authService && window.mockAuthData) {
        const user = window.mockAuthData.MOCK_USERS[0];
        console.log('Probando login con:', user.email);
        
        window.authService.login(user.email, user.password)
            .then(result => {
                if (result.success) {
                    console.log('✅ Login exitoso:', result.user);
                    console.log('Estado de autenticación:', window.authService.isAuthenticated());
                } else {
                    console.error('❌ Login falló:', result.error);
                }
            })
            .catch(error => {
                console.error('❌ Error en login:', error);
            });
    }
}

function quickTest() {
    console.log('⚡ PRUEBA RÁPIDA...');
    
    // Limpiar todo
    localStorage.clear();
    sessionStorage.clear();
    
    // Recargar página
    window.location.reload();
}

// Exportar funciones
window.testOriginalFunctionality = testOriginalFunctionality;
window.quickTest = quickTest;

console.log('🔧 FUNCIONES DE PRUEBA ORIGINAL DISPONIBLES:');
console.log('- testOriginalFunctionality() - Prueba completa');
console.log('- quickTest() - Limpiar y recargar');
console.log('');
console.log('💡 Ejecuta testOriginalFunctionality() para verificar que todo funcione');

