/**
 * Script de Diagnóstico Total: Encontrar Campos Personalizados
 * 
 * Este script busca campos personalizados en TODAS las estructuras posibles
 */

(async function diagnosticarCamposPersonalizados() {
    console.log('🔍 ==========================================');
    console.log('🔍 DIAGNÓSTICO TOTAL: Campos Personalizados');
    console.log('🔍 ==========================================\n');

    // Buscar API
    const api = window.gptmakerAPI || 
                (window.dashboard && window.dashboard.api) ||
                (window.dashboard && window.dashboard.dataService && window.dashboard.dataService.api);
    
    if (!api) {
        console.error('❌ API no disponible');
        return;
    }

    // Buscar DataService
    const dataService = window.dataService || 
                       (window.dashboard && window.dashboard.dataService);
    
    if (!dataService) {
        console.error('❌ DataService no disponible');
        return;
    }

    // Obtener chats
    console.log('📋 PASO 1: Obteniendo chats...\n');
    const chatsResult = await dataService.getAllChats({ pageSize: 10 });
    
    if (!chatsResult.success || !chatsResult.data || chatsResult.data.length === 0) {
        console.error('❌ No se pudieron obtener chats');
        return;
    }

    // Buscar chat de Gabriel
    const gabrielChat = chatsResult.data.find(c => 
        (c.name && c.name.toLowerCase().includes('gabriel'))
    );

    if (!gabrielChat) {
        console.log('⚠️ No se encontró chat de Gabriel, usando el primero');
        const chat = chatsResult.data[0];
        await diagnosticarChat(chat, api);
    } else {
        console.log('✅ Chat de Gabriel encontrado:', gabrielChat.name);
        await diagnosticarChat(gabrielChat, api);
    }
})();

async function diagnosticarChat(chat, api) {
    console.log('\n\n🔍 ==========================================');
    console.log('🔍 ANALIZANDO CHAT COMPLETO');
    console.log('🔍 ==========================================\n');
    
    console.log('📊 CHAT ID:', chat.id);
    console.log('📊 NOMBRE:', chat.name);
    console.log('📊 RECIPIENT:', chat.recipient);
    console.log('📊 USER ID:', chat.userId);
    
    // Función recursiva para buscar campos personalizados
    const buscarCamposPersonalizados = (obj, path = 'root', depth = 0) => {
        if (depth > 10) return []; // Limitar profundidad
        
        const encontrados = [];
        const keys = Object.keys(obj || {});
        
        keys.forEach(key => {
            const currentPath = path ? `${path}.${key}` : key;
            const value = obj[key];
            
            // Buscar propiedades que puedan contener campos personalizados
            if (key.toLowerCase().includes('custom') || 
                key.toLowerCase().includes('field') ||
                key.toLowerCase().includes('personalizado') ||
                key.toLowerCase().includes('zona') ||
                key.toLowerCase().includes('perfil') ||
                key.toLowerCase().includes('dui') ||
                key.toLowerCase().includes('constancia') ||
                key.toLowerCase().includes('comprobante')) {
                encontrados.push({
                    path: currentPath,
                    key: key,
                    value: value,
                    type: typeof value
                });
            }
            
            // Buscar recursivamente en objetos
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                encontrados.push(...buscarCamposPersonalizados(value, currentPath, depth + 1));
            }
            
            // Buscar en arrays de objetos
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (item && typeof item === 'object') {
                        encontrados.push(...buscarCamposPersonalizados(item, `${currentPath}[${index}]`, depth + 1));
                    }
                });
            }
        });
        
        return encontrados;
    };
    
    console.log('\n📋 PASO 2: Buscando campos personalizados en el objeto chat...\n');
    const camposEnChat = buscarCamposPersonalizados(chat);
    if (camposEnChat.length > 0) {
        console.log(`✅ ${camposEnChat.length} posibles campos personalizados encontrados en el chat:`);
        camposEnChat.forEach(campo => {
            console.log(`  - ${campo.path}:`, campo.value);
        });
    } else {
        console.log('❌ No se encontraron campos personalizados en el objeto chat');
    }
    
    // Obtener chat completo desde la API
    console.log('\n📋 PASO 3: Obteniendo chat completo desde la API...\n');
    try {
        const endpoints = [
            `/v2/chat/${chat.id}`,
            `/v2/workspace/${chat.workspaceId || 'default'}/chat/${chat.id}`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔍 Probando endpoint: ${endpoint}`);
                const result = await api.request(endpoint);
                if (result.success && result.data) {
                    console.log(`✅ Chat completo obtenido desde: ${endpoint}`);
                    console.log('📊 Estructura completa:', JSON.stringify(result.data, null, 2));
                    
                    const camposEnChatCompleto = buscarCamposPersonalizados(result.data);
                    if (camposEnChatCompleto.length > 0) {
                        console.log(`\n✅ ${camposEnChatCompleto.length} campos personalizados encontrados:`);
                        camposEnChatCompleto.forEach(campo => {
                            console.log(`  - ${campo.path}:`, campo.value);
                        });
                    }
                    break;
                }
            } catch (err) {
                console.log(`⚠️ Error con ${endpoint}:`, err.message);
            }
        }
    } catch (err) {
        console.log('⚠️ Error obteniendo chat completo:', err.message);
    }
    
    // Obtener campos disponibles
    console.log('\n📋 PASO 4: Obteniendo campos personalizados disponibles...\n');
    const fieldsResult = await api.getCustomFields();
    if (fieldsResult.success && fieldsResult.data) {
        console.log(`✅ ${fieldsResult.data.length} campos disponibles:`);
        fieldsResult.data.forEach(f => {
            console.log(`  - ${f.name} (${f.jsonName || 'N/A'})`);
        });
        window.availableFields = fieldsResult.data;
    }
    
    // Intentar obtener contacto directamente
    console.log('\n📋 PASO 5: Intentando obtener contacto directamente...\n');
    const contactIds = [chat.recipient, chat.userId, chat.id.split('-').pop()].filter(id => id);
    
    for (const contactId of contactIds) {
        console.log(`🔍 Probando contactId: ${contactId}`);
        
        const endpoints = [
            `/v2/contact/${contactId}`,
            `/v2/user/${contactId}`,
            `/v2/chat/${chat.id}/contact`,
            `/v2/chat/${chat.id}/user`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`  🔄 Probando: ${endpoint}`);
                const result = await api.request(endpoint);
                if (result.success && result.data) {
                    console.log(`  ✅ Éxito con ${endpoint}`);
                    console.log('  📊 Estructura:', JSON.stringify(result.data, null, 2));
                    
                    const camposEnContacto = buscarCamposPersonalizados(result.data);
                    if (camposEnContacto.length > 0) {
                        console.log(`  ✅ ${camposEnContacto.length} campos personalizados encontrados:`);
                        camposEnContacto.forEach(campo => {
                            console.log(`    - ${campo.path}:`, campo.value);
                        });
                    }
                }
            } catch (err) {
                console.log(`  ⚠️ Error: ${err.message}`);
            }
        }
    }
    
    console.log('\n\n✅ ==========================================');
    console.log('✅ DIAGNÓSTICO COMPLETADO');
    console.log('✅ ==========================================\n');
    console.log('💡 Revisa los logs arriba para encontrar dónde están los campos personalizados');
}

// Exponer globalmente
window.diagnosticarCamposPersonalizados = diagnosticarCamposPersonalizados;

