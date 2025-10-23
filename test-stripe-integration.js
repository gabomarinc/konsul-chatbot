// Script de prueba para verificar la integración de Stripe
// Ejecutar en la consola del navegador para probar la funcionalidad

async function testStripeIntegration() {
    console.log('🧪 Iniciando prueba de integración de Stripe...');
    
    try {
        // 1. Verificar que las clases estén disponibles
        console.log('1️⃣ Verificando clases disponibles...');
        
        if (typeof StripeService === 'undefined') {
            throw new Error('StripeService no está disponible');
        }
        console.log('✅ StripeService disponible');
        
        if (typeof BillingManager === 'undefined') {
            throw new Error('BillingManager no está disponible');
        }
        console.log('✅ BillingManager disponible');
        
        if (typeof window.authService === 'undefined') {
            throw new Error('AuthService no está disponible');
        }
        console.log('✅ AuthService disponible');
        
        // 2. Verificar usuario autenticado
        console.log('2️⃣ Verificando usuario autenticado...');
        const currentUser = window.authService.getCurrentUser();
        
        if (!currentUser) {
            throw new Error('No hay usuario autenticado');
        }
        console.log('✅ Usuario autenticado:', currentUser.email);
        
        // 3. Verificar stripe_customer_id
        console.log('3️⃣ Verificando stripe_customer_id...');
        const stripeCustomerId = currentUser.stripeCustomerId;
        
        if (!stripeCustomerId) {
            console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
            console.log('💡 Para obtener datos reales de Stripe, agrega el campo StripeCustomerId en Airtable');
        } else {
            console.log('✅ stripe_customer_id encontrado:', stripeCustomerId);
        }
        
        // 4. Inicializar StripeService
        console.log('4️⃣ Inicializando StripeService...');
        const stripeService = new StripeService();
        await stripeService.initialize();
        console.log('✅ StripeService inicializado');
        
        // 5. Probar obtención de datos
        console.log('5️⃣ Probando obtención de datos...');
        
        // Probar información del cliente
        console.log('🔄 Obteniendo información del cliente...');
        const customerInfo = await stripeService.getCustomerInfo();
        console.log('✅ Información del cliente:', customerInfo);
        
        // Probar suscripciones
        console.log('🔄 Obteniendo suscripciones...');
        const subscriptions = await stripeService.getSubscriptions();
        console.log('✅ Suscripciones:', subscriptions);
        
        // Probar facturas
        console.log('🔄 Obteniendo facturas...');
        const invoices = await stripeService.getInvoices();
        console.log('✅ Facturas:', invoices);
        
        // Probar métodos de pago
        console.log('🔄 Obteniendo métodos de pago...');
        const paymentMethods = await stripeService.getPaymentMethods();
        console.log('✅ Métodos de pago:', paymentMethods);
        
        // 6. Probar BillingManager
        console.log('6️⃣ Probando BillingManager...');
        const billingManager = new BillingManager();
        await billingManager.init();
        console.log('✅ BillingManager inicializado');
        
        console.log('🎉 ¡Prueba completada exitosamente!');
        
        // Mostrar resumen
        console.log('\n📊 RESUMEN:');
        console.log('- Usuario:', currentUser.email);
        console.log('- Stripe Customer ID:', stripeCustomerId || 'No configurado');
        console.log('- Cliente:', customerInfo?.id || 'No disponible');
        console.log('- Suscripciones:', subscriptions?.length || 0);
        console.log('- Facturas:', invoices?.length || 0);
        console.log('- Métodos de pago:', paymentMethods?.length || 0);
        
        if (!stripeCustomerId) {
            console.log('\n💡 PRÓXIMOS PASOS:');
            console.log('1. Agrega el campo "StripeCustomerId" en tu tabla de usuarios en Airtable');
            console.log('2. Obtén el customer ID desde Stripe Dashboard');
            console.log('3. Actualiza el registro del usuario en Airtable');
            console.log('4. Refresca la página para ver los datos reales');
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        console.log('\n🔧 SOLUCIÓN:');
        console.log('1. Verifica que todos los scripts estén cargados correctamente');
        console.log('2. Asegúrate de estar autenticado');
        console.log('3. Revisa la configuración de Stripe');
    }
}

// Función para probar la conexión con el backend
async function testBackendConnection() {
    console.log('🌐 Probando conexión con el backend...');
    
    try {
        const response = await fetch('/api/stripe/customer/test', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            console.log('✅ Backend disponible');
            const data = await response.json();
            console.log('📊 Respuesta del backend:', data);
        } else {
            console.log('⚠️ Backend no disponible (esto es normal si no está implementado)');
            console.log('💡 Implementa el backend usando backend-example.js para obtener datos reales');
        }
    } catch (error) {
        console.log('⚠️ Backend no disponible (esto es normal si no está implementado)');
        console.log('💡 Implementa el backend usando backend-example.js para obtener datos reales');
    }
}

// Función para mostrar información del usuario actual
function showUserInfo() {
    console.log('👤 Información del usuario actual:');
    
    const currentUser = window.authService?.getCurrentUser();
    if (currentUser) {
        console.log('- Email:', currentUser.email);
        console.log('- Nombre:', currentUser.name);
        console.log('- Rol:', currentUser.role);
        console.log('- Stripe Customer ID:', currentUser.stripeCustomerId || 'No configurado');
        console.log('- Último login:', currentUser.lastLogin);
    } else {
        console.log('❌ No hay usuario autenticado');
    }
}

// Exportar funciones para uso en consola
window.testStripeIntegration = testStripeIntegration;
window.testBackendConnection = testBackendConnection;
window.showUserInfo = showUserInfo;

console.log('🧪 Script de prueba cargado. Usa:');
console.log('- testStripeIntegration() - Probar integración completa');
console.log('- testBackendConnection() - Probar conexión con backend');
console.log('- showUserInfo() - Mostrar información del usuario');
