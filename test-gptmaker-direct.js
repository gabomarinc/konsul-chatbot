/**
 * Script para probar GPTMaker API directamente
 * Ejecutar en la consola del navegador
 */

async function testGPTMakerDirect() {
    console.log('🌐 Probando GPTMaker API directamente...');
    
    // Crear instancia de GPTMakerAPI
    const api = new GPTMakerAPI();
    
    console.log('Configuración:', {
        baseURL: api.baseURL,
        hasToken: !!api.token,
        tokenLength: api.token ? api.token.length : 0
    });
    
    // Probar endpoint de workspaces
    console.log('1️⃣ Probando endpoint de workspaces...');
    try {
        const workspacesResult = await api.request('/v2/workspaces');
        
        if (workspacesResult.success) {
            console.log('✅ Workspaces obtenidos:', workspacesResult.data);
            
            // Probar endpoint de créditos del workspace
            console.log('2️⃣ Probando endpoint de créditos...');
            const creditsResult = await api.request('/v2/workspace/3E616E046D27E1CB623BFE5E9A6E9BDE/credits');
            
            if (creditsResult.success) {
                console.log('✅ Créditos obtenidos:', creditsResult.data);
            } else {
                console.error('❌ Error obteniendo créditos:', creditsResult.error);
            }
            
            // Probar endpoint de chats
            console.log('3️⃣ Probando endpoint de chats...');
            const chatsResult = await api.request('/v2/workspace/3E616E046D27E1CB623BFE5E9A6E9BDE/chats');
            
            if (chatsResult.success) {
                console.log('✅ Chats obtenidos:', chatsResult.data);
            } else {
                console.error('❌ Error obteniendo chats:', chatsResult.error);
            }
            
        } else {
            console.error('❌ Error obteniendo workspaces:', workspacesResult.error);
        }
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    }
}

function checkGPTMakerConfig() {
    console.log('🔧 Verificando configuración de GPTMaker...');
    
    console.log('GPTMakerConfig:', !!window.gptmakerConfig);
    console.log('GPTMAKER_CONFIG:', !!window.GPTMAKER_CONFIG);
    
    if (window.gptmakerConfig) {
        console.log('Token:', window.gptmakerConfig.getToken() ? 'Presente' : 'Ausente');
        console.log('BaseURL:', window.gptmakerConfig.getBaseURL());
    }
    
    if (window.GPTMAKER_CONFIG) {
        console.log('Token:', window.GPTMAKER_CONFIG.token ? 'Presente' : 'Ausente');
        console.log('BaseURL:', window.GPTMAKER_CONFIG.baseURL);
    }
    
    // Verificar si estamos en localhost
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    console.log('Es localhost:', isLocal);
    console.log('Hostname:', window.location.hostname);
}

function fixGPTMakerConfig() {
    console.log('🔧 Corrigiendo configuración de GPTMaker...');
    
    // Asegurar que la configuración esté correcta
    if (!window.GPTMAKER_CONFIG) {
        window.GPTMAKER_CONFIG = {
            token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJncHRtYWtlciIsImlkIjoiM0U2MTZFMDQ2RDI3RTFDQjYyM0JGRTVFOUE2RTlCREUiLCJ0ZW5hbnQiOiIzRTYxNkUwNDZEMjdFMUNCNjIzQkZFNUU5QTZFOUJERSIsInV1aWQiOiJjMDU1NGM1Yy1mYjhiLTQ5YjUtOGRhMy1mZGEzMTc1MGZlZDgifQ.el1Rog4MU6G0UJ8tBzsWhhnecYoZ6n7nUFC-6l1VpJE',
            baseURL: 'https://api.gptmaker.ai'
        };
        console.log('✅ GPTMAKER_CONFIG creado');
    }
    
    // Actualizar configuración para localhost
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
        window.GPTMAKER_CONFIG.baseURL = 'https://api.gptmaker.ai';
        console.log('✅ BaseURL actualizada para localhost:', window.GPTMAKER_CONFIG.baseURL);
    }
    
    // Recargar configuración si existe
    if (window.gptmakerConfig) {
        window.gptmakerConfig.loadConfig();
        console.log('✅ Configuración recargada');
    }
}

function reloadDashboard() {
    console.log('🔄 Recargando dashboard...');
    
    // Limpiar cache
    if (window.dashboard && window.dashboard.dataService) {
        window.dashboard.dataService.clearCache();
        console.log('✅ Cache limpiado');
    }
    
    // Recargar página
    window.location.reload();
}

// Exportar funciones
window.testGPTMakerDirect = testGPTMakerDirect;
window.checkGPTMakerConfig = checkGPTMakerConfig;
window.fixGPTMakerConfig = fixGPTMakerConfig;
window.reloadDashboard = reloadDashboard;

console.log('🔧 FUNCIONES DE GPTMAKER DISPONIBLES:');
console.log('- testGPTMakerDirect() - Probar GPTMaker API directamente');
console.log('- checkGPTMakerConfig() - Verificar configuración');
console.log('- fixGPTMakerConfig() - Corregir configuración');
console.log('- reloadDashboard() - Recargar dashboard');
console.log('');
console.log('💡 Ejecuta checkGPTMakerConfig() para ver el estado actual');

