/**
 * Script de prueba completa para verificar que todo funcione
 * Ejecutar en la consola del navegador
 */

async function testCompleteSystem() {
    console.log('🚀 PRUEBA COMPLETA DEL SISTEMA');
    console.log('===============================');
    
    // 1. Verificar configuración
    console.log('1️⃣ Verificando configuración...');
    checkAuthConfig();
    
    // 2. Verificar usuarios en Airtable
    console.log('2️⃣ Verificando usuarios en Airtable...');
    const hasUsers = await checkAirtableUsers();
    
    if (!hasUsers) {
        console.log('⚠️ No hay usuarios en Airtable, creando uno...');
        await createTestUser();
    }
    
    // 3. Probar login con Airtable
    console.log('3️⃣ Probando login con Airtable...');
    const loginSuccess = await testAirtableLogin();
    
    if (loginSuccess) {
        console.log('✅ Login exitoso!');
        
        // 4. Probar GPTMaker API
        console.log('4️⃣ Probando GPTMaker API...');
        await testGPTMakerAPI();
        
        // 5. Redirigir al dashboard
        console.log('5️⃣ Redirigiendo al dashboard...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } else {
        console.error('❌ Login falló. Usando modo mock...');
        enableMockMode();
        await testMockLogin();
    }
}

async function testGPTMakerAPI() {
    console.log('🌐 Probando GPTMaker API...');
    
    if (!window.gptmakerConfig) {
        console.error('❌ GPTMakerConfig no disponible');
        return false;
    }
    
    const token = window.gptmakerConfig.getToken();
    const baseURL = window.gptmakerConfig.getBaseURL();
    
    console.log('Token:', token ? 'Presente' : 'Ausente');
    console.log('BaseURL:', baseURL);
    
    if (!token) {
        console.error('❌ Token de GPTMaker no configurado');
        return false;
    }
    
    try {
        // Probar endpoint de workspaces
        const response = await fetch(`${baseURL}/v2/workspaces`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ GPTMaker API funcionando:', data);
            return true;
        } else {
            console.error('❌ Error en GPTMaker API:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('❌ Error conectando con GPTMaker API:', error);
        return false;
    }
}

async function testMockLogin() {
    console.log('🧪 Probando login con datos mock...');
    
    if (!window.authService) {
        console.error('❌ AuthService no disponible');
        return false;
    }
    
    // Usar primer usuario mock
    const user = window.mockAuthData.MOCK_USERS[0];
    
    try {
        const result = await window.authService.login(user.email, user.password);
        
        if (result.success) {
            console.log('✅ Login con mock exitoso!');
            console.log('Usuario:', result.user);
            
            // Redirigir al dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            
            return true;
        } else {
            console.error('❌ Login con mock falló:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error en login con mock:', error);
        return false;
    }
}

function quickFix() {
    console.log('🔧 SOLUCIÓN RÁPIDA...');
    
    // Limpiar todo
    localStorage.clear();
    sessionStorage.clear();
    
    // Activar modo mock
    enableMockMode();
    
    // Probar login mock
    testMockLogin();
}

// Exportar funciones
window.testCompleteSystem = testCompleteSystem;
window.testGPTMakerAPI = testGPTMakerAPI;
window.testMockLogin = testMockLogin;
window.quickFix = quickFix;

console.log('🚨 FUNCIONES DE PRUEBA COMPLETA DISPONIBLES:');
console.log('- testCompleteSystem() - Prueba completa del sistema');
console.log('- testGPTMakerAPI() - Probar solo GPTMaker API');
console.log('- testMockLogin() - Probar solo login mock');
console.log('- quickFix() - Solución rápida con modo mock');
console.log('');
console.log('💡 Ejecuta testCompleteSystem() para probar todo');

