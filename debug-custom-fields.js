/**
 * Script de Debug para Campos Personalizados
 * 
 * INSTRUCCIONES:
 * 1. Abre el modal de un prospecto (ej: Gabriel)
 * 2. Abre la consola del navegador (F12)
 * 3. Copia y pega este código completo en la consola
 * 4. Presiona Enter
 * 5. Revisa los logs que aparecen
 */

async function debugCustomFields() {
    console.log('🔍 ===== DEBUG: CAMPOS PERSONALIZADOS =====\n');
    
    // 1. Obtener el prospecto actual del modal
    const prospectModal = document.querySelector('.prospect-modal');
    if (!prospectModal) {
        console.error('❌ No hay modal de prospecto abierto');
        console.log('💡 Abre el modal de un prospecto primero');
        return;
    }
    
    // Intentar obtener el chatId del botón "Ir al Chat"
    const goToChatBtn = document.getElementById('goToChatFromModal');
    const chatId = goToChatBtn ? goToChatBtn.dataset.chatId : null;
    
    console.log('1️⃣ INFORMACIÓN DEL PROSPECTO:');
    console.log('   - ChatId:', chatId || 'NO ENCONTRADO');
    console.log('   - Botón encontrado:', !!goToChatBtn);
    console.log('');
    
    if (!chatId) {
        console.error('❌ No se pudo obtener el chatId del prospecto');
        return;
    }
    
    // 2. Verificar API
    const api = window.gptmakerAPI || window.dashboard?.dataService?.api;
    if (!api) {
        console.error('❌ API de GPTMaker no disponible');
        console.log('   - window.gptmakerAPI:', !!window.gptmakerAPI);
        console.log('   - window.dashboard:', !!window.dashboard);
        return;
    }
    
    console.log('2️⃣ API DISPONIBLE:');
    console.log('   - Token configurado:', api.token ? 'Sí' : 'No');
    console.log('   - Base URL:', api.baseURL);
    console.log('');
    
    // 3. Buscar el chat
    const dashboard = window.dashboard;
    let chat = null;
    if (dashboard && dashboard.dashboardData && dashboard.dashboardData.chats) {
        chat = dashboard.dashboardData.chats.find(c => c.id === chatId);
    }
    
    console.log('3️⃣ INFORMACIÓN DEL CHAT:');
    if (chat) {
        console.log('   ✅ Chat encontrado:', {
            id: chat.id,
            name: chat.name || chat.userName,
            recipient: chat.recipient,
            userId: chat.userId,
            contactId: chat.contactId,
            contact: chat.contact
        });
    } else {
        console.log('   ⚠️ Chat no encontrado en dashboardData');
        console.log('   - Total de chats:', dashboard?.dashboardData?.chats?.length || 0);
    }
    console.log('');
    
    // 4. Obtener contactId
    const contactId = chat?.recipient || 
                     chat?.userId || 
                     chat?.contactId || 
                     chat?.contact?.id ||
                     chatId;
    
    console.log('4️⃣ CONTACT ID:');
    console.log('   - ContactId usado:', contactId);
    console.log('');
    
    // 5. Obtener campos personalizados disponibles
    console.log('5️⃣ CAMPOS PERSONALIZADOS DISPONIBLES:');
    try {
        const fieldsResult = await api.getCustomFields();
        if (fieldsResult.success) {
            console.log(`   ✅ ${fieldsResult.data.length} campos disponibles:`);
            fieldsResult.data.forEach((field, index) => {
                console.log(`   ${index + 1}. ${field.name} (jsonName: ${field.jsonName || 'N/A'})`);
            });
        } else {
            console.error('   ❌ Error obteniendo campos:', fieldsResult.error);
        }
    } catch (error) {
        console.error('   ❌ Error:', error.message);
    }
    console.log('');
    
    // 6. Obtener valores de campos personalizados del contacto
    console.log('6️⃣ VALORES DE CAMPOS PERSONALIZADOS:');
    try {
        console.log(`   🔍 Buscando para contactId: ${contactId}`);
        const valuesResult = await api.getContactCustomFields(contactId);
        
        console.log('   📊 Resultado completo:', valuesResult);
        
        if (valuesResult.success && valuesResult.data) {
            console.log('   ✅ Datos recibidos:', valuesResult.data);
            console.log('   📋 Tipo de datos:', typeof valuesResult.data);
            console.log('   📋 Es array?', Array.isArray(valuesResult.data));
            console.log('   📋 Es objeto?', typeof valuesResult.data === 'object' && !Array.isArray(valuesResult.data));
            
            if (typeof valuesResult.data === 'object' && !Array.isArray(valuesResult.data)) {
                console.log('   📋 Claves del objeto:', Object.keys(valuesResult.data));
                Object.entries(valuesResult.data).forEach(([key, value]) => {
                    console.log(`      - ${key}: ${typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50)}`);
                });
            }
        } else {
            console.warn('   ⚠️ No se encontraron valores o hubo un error');
            console.log('   - Success:', valuesResult.success);
            console.log('   - Error:', valuesResult.error);
            console.log('   - Data:', valuesResult.data);
        }
    } catch (error) {
        console.error('   ❌ Error obteniendo valores:', error);
        console.error('   - Mensaje:', error.message);
        console.error('   - Stack:', error.stack);
    }
    console.log('');
    
    // 7. Intentar método alternativo: buscar en todos los contactos
    console.log('7️⃣ MÉTODO ALTERNATIVO: Buscar en todos los contactos');
    try {
        const contactsResult = await api.getAllContacts();
        if (contactsResult.success && contactsResult.data) {
            console.log(`   📋 Total de contactos: ${contactsResult.data.length}`);
            
            const matchingContact = contactsResult.data.find(c => 
                c.id === contactId || 
                c.recipient === contactId ||
                c.userId === contactId ||
                String(c.id) === String(contactId)
            );
            
            if (matchingContact) {
                console.log('   ✅ Contacto encontrado en lista completa');
                console.log('   📊 Estructura completa del contacto:', matchingContact);
                console.log('   📋 Claves del contacto:', Object.keys(matchingContact));
                
                // Buscar campos personalizados
                const customFields = matchingContact.customFields || 
                                   matchingContact.custom_fields || 
                                   matchingContact.fields ||
                                   {};
                
                console.log('   📋 Campos personalizados encontrados:', Object.keys(customFields).length);
                if (Object.keys(customFields).length > 0) {
                    Object.entries(customFields).forEach(([key, value]) => {
                        console.log(`      - ${key}: ${typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50)}`);
                    });
                }
            } else {
                console.warn('   ⚠️ Contacto no encontrado en lista completa');
                console.log('   💡 Intentando buscar por nombre...');
                
                // Buscar por nombre si tenemos el nombre del chat
                if (chat && (chat.name || chat.userName)) {
                    const searchName = (chat.name || chat.userName).toLowerCase();
                    const nameMatch = contactsResult.data.find(c => {
                        const contactName = (c.name || c.fullName || c.userName || '').toLowerCase();
                        return contactName.includes(searchName) || searchName.includes(contactName);
                    });
                    
                    if (nameMatch) {
                        console.log('   ✅ Contacto encontrado por nombre:', nameMatch.name || nameMatch.fullName);
                        console.log('   📊 Estructura:', nameMatch);
                    }
                }
            }
        } else {
            console.error('   ❌ Error obteniendo contactos:', contactsResult.error);
        }
    } catch (error) {
        console.error('   ❌ Error en método alternativo:', error);
    }
    console.log('');
    
    console.log('✅ ===== FIN DEL DEBUG =====');
    console.log('');
    console.log('📝 RESUMEN:');
    console.log('   - ChatId:', chatId);
    console.log('   - ContactId:', contactId);
    console.log('   - Chat encontrado:', !!chat);
    console.log('   - API disponible:', !!api);
    console.log('');
    console.log('💡 Si no ves campos personalizados, verifica:');
    console.log('   1. Que el contacto tenga campos personalizados en GPTMaker');
    console.log('   2. Que el contactId sea correcto');
    console.log('   3. Que el token de API sea válido');
}

// Ejecutar automáticamente
debugCustomFields();

// También exportar para uso manual
window.debugCustomFields = debugCustomFields;
