/**
 * Script de Prueba: Estructura de Contactos y Campos Personalizados
 * 
 * Este script investiga:
 * 1. Cómo se estructuran los contactos en GPTMaker
 * 2. Cómo se relacionan los chats con los contactos
 * 3. Cómo obtener/actualizar valores de campos personalizados de contactos
 * 4. Qué datos ya están disponibles en GPTMaker (como el nombre)
 */

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

    // PASO 1: Analizar estructura de un chat para encontrar el contacto
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
                
                // PASO 2: Intentar obtener información del contacto usando recipient
                if (chat.recipient) {
                    console.log('\n\n📋 PASO 2: Intentando obtener información del contacto...\n');
                    console.log(`🔍 Usando recipient como contactId: ${chat.recipient}\n`);
                    
                    // Intentar diferentes endpoints para obtener el contacto
                    const contactEndpoints = [
                        `/v2/contact/${chat.recipient}`,
                        `/v2/workspace/*/contact/${chat.recipient}`,
                        `/v2/user/${chat.recipient}`,
                        `/v2/workspace/*/user/${chat.recipient}`
                    ];
                    
                    console.log('🔍 Probando endpoints de contacto...\n');
                    for (const endpoint of contactEndpoints) {
                        try {
                            // Reemplazar * con workspace ID si es necesario
                            let finalEndpoint = endpoint;
                            if (endpoint.includes('*')) {
                                const workspaces = await api.getWorkspaces();
                                if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                                    const workspaceId = workspaces.data[0].id;
                                    finalEndpoint = endpoint.replace('*', workspaceId);
                                } else {
                                    console.log(`⏭️ Saltando ${endpoint} (no se pudo obtener workspace)`);
                                    continue;
                                }
                            }
                            
                            console.log(`  🔄 Probando: ${finalEndpoint}`);
                            const result = await api.request(finalEndpoint);
                            
                            if (result.success && result.data) {
                                console.log(`  ✅ ¡Éxito! Datos del contacto obtenidos desde: ${finalEndpoint}\n`);
                                console.log('📊 ESTRUCTURA DEL CONTACTO:');
                                console.log(JSON.stringify(result.data, null, 2));
                                window.contactData = result.data;
                                
                                // Intentar obtener campos personalizados del contacto
                                console.log('\n\n📋 PASO 3: Intentando obtener campos personalizados del contacto...\n');
                                const customFieldsResult = await api.getContactCustomFields(chat.recipient);
                                if (customFieldsResult.success) {
                                    console.log('✅ Campos personalizados obtenidos:');
                                    console.log(JSON.stringify(customFieldsResult.data, null, 2));
                                    window.contactCustomFields = customFieldsResult.data;
                                } else {
                                    console.log('⚠️ No se pudieron obtener campos personalizados:', customFieldsResult.error);
                                }
                                
                                break; // Salir del loop si encontramos datos
                            } else {
                                console.log(`  ❌ Sin datos en: ${finalEndpoint}`);
                            }
                        } catch (error) {
                            console.log(`  ⚠️ Error en ${endpoint}: ${error.message}`);
                        }
                    }
                } else {
                    console.log('\n⚠️ El chat no tiene "recipient", no se puede obtener contacto');
                }
                
                // PASO 3: Intentar obtener todos los contactos
                console.log('\n\n📋 PASO 4: Intentando obtener todos los contactos...\n');
                const allContactsResult = await api.getAllContacts();
                if (allContactsResult.success && allContactsResult.data && allContactsResult.data.length > 0) {
                    console.log(`✅ ${allContactsResult.data.length} contactos obtenidos\n`);
                    console.log('📊 ESTRUCTURA DEL PRIMER CONTACTO:');
                    console.log(JSON.stringify(allContactsResult.data[0], null, 2));
                    window.allContacts = allContactsResult.data;
                } else {
                    console.log('⚠️ No se pudieron obtener contactos:', allContactsResult.error || 'Desconocido');
                }
                
            } else {
                console.log('⚠️ No se pudieron obtener chats');
            }
        } else {
            console.log('⚠️ DataService no disponible, saltando análisis de chats');
        }
    } catch (error) {
        console.error('❌ Error en pruebas:', error);
    }

    // PASO 5: Listar campos personalizados disponibles
    console.log('\n\n📋 PASO 5: Listando campos personalizados disponibles...\n');
    try {
        const customFieldsResult = await api.getCustomFields();
        
        if (customFieldsResult.success && customFieldsResult.data) {
            console.log(`✅ ${customFieldsResult.data.length} campos personalizados disponibles:\n`);
            
            // Mapear campos a uso sugerido para prospectos
            const fieldMapping = {
                'zonaDeInteres': 'Zona de interés del prospecto',
                'perfilLaboral': 'Perfil laboral del prospecto',
                'dui': 'DUI del prospecto',
                'constanciaDeSalario': 'URL de constancia de salario',
                'comprobanteDeAfp': 'URL de comprobante de AFP',
                'declaracionDeRenta': 'URL de declaración de renta',
                'comprobanteDeDomicilio': 'URL de comprobante de domicilio',
                'declaracionesDeImpuestos(1–2Años)': 'URL de declaraciones de impuestos',
                'estadosDeCuentaBancariosPersonalesODelNegocio': 'URL de estados de cuenta',
                'constanciasDeIngresoOContratosConClientes': 'URL de constancias de ingreso',
                'modeloDeCasaDeInteres': 'Modelo de casa de interés'
            };
            
            console.log('📊 CAMPOS PERSONALIZADOS Y SUGERENCIAS DE USO:\n');
            customFieldsResult.data.forEach((field, index) => {
                const jsonName = field.jsonName || 'N/A';
                const suggestion = fieldMapping[jsonName] || 'Disponible para datos adicionales';
                console.log(`${index + 1}. ${field.name}`);
                console.log(`   - JSON Name: ${jsonName}`);
                console.log(`   - Tipo: ${field.type}`);
                console.log(`   - Uso sugerido: ${suggestion}`);
                console.log('');
            });
            
            window.availableCustomFields = customFieldsResult.data;
        }
    } catch (error) {
        console.error('❌ Error obteniendo campos personalizados:', error);
    }

    console.log('\n\n✅ ==========================================');
    console.log('✅ PRUEBAS COMPLETADAS');
    console.log('✅ ==========================================\n');
    console.log('💡 Revisa los objetos guardados en window:');
    console.log('   - window.exampleChat: Estructura del chat');
    console.log('   - window.contactData: Datos del contacto (si se encontraron)');
    console.log('   - window.contactCustomFields: Campos personalizados del contacto');
    console.log('   - window.allContacts: Todos los contactos');
    console.log('   - window.availableCustomFields: Campos personalizados disponibles\n');
})();

// Exponer función globalmente
window.testContactCustomFields = testContactCustomFields;

