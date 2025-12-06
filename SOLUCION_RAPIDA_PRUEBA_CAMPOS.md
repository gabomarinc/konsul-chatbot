# 🧪 Solución Rápida: Probar Campos Personalizados de un Prospecto

## 🎯 Problema

El usuario "Gabriel" tiene campos personalizados en GPTMaker, pero no aparecen en el modal.

## ✅ Solución

Ejecuta este script de prueba para diagnosticar el problema.

---

## 📋 CÓDIGO COMPLETO (Copia y pega en la consola):

```javascript
(async function testProspectCustomFields() {
    console.log('🧪 ==========================================');
    console.log('🧪 PRUEBA: Campos Personalizados de Prospecto');
    console.log('🧪 ==========================================\n');

    // Buscar API
    const api = window.gptmakerAPI || 
                (window.dashboard && window.dashboard.api) ||
                (window.dashboard && window.dashboard.dataService && window.dashboard.dataService.api);
    
    if (!api) {
        console.error('❌ API no disponible');
        return;
    }

    console.log('✅ API encontrada\n');

    // Obtener chats
    let dataService = window.dataService || 
                     (window.dashboard && window.dashboard.dataService);
    
    if (!dataService) {
        console.error('❌ DataService no disponible');
        return;
    }

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
        await testChat(chat, api);
    } else {
        console.log('✅ Chat de Gabriel encontrado:', gabrielChat.name);
        await testChat(gabrielChat, api);
    }
})();

async function testChat(chat, api) {
    console.log('\n📊 CHAT ENCONTRADO:');
    console.log('ID:', chat.id);
    console.log('Nombre:', chat.name);
    console.log('Recipient:', chat.recipient);
    console.log('User ID:', chat.userId);
    console.log('\n📋 TODAS LAS PROPIEDADES:');
    console.log(JSON.stringify(chat, null, 2));

    // Obtener workspace
    const workspaces = await api.getWorkspaces();
    const workspaceId = workspaces.success && workspaces.data && workspaces.data.length > 0 
        ? workspaces.data[0].id 
        : null;

    console.log('\n📋 Workspace ID:', workspaceId);

    // Obtener campos disponibles
    console.log('\n📋 CAMPOS PERSONALIZADOS DISPONIBLES:');
    const fieldsResult = await api.getCustomFields();
    if (fieldsResult.success) {
        console.log(`✅ ${fieldsResult.data.length} campos encontrados`);
        fieldsResult.data.forEach(f => {
            console.log(`  - ${f.name} (${f.jsonName})`);
        });
        window.availableFields = fieldsResult.data;
    }

    // Intentar obtener valores con diferentes contactIds
    const contactIds = [
        chat.recipient,
        chat.userId,
        chat.id.split('-').pop()
    ].filter(id => id);

    console.log('\n🔍 CONTACT IDs A PROBAR:', contactIds);

    for (const contactId of contactIds) {
        console.log(`\n🔄 Probando contactId: ${contactId}`);
        
        // Probar getContactCustomFields
        const result = await api.getContactCustomFields(contactId);
        console.log('📊 Resultado getContactCustomFields:');
        console.log('  - Success:', result.success);
        console.log('  - Error:', result.error);
        console.log('  - Data:', result.data);
        console.log('  - Keys:', result.data ? Object.keys(result.data) : []);

        if (result.success && result.data) {
            console.log('\n✅ ¡VALORES ENCONTRADOS!');
            console.log(JSON.stringify(result.data, null, 2));
            window.customFieldsValues = result.data;
        }

        // Probar endpoints directos
        if (workspaceId) {
            const endpoints = [
                `/v2/contact/${contactId}`,
                `/v2/workspace/${workspaceId}/contact/${contactId}`
            ];

            for (const endpoint of endpoints) {
                try {
                    console.log(`  🔄 Probando: ${endpoint}`);
                    const directResult = await api.request(endpoint);
                    if (directResult.success && directResult.data) {
                        console.log(`  ✅ ¡Éxito con ${endpoint}!`);
                        console.log('  📊 Datos:', JSON.stringify(directResult.data, null, 2));
                        window.contactData = directResult.data;
                        
                        // Buscar campos personalizados en la respuesta
                        if (directResult.data.customFields || 
                            directResult.data.custom_fields ||
                            directResult.data.fields) {
                            console.log('  📋 Campos personalizados encontrados en contacto!');
                        }
                    }
                } catch (e) {
                    console.log(`  ⚠️ Error: ${e.message}`);
                }
            }
        }
    }

    console.log('\n\n✅ PRUEBA COMPLETADA');
    console.log('💡 Revisa:');
    console.log('   - window.availableFields');
    console.log('   - window.customFieldsValues');
    console.log('   - window.contactData');
}
```

---

## 🎯 Instrucciones

1. Abre la consola (F12)
2. Copia TODO el código de arriba
3. Pégalo en la consola
4. Presiona Enter
5. Comparte los resultados

Con esto veremos:
- Si se están obteniendo los valores
- Qué estructura tienen
- Cuál es el contactId correcto

