/**
 * Script de Prueba: Campos Personalizados de un Prospecto Específico
 * 
 * Este script prueba obtener los campos personalizados de un chat/prospecto específico
 */

(async function testProspectCustomFields() {
    console.log('🧪 ==========================================');
    console.log('🧪 PRUEBA: Campos Personalizados de Prospecto');
    console.log('🧪 ==========================================\n');

    // Buscar API disponible
    let api = null;
    if (window.gptmakerAPI) {
        api = window.gptmakerAPI;
        console.log('✅ Usando window.gptmakerAPI\n');
    } else if (window.dashboard && window.dashboard.api) {
        api = window.dashboard.api;
        console.log('✅ Usando window.dashboard.api\n');
    } else if (window.dashboard && window.dashboard.dataService && window.dashboard.dataService.api) {
        api = window.dashboard.dataService.api;
        console.log('✅ Usando window.dashboard.dataService.api\n');
    }
    
    if (!api) {
        console.error('❌ GPTMakerAPI no está disponible');
        return;
    }

    // PASO 1: Obtener un chat específico (usar el que tiene campos personalizados)
    console.log('📋 PASO 1: Buscando chat con campos personalizados...\n');
    
    try {
        let dataService = null;
        if (window.dataService) {
            dataService = window.dataService;
        } else if (window.dashboard && window.dashboard.dataService) {
            dataService = window.dashboard.dataService;
        }
        
        if (!dataService) {
            console.error('❌ DataService no disponible');
            return;
        }

        // Obtener chats
        const chatsResult = await dataService.getAllChats({ pageSize: 10 });
        
        if (!chatsResult.success || !chatsResult.data || chatsResult.data.length === 0) {
            console.error('❌ No se pudieron obtener chats');
            return;
        }

        console.log(`✅ ${chatsResult.data.length} chats obtenidos\n`);

        // Buscar el chat "Gabriel" (basado en la imagen)
        const gabrielChat = chatsResult.data.find(c => 
            (c.name && c.name.toLowerCase().includes('gabriel')) ||
            (c.userName && c.userName.toLowerCase().includes('gabriel'))
        );

        if (!gabrielChat) {
            console.log('⚠️ No se encontró chat de Gabriel, usando el primero disponible');
            const chat = chatsResult.data[0];
            await testChatCustomFields(chat, api);
        } else {
            console.log('✅ Chat de Gabriel encontrado:', gabrielChat.name);
            await testChatCustomFields(gabrielChat, api);
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
})();

async function testChatCustomFields(chat, api) {
    console.log('\n\n📋 PASO 2: Analizando chat específico...\n');
    console.log('📊 ESTRUCTURA DEL CHAT:');
    console.log('ID:', chat.id);
    console.log('Nombre:', chat.name);
    console.log('Recipient:', chat.recipient);
    console.log('User ID:', chat.userId);
    console.log('\n📋 TODAS LAS PROPIEDADES DEL CHAT:');
    console.log(JSON.stringify(chat, null, 2));

    // PASO 3: Obtener workspace ID
    console.log('\n\n📋 PASO 3: Obteniendo workspace ID...\n');
    const workspaces = await api.getWorkspaces();
    let workspaceId = null;
    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
        workspaceId = workspaces.data[0].id;
        console.log(`✅ Workspace ID: ${workspaceId}\n`);
    }

    // PASO 4: Obtener campos personalizados disponibles
    console.log('📋 PASO 4: Obteniendo campos personalizados disponibles...\n');
    const customFieldsResult = await api.getCustomFields();
    
    if (customFieldsResult.success && customFieldsResult.data) {
        console.log(`✅ ${customFieldsResult.data.length} campos personalizados disponibles:\n`);
        customFieldsResult.data.forEach((field, index) => {
            console.log(`${index + 1}. ${field.name} (${field.jsonName || 'N/A'})`);
        });
        window.availableCustomFields = customFieldsResult.data;
    } else {
        console.error('❌ No se pudieron obtener campos personalizados');
        return;
    }

    // PASO 5: Intentar obtener valores de campos personalizados usando diferentes métodos
    console.log('\n\n📋 PASO 5: Intentando obtener valores de campos personalizados...\n');
    
    const contactIds = [
        chat.recipient,
        chat.userId,
        chat.id.split('-').pop(), // Última parte del ID del chat
        chat.id
    ].filter(id => id);

    console.log('🔍 Contact IDs a probar:', contactIds);

    for (const contactId of contactIds) {
        if (!contactId) continue;
        
        console.log(`\n🔄 Probando con contactId: ${contactId}`);
        
        // Método 1: getContactCustomFields
        try {
            const result1 = await api.getContactCustomFields(contactId);
            if (result1.success && result1.data) {
                console.log(`  ✅ Éxito con getContactCustomFields:`);
                console.log('  📊 Valores obtenidos:', JSON.stringify(result1.data, null, 2));
                window.customFieldsValues = result1.data;
                break;
            } else {
                console.log(`  ❌ Error: ${result1.error}`);
            }
        } catch (error) {
            console.log(`  ⚠️ Error: ${error.message}`);
        }

        // Método 2: Intentar endpoints directos
        if (workspaceId) {
            const endpoints = [
                `/v2/contact/${contactId}`,
                `/v2/workspace/${workspaceId}/contact/${contactId}`,
                `/v2/contact/${contactId}/custom-fields`,
                `/v2/workspace/${workspaceId}/contact/${contactId}/custom-fields`,
                `/v2/custom-field/contact/${contactId}`,
                `/v2/workspace/${workspaceId}/custom-field/contact/${contactId}`
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`  🔄 Probando endpoint: ${endpoint}`);
                    const result = await api.request(endpoint);
                    
                    if (result.success && result.data) {
                        console.log(`  ✅ ¡Éxito con ${endpoint}!`);
                        console.log('  📊 Datos obtenidos:', JSON.stringify(result.data, null, 2));
                        window.contactData = result.data;
                        
                        // Si contiene campos personalizados, mostrarlos
                        if (result.data.customFields || result.data.custom_fields || result.data.fields) {
                            console.log('  📋 Campos personalizados encontrados en la respuesta');
                        }
                        
                        break;
                    }
                } catch (error) {
                    console.log(`  ⚠️ Error en ${endpoint}: ${error.message}`);
                }
            }
        }
    }

    // PASO 6: Verificar si el chat tiene campos personalizados directamente
    console.log('\n\n📋 PASO 6: Verificando si el chat tiene campos personalizados...\n');
    console.log('🔍 Buscando propiedades relacionadas con campos personalizados en el objeto chat...');
    
    const chatKeys = Object.keys(chat);
    const customFieldKeys = chatKeys.filter(key => 
        key.toLowerCase().includes('custom') || 
        key.toLowerCase().includes('field') ||
        key.toLowerCase().includes('personalizado')
    );
    
    if (customFieldKeys.length > 0) {
        console.log('✅ Propiedades relacionadas encontradas:', customFieldKeys);
        customFieldKeys.forEach(key => {
            console.log(`  - ${key}:`, chat[key]);
        });
    } else {
        console.log('⚠️ No se encontraron propiedades de campos personalizados en el objeto chat');
    }

    console.log('\n\n✅ ==========================================');
    console.log('✅ PRUEBA COMPLETADA');
    console.log('✅ ==========================================\n');
    console.log('💡 Revisa los objetos guardados en window:');
    console.log('   - window.availableCustomFields: Campos disponibles');
    console.log('   - window.customFieldsValues: Valores de campos (si se encontraron)');
    console.log('   - window.contactData: Datos del contacto (si se encontraron)\n');
}

// Exponer función globalmente
window.testProspectCustomFields = testProspectCustomFields;

