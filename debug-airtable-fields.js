// Script para debuggear los campos de Airtable
// Ejecutar en la consola del navegador

async function debugAirtableFields() {
    console.log('🔍 Debuggeando campos de Airtable...');
    
    try {
        // Verificar authService
        if (!window.authService) {
            console.error('❌ AuthService no está disponible');
            return;
        }
        
        // Obtener usuario actual
        const currentUser = window.authService.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No hay usuario autenticado');
            return;
        }
        
        console.log('👤 Usuario actual:', currentUser.email);
        
        // Obtener datos directamente desde Airtable
        if (!window.airtableService) {
            console.error('❌ AirtableService no está disponible');
            return;
        }
        
        console.log('🔄 Obteniendo datos desde Airtable...');
        const result = await window.airtableService.getUserByEmail(currentUser.email);
        
        if (result.success) {
            console.log('✅ Usuario obtenido desde Airtable');
            console.log('📊 Datos del usuario:', result.user);
            
            // Verificar si tiene stripe_customer_id
            if (result.user.stripeCustomerId) {
                console.log('✅ Stripe Customer ID encontrado:', result.user.stripeCustomerId);
            } else {
                console.log('❌ NO se encontró stripe_customer_id');
                console.log('🔍 Campos disponibles:', Object.keys(result.user));
            }
            
        } else {
            console.error('❌ Error obteniendo usuario desde Airtable:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error debuggeando Airtable:', error);
    }
}

// Función para ver todos los campos de Airtable sin transformar
async function debugRawAirtableData() {
    console.log('🔍 Debuggeando datos RAW de Airtable...');
    
    try {
        const currentUser = window.authService?.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No hay usuario autenticado');
            return;
        }
        
        // Hacer llamada directa a Airtable para ver los datos sin transformar
        const airtableService = window.airtableService;
        const formula = encodeURIComponent(`{email} = '${currentUser.email}'`);
        const url = `${airtableService.apiBase}/${airtableService.baseId}/${airtableService.tableName}?filterByFormula=${formula}`;
        
        console.log('📡 URL de Airtable:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: airtableService.getHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('📊 Datos RAW de Airtable:', data);
            
            if (data.records && data.records.length > 0) {
                const record = data.records[0];
                console.log('📋 Campos disponibles en Airtable:', Object.keys(record.fields));
                console.log('📊 Valores de los campos:', record.fields);
                
                // Buscar campos que contengan "stripe"
                const stripeFields = Object.keys(record.fields).filter(key => 
                    key.toLowerCase().includes('stripe')
                );
                
                if (stripeFields.length > 0) {
                    console.log('💳 Campos relacionados con Stripe:', stripeFields);
                    stripeFields.forEach(field => {
                        console.log(`- ${field}:`, record.fields[field]);
                    });
                } else {
                    console.log('❌ No se encontraron campos relacionados con Stripe');
                }
            }
        } else {
            console.error('❌ Error en la llamada a Airtable:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error debuggeando datos RAW:', error);
    }
}

// Exportar funciones
window.debugAirtableFields = debugAirtableFields;
window.debugRawAirtableData = debugRawAirtableData;

console.log('🔧 Script de debug de Airtable cargado. Usa:');
console.log('- debugAirtableFields() - Ver campos transformados');
console.log('- debugRawAirtableData() - Ver datos RAW de Airtable');
