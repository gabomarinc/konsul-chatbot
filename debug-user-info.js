// Script para debuggear la información del usuario actual
// Ejecutar en la consola del navegador

function debugUserInfo() {
    console.log('🔍 Debuggeando información del usuario...');
    
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
        
        console.log('👤 Usuario actual:', currentUser);
        console.log('📧 Email:', currentUser.email);
        console.log('🏷️ Nombre:', currentUser.name);
        console.log('🆔 ID:', currentUser.id);
        console.log('💳 Stripe Customer ID:', currentUser.stripeCustomerId || 'NO CONFIGURADO');
        
        // Verificar si tiene stripe_customer_id
        if (currentUser.stripeCustomerId) {
            console.log('✅ El usuario tiene stripe_customer_id configurado');
            console.log('🔗 Customer ID:', currentUser.stripeCustomerId);
        } else {
            console.log('⚠️ El usuario NO tiene stripe_customer_id configurado');
            console.log('💡 Necesitas agregar el customer ID en Airtable');
        }
        
        // Verificar campos disponibles
        console.log('\n📋 Todos los campos disponibles:');
        Object.keys(currentUser).forEach(key => {
            console.log(`- ${key}:`, currentUser[key]);
        });
        
    } catch (error) {
        console.error('❌ Error debuggeando usuario:', error);
    }
}

// Función para verificar la conexión con Airtable
async function debugAirtableConnection() {
    console.log('🗄️ Debuggeando conexión con Airtable...');
    
    try {
        if (!window.airtableService) {
            console.error('❌ AirtableService no está disponible');
            return;
        }
        
        const currentUser = window.authService?.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No hay usuario autenticado');
            return;
        }
        
        console.log('🔄 Obteniendo usuario desde Airtable...');
        const result = await window.airtableService.getUserByEmail(currentUser.email);
        
        if (result.success) {
            console.log('✅ Usuario obtenido desde Airtable:', result.user);
            console.log('💳 Stripe Customer ID desde Airtable:', result.user.stripeCustomerId || 'NO CONFIGURADO');
        } else {
            console.error('❌ Error obteniendo usuario desde Airtable:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Error debuggeando Airtable:', error);
    }
}

// Exportar funciones
window.debugUserInfo = debugUserInfo;
window.debugAirtableConnection = debugAirtableConnection;

console.log('🔧 Script de debug cargado. Usa:');
console.log('- debugUserInfo() - Ver información del usuario actual');
console.log('- debugAirtableConnection() - Verificar conexión con Airtable');
