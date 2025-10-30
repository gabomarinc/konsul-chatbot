/**
 * Script de prueba para verificar la configuración de GPTMaker API
 * Ejecutar en la consola del navegador para diagnosticar problemas
 */

function testGPTMakerConfiguration() {
    console.log('🔍 Iniciando prueba de configuración de GPTMaker API...');
    
    // 1. Verificar que la configuración esté cargada
    if (!window.gptmakerConfig) {
        console.error('❌ GPTMakerConfig no está disponible');
        return false;
    }
    
    console.log('✅ GPTMakerConfig está disponible');
    
    // 2. Verificar token
    const token = window.gptmakerConfig.getToken();
    if (!token) {
        console.error('❌ No hay token configurado');
        return false;
    }
    
    console.log('✅ Token configurado:', token.substring(0, 20) + '...');
    
    // 3. Validar token
    const validation = window.gptmakerConfig.validateToken();
    if (!validation.valid) {
        console.error('❌ Token inválido:', validation.error);
        return false;
    }
    
    console.log('✅ Token válido');
    console.log('📋 Información del token:', validation.payload);
    
    // 4. Verificar BaseURL
    const baseURL = window.gptmakerConfig.getBaseURL();
    console.log('✅ BaseURL configurada:', baseURL);
    
    // 5. Crear instancia de API
    if (typeof GPTMakerAPI === 'undefined') {
        console.error('❌ GPTMakerAPI no está disponible');
        return false;
    }
    
    const api = new GPTMakerAPI();
    console.log('✅ Instancia de API creada');
    
    // 6. Probar conexión básica
    console.log('🔄 Probando conexión a la API...');
    
    api.getApiHealth()
        .then(result => {
            if (result.success) {
                console.log('✅ Conexión a la API exitosa');
                console.log('📊 Respuesta:', result);
            } else {
                console.error('❌ Error en la conexión:', result.error);
            }
        })
        .catch(error => {
            console.error('❌ Error en la prueba:', error);
        });
    
    return true;
}

// Función para probar endpoints específicos
async function testGPTMakerEndpoints() {
    console.log('🔍 Probando endpoints específicos...');
    
    if (!window.gptmakerConfig || typeof GPTMakerAPI === 'undefined') {
        console.error('❌ Configuración no disponible');
        return;
    }
    
    const api = new GPTMakerAPI();
    
    // Probar workspaces
    try {
        console.log('🔄 Probando endpoint de workspaces...');
        const workspaces = await api.getWorkspaces();
        console.log('📊 Workspaces:', workspaces);
    } catch (error) {
        console.error('❌ Error obteniendo workspaces:', error);
    }
    
    // Probar agentes
    try {
        console.log('🔄 Probando endpoint de agentes...');
        const agents = await api.getAgents();
        console.log('📊 Agentes:', agents);
    } catch (error) {
        console.error('❌ Error obteniendo agentes:', error);
    }
    
    // Probar chats
    try {
        console.log('🔄 Probando endpoint de chats...');
        const chats = await api.getChats();
        console.log('📊 Chats:', chats);
    } catch (error) {
        console.error('❌ Error obteniendo chats:', error);
    }
}

// Función para limpiar configuración
function resetGPTMakerConfiguration() {
    console.log('🧹 Limpiando configuración...');
    
    // Limpiar localStorage
    localStorage.removeItem('gptmaker_token');
    console.log('✅ Token eliminado de localStorage');
    
    // Recargar página para aplicar cambios
    console.log('🔄 Recargando página...');
    window.location.reload();
}

// Función para configurar token manualmente
function setGPTMakerToken(token) {
    if (!token) {
        console.error('❌ Token requerido');
        return false;
    }
    
    if (window.gptmakerConfig) {
        window.gptmakerConfig.setToken(token);
        console.log('✅ Token configurado');
        
        // Validar token
        const validation = window.gptmakerConfig.validateToken();
        if (validation.valid) {
            console.log('✅ Token válido');
            return true;
        } else {
            console.error('❌ Token inválido:', validation.error);
            return false;
        }
    } else {
        console.error('❌ GPTMakerConfig no disponible');
        return false;
    }
}

// Exportar funciones para uso en consola
window.testGPTMakerConfiguration = testGPTMakerConfiguration;
window.testGPTMakerEndpoints = testGPTMakerEndpoints;
window.resetGPTMakerConfiguration = resetGPTMakerConfiguration;
window.setGPTMakerToken = setGPTMakerToken;

console.log('🔧 Funciones de prueba disponibles:');
console.log('- testGPTMakerConfiguration() - Probar configuración básica');
console.log('- testGPTMakerEndpoints() - Probar endpoints específicos');
console.log('- resetGPTMakerConfiguration() - Limpiar configuración');
console.log('- setGPTMakerToken(token) - Configurar token manualmente');
console.log('');
console.log('💡 Ejecuta testGPTMakerConfiguration() para comenzar');

