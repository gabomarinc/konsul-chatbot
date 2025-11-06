// Script para debuggear el stripe_customer_id desde Airtable
// Ejecutar en la consola del navegador después de iniciar sesión

async function debugStripeCustomerId() {
    console.log('🔍 Debuggeando stripe_customer_id desde Airtable...\n');
    
    try {
        // 1. Verificar usuario actual
        console.log('1️⃣ Verificando usuario actual...');
        if (!window.authService) {
            console.error('❌ AuthService no está disponible');
            return;
        }
        
        const currentUser = window.authService.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No hay usuario autenticado');
            return;
        }
        
        console.log('✅ Usuario autenticado:', currentUser.email);
        console.log('   - ID:', currentUser.id);
        console.log('   - Stripe Customer ID:', currentUser.stripeCustomerId || 'NO ENCONTRADO');
        
        // 2. Obtener datos RAW de Airtable
        console.log('\n2️⃣ Obteniendo datos RAW de Airtable...');
        
        if (!window.airtableService) {
            console.error('❌ AirtableService no está disponible');
            return;
        }
        
        const userResult = await window.airtableService.getUserByEmail(currentUser.email);
        
        if (!userResult.success || !userResult.user) {
            console.error('❌ No se pudo obtener el usuario de Airtable');
            return;
        }
        
        // 3. Obtener el registro completo de Airtable
        console.log('\n3️⃣ Obteniendo registro completo de Airtable...');
        const recordResult = await window.airtableService.getUserById(currentUser.id);
        
        if (recordResult.success && recordResult.user) {
            console.log('✅ Registro obtenido de Airtable');
        }
        
        // 4. Buscar el campo en Airtable directamente
        console.log('\n4️⃣ Buscando campo stripe_customer_id en Airtable...');
        
        const apiKey = window.airtableService.apiKey;
        const baseId = window.airtableService.baseId;
        const tableName = window.airtableService.tableName;
        
        if (!apiKey) {
            console.error('❌ API Key de Airtable no configurada');
            return;
        }
        
        // Hacer petición directa a Airtable para ver todos los campos
        const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${currentUser.id}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.error('❌ Error obteniendo registro de Airtable:', response.status);
            return;
        }
        
        const record = await response.json();
        console.log('✅ Registro completo de Airtable:');
        console.log('📋 Todos los campos disponibles:', Object.keys(record.fields));
        console.log('📊 Valores de los campos:', record.fields);
        
        // 5. Buscar campos relacionados con Stripe
        console.log('\n5️⃣ Buscando campos relacionados con Stripe...');
        const stripeFields = Object.keys(record.fields).filter(key => 
            key.toLowerCase().includes('stripe') || 
            key.toLowerCase().includes('customer')
        );
        
        if (stripeFields.length > 0) {
            console.log('✅ Campos relacionados con Stripe encontrados:');
            stripeFields.forEach(field => {
                console.log(`   - ${field}:`, record.fields[field]);
            });
        } else {
            console.warn('⚠️ No se encontraron campos relacionados con Stripe');
            console.log('💡 Posibles nombres de campo:');
            console.log('   - stripe_customer_id');
            console.log('   - stripeCustomerId');
            console.log('   - StripeCustomerId');
            console.log('   - Stripe_Customer_Id');
            console.log('   - Stripe Customer ID');
        }
        
        // 6. Verificar qué valor tiene el campo
        const possibleFieldNames = [
            'stripe_customer_id',
            'stripeCustomerId',
            'StripeCustomerId',
            'Stripe_Customer_Id',
            'Stripe Customer ID',
            'stripe customer id'
        ];
        
        console.log('\n6️⃣ Verificando valores en diferentes variaciones del nombre...');
        let foundField = null;
        let foundValue = null;
        
        for (const fieldName of possibleFieldNames) {
            if (record.fields[fieldName] !== undefined) {
                foundField = fieldName;
                foundValue = record.fields[fieldName];
                console.log(`✅ Campo encontrado: "${fieldName}" = "${foundValue}"`);
                break;
            }
        }
        
        if (!foundField) {
            console.error('❌ No se encontró el campo stripe_customer_id en ninguna variación');
            console.log('\n💡 SOLUCIÓN:');
            console.log('1. Ve a Airtable');
            console.log('2. Verifica el nombre EXACTO del campo (puede tener espacios o mayúsculas diferentes)');
            console.log('3. Asegúrate de que el campo tenga un valor (el ID del cliente de Stripe)');
            console.log('4. El valor debe ser algo como: cus_THw3cWvDfKwj5g');
        } else if (!foundValue || foundValue.trim() === '') {
            console.warn('⚠️ El campo existe pero está vacío');
            console.log('💡 Agrega el ID del cliente de Stripe en ese campo');
        } else {
            console.log('\n✅ Campo encontrado correctamente!');
            console.log(`   Nombre del campo: "${foundField}"`);
            console.log(`   Valor: "${foundValue}"`);
            console.log('\n💡 Si el valor está correcto pero aún no funciona, recarga la página');
        }
        
    } catch (error) {
        console.error('❌ Error durante el debug:', error);
        console.error('Stack:', error.stack);
    }
}

// Función auxiliar para verificar directamente desde la consola
window.debugStripeCustomerId = debugStripeCustomerId;

console.log('✅ Script de debug cargado');
console.log('💡 Ejecuta: debugStripeCustomerId()');

