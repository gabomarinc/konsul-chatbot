/**
 * Script de prueba para campos personalizados de GPTMaker
 * Ejecutar en la consola del navegador después de cargar el dashboard
 */

async function testCustomFields() {
    console.log('🧪 ==========================================');
    console.log('🧪 INICIANDO PRUEBAS DE CAMPOS PERSONALIZADOS');
    console.log('🧪 ==========================================\n');

    // 1. Verificar y obtener la instancia de API disponible
    let api = null;
    
    // Intentar obtener la API de diferentes fuentes
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
        // Crear una nueva instancia si la clase está disponible
        console.log('⚠️ No hay instancia global, creando una nueva...\n');
        api = new GPTMakerAPI();
        console.log('✅ Nueva instancia de GPTMakerAPI creada\n');
    }
    
    if (!api) {
        console.error('❌ GPTMakerAPI no está disponible. Esperando que el dashboard cargue...');
        console.log('\n💡 Intenta:');
        console.log('   1. Esperar unos segundos y ejecutar de nuevo: testCustomFields()');
        console.log('   2. Verificar que el dashboard esté completamente cargado');
        console.log('   3. Recargar la página y esperar a que cargue todo\n');
        return;
    }

    // Guardar referencia globalmente para uso posterior
    window.gptmakerAPI = api;
    console.log('✅ API disponible y lista para usar\n');

    // 2. Obtener campos personalizados del workspace
    console.log('📋 PASO 1: Obteniendo campos personalizados del workspace...');
    try {
        const customFieldsResult = await api.getCustomFields();
        
        if (customFieldsResult.success) {
            console.log(`✅ Se encontraron ${customFieldsResult.data.length} campos personalizados:\n`);
            
            const camposNecesarios = [
                'Zona de Interes',
                'Perfil Laboral',
                'DUI',
                'Constancia de salario',
                'Comprobante de AFP',
                'Declaración de renta',
                'Comprobante de domicilio',
                'Declaraciones de impuestos (1-2 años)',
                'Estados de cuenta bancarios personales o del domicilio',
                'Constancias de ingreso o contratos con clientes'
            ];

            console.log('📊 CAMPOS PERSONALIZADOS ENCONTRADOS:');
            customFieldsResult.data.forEach((field, index) => {
                const existe = camposNecesarios.some(nombre => 
                    field.name?.toLowerCase().includes(nombre.toLowerCase()) || 
                    nombre.toLowerCase().includes(field.name?.toLowerCase())
                );
                const status = existe ? '✅' : '❌';
                console.log(`${status} ${index + 1}. "${field.name}"`);
                console.log(`   - ID: ${field.id}`);
                console.log(`   - JSON Name: ${field.jsonName || 'N/A'}`);
                console.log(`   - Tipo: ${field.type || 'N/A'}`);
                console.log(`   - Descripción: ${field.description || 'N/A'}`);
                console.log('');
            });

            console.log('\n📋 CAMPOS NECESARIOS vs ENCONTRADOS:');
            camposNecesarios.forEach((campoNecesario) => {
                const encontrado = customFieldsResult.data.find(field => 
                    field.name?.toLowerCase().includes(campoNecesario.toLowerCase()) || 
                    campoNecesario.toLowerCase().includes(field.name?.toLowerCase())
                );
                if (encontrado) {
                    console.log(`✅ "${campoNecesario}" → Encontrado como "${encontrado.name}"`);
                } else {
                    console.log(`❌ "${campoNecesario}" → NO ENCONTRADO (necesita crearse)`);
                }
            });

            // Guardar campos en window para uso posterior
            window.customFieldsData = customFieldsResult.data;
        } else {
            console.error('❌ Error obteniendo campos personalizados:', customFieldsResult.error);
        }
    } catch (error) {
        console.error('❌ Error en PASO 1:', error);
    }

    console.log('\n\n');

    // 3. Obtener un chat de ejemplo para ver su estructura
    console.log('💬 PASO 2: Analizando estructura de un chat de ejemplo...');
    try {
        // Obtener dataService de diferentes fuentes
        let dataService = null;
        if (window.dataService) {
            dataService = window.dataService;
        } else if (window.dashboard && window.dashboard.dataService) {
            dataService = window.dashboard.dataService;
        } else if (typeof DataService !== 'undefined' && api) {
            dataService = new DataService(api);
        }
        
        if (!dataService) {
            console.error('❌ DataService no está disponible');
            return;
        }
        
        const chatsResult = await dataService.getAllChats({ pageSize: 1 });
        
        if (chatsResult.success && chatsResult.data && chatsResult.data.length > 0) {
            const chat = chatsResult.data[0];
            console.log('✅ Chat de ejemplo obtenido:\n');
            console.log('📊 ESTRUCTURA DEL CHAT:');
            console.log('ID:', chat.id);
            console.log('Nombre:', chat.name || 'N/A');
            console.log('Usuario:', chat.userName || 'N/A');
            console.log('Teléfono:', chat.whatsappPhone || 'N/A');
            console.log('Tipo:', chat.type || 'N/A');
            console.log('Agente ID:', chat.agentId || 'N/A');
            console.log('\n📋 TODAS LAS PROPIEDADES DEL CHAT:');
            console.log(JSON.stringify(chat, null, 2));

            // Buscar propiedades relacionadas con contactos o custom fields
            const propiedadesRelevantes = Object.keys(chat).filter(key => 
                key.toLowerCase().includes('contact') || 
                key.toLowerCase().includes('custom') || 
                key.toLowerCase().includes('field') ||
                key.toLowerCase().includes('user') ||
                key.toLowerCase().includes('customer')
            );

            if (propiedadesRelevantes.length > 0) {
                console.log('\n🔍 PROPIEDADES RELACIONADAS CON CONTACTO/CUSTOM FIELDS:');
                propiedadesRelevantes.forEach(prop => {
                    console.log(`  - ${prop}:`, chat[prop]);
                });
            } else {
                console.log('\n⚠️ No se encontraron propiedades obvias relacionadas con contactos o custom fields');
            }

            // Guardar chat de ejemplo
            window.exampleChat = chat;
        } else {
            console.error('❌ No se pudieron obtener chats');
        }
    } catch (error) {
        console.error('❌ Error en PASO 2:', error);
    }

    console.log('\n\n');

    // 4. Intentar obtener mensajes del chat para ver si hay información de contacto
    console.log('📨 PASO 3: Analizando mensajes del chat para buscar información...');
    try {
        if (window.exampleChat) {
            const messagesResult = await dataService.getAllChatMessages(window.exampleChat.id);
            
            if (messagesResult.success && messagesResult.data) {
                console.log(`✅ Se obtuvieron ${messagesResult.data.length} mensajes del chat\n`);
                console.log('📊 Primeros 3 mensajes:');
                messagesResult.data.slice(0, 3).forEach((msg, index) => {
                    console.log(`\nMensaje ${index + 1}:`);
                    console.log('  - ID:', msg.id);
                    console.log('  - Role:', msg.role);
                    console.log('  - Text:', msg.text?.substring(0, 100) || 'N/A');
                    console.log('  - Type:', msg.type || 'N/A');
                    console.log('  - Propiedades disponibles:', Object.keys(msg).join(', '));
                });
            }
        } else {
            console.log('⚠️ No hay chat de ejemplo disponible');
        }
    } catch (error) {
        console.error('❌ Error en PASO 3:', error);
    }

    console.log('\n\n');

    // 5. Resumen final
    console.log('📊 ==========================================');
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('📊 ==========================================\n');
    
    console.log('✅ Pruebas completadas. Revisa los resultados arriba.');
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Verificar qué campos personalizados ya existen');
    console.log('2. Crear los campos faltantes en GPTMaker');
    console.log('3. Investigar cómo obtener/actualizar valores de campos personalizados de un contacto');
    console.log('\n📝 DATOS DISPONIBLES EN WINDOW:');
    console.log('  - window.customFieldsData: Array de campos personalizados');
    console.log('  - window.exampleChat: Chat de ejemplo para pruebas');
}

// Función auxiliar para buscar un campo personalizado por nombre
function buscarCampoPersonalizado(nombre) {
    if (!window.customFieldsData) {
        console.warn('⚠️ Primero ejecuta testCustomFields()');
        return null;
    }
    
    return window.customFieldsData.find(field => 
        field.name?.toLowerCase().includes(nombre.toLowerCase()) || 
        nombre.toLowerCase().includes(field.name?.toLowerCase())
    );
}

// Exportar funciones para uso en consola
window.testCustomFields = testCustomFields;
window.buscarCampoPersonalizado = buscarCampoPersonalizado;

console.log('✅ Script de prueba cargado. Ejecuta: testCustomFields()');

