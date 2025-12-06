# 🚀 Solución Rápida: Prueba de Contactos

## ❌ Problema

El script no se está cargando correctamente. 

## ✅ Solución

**Copia y pega este código COMPLETO directamente en la consola del navegador:**

1. Abre la consola (F12 o Cmd+Option+I)
2. Ve a la pestaña "Console"
3. Copia TODO el código de abajo
4. Pégalo en la consola
5. Presiona Enter

---

## 📋 CÓDIGO COMPLETO (Copia desde aquí):

```javascript
(async function testContactCustomFields() {
    console.log('🧪 ==========================================');
    console.log('🧪 PRUEBAS: CONTACTOS Y CAMPOS PERSONALIZADOS');
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
    } else if (typeof GPTMakerAPI !== 'undefined') {
        console.log('⚠️ Creando nueva instancia de GPTMakerAPI...\n');
        api = new GPTMakerAPI();
        console.log('✅ Nueva instancia creada\n');
    }
    
    if (!api) {
        console.error('❌ GPTMakerAPI no está disponible');
        console.log('\n💡 Intenta:');
        console.log('   1. Esperar 5-10 segundos y ejecutar de nuevo');
        console.log('   2. Recargar la página (F5) y esperar a que cargue');
        console.log('   3. Verificar que tengas un token de GPTMaker configurado\n');
        return;
    }

    // PASO 1: Analizar estructura de un chat
    console.log('📋 PASO 1: Analizando estructura de un chat...\n');
    try {
        let dataService = null;
        if (window.dataService) {
            dataService = window.dataService;
        } else if (window.dashboard && window.dashboard.dataService) {
            dataService = window.dashboard.dataService;
        } else if (typeof DataService !== 'undefined' && api) {
            dataService = new DataService(api);
        }
        
        if (dataService) {
            const chatsResult = await dataService.getAllChats({ pageSize: 1 });
            
            if (chatsResult.success && chatsResult.data && chatsResult.data.length > 0) {
                const chat = chatsResult.data[0];
                console.log('✅ Chat de ejemplo obtenido:\n');
                console.log('📊 ESTRUCTURA DEL CHAT:');
                console.log('ID:', chat.id);
                console.log('Nombre:', chat.name || 'N/A');
                console.log('Recipient:', chat.recipient || 'N/A');
                console.log('User ID:', chat.userId || 'N/A');
                console.log('WhatsApp Phone:', chat.whatsappPhone || 'N/A');
                console.log('Agent ID:', chat.agentId || 'N/A');
                console.log('Agent Name:', chat.agentName || 'N/A');
                console.log('Type:', chat.type || 'N/A');
                console.log('\n📋 TODAS LAS PROPIEDADES DEL CHAT:');
                console.log(JSON.stringify(chat, null, 2));
                
                window.exampleChat = chat;
                
                // PASO 2: Intentar obtener información del contacto
                if (chat.recipient) {
                    console.log('\n\n📋 PASO 2: Intentando obtener información del contacto...\n');
                    console.log(`🔍 Usando recipient como contactId: ${chat.recipient}\n`);
                    
                    // Obtener workspace ID primero
                    const workspaces = await api.getWorkspaces();
                    let workspaceId = null;
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                        console.log(`📋 Workspace ID obtenido: ${workspaceId}\n`);
                    }
                    
                    // Intentar diferentes endpoints
                    const contactEndpoints = workspaceId ? [
                        `/v2/contact/${chat.recipient}`,
                        `/v2/workspace/${workspaceId}/contact/${chat.recipient}`,
                        `/v2/user/${chat.recipient}`,
                        `/v2/workspace/${workspaceId}/user/${chat.recipient}`
                    ] : [
                        `/v2/contact/${chat.recipient}`,
                        `/v2/user/${chat.recipient}`
                    ];
                    
                    console.log('🔍 Probando endpoints de contacto...\n');
                    let contactFound = false;
                    for (const endpoint of contactEndpoints) {
                        try {
                            console.log(`  🔄 Probando: ${endpoint}`);
                            const result = await api.request(endpoint);
                            
                            if (result.success && result.data) {
                                console.log(`  ✅ ¡Éxito! Datos obtenidos desde: ${endpoint}\n`);
                                console.log('📊 ESTRUCTURA DEL CONTACTO:');
                                console.log(JSON.stringify(result.data, null, 2));
                                window.contactData = result.data;
                                contactFound = true;
                                break;
                            }
                        } catch (error) {
                            console.log(`  ⚠️ Error: ${error.message}`);
                        }
                    }
                    
                    if (!contactFound) {
                        console.log('\n⚠️ No se pudo obtener información del contacto');
                    }
                }
                
                // PASO 3: Listar campos personalizados disponibles
                console.log('\n\n📋 PASO 3: Listando campos personalizados disponibles...\n');
                const customFieldsResult = await api.getCustomFields();
                if (customFieldsResult.success && customFieldsResult.data) {
                    console.log(`✅ ${customFieldsResult.data.length} campos personalizados disponibles:\n`);
                    customFieldsResult.data.forEach((field, index) => {
                        console.log(`${index + 1}. ${field.name} (${field.jsonName || 'N/A'}) - ${field.type || 'N/A'}`);
                    });
                    window.availableCustomFields = customFieldsResult.data;
                }
                
            }
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }

    console.log('\n\n✅ PRUEBAS COMPLETADAS\n');
    console.log('💡 Revisa:');
    console.log('   - window.exampleChat');
    console.log('   - window.contactData');
    console.log('   - window.availableCustomFields\n');
})();
```

---

## 🎯 Después de Ejecutar

Comparte los resultados:
1. La estructura del chat
2. Si se encontró información del contacto
3. Los campos personalizados disponibles

Con eso podremos continuar con la implementación.

