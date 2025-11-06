// Script de prueba para verificar la integración de Stripe
// Ejecutar en la consola del navegador después de iniciar sesión

async function testBillingStripe() {
    console.log('🧪 Iniciando prueba de integración de Stripe...\n');
    
    try {
        // 1. Verificar que el usuario esté autenticado
        console.log('1️⃣ Verificando autenticación...');
        if (!window.authService) {
            console.error('❌ AuthService no está disponible');
            return;
        }
        
        const currentUser = window.authService.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No hay usuario autenticado. Por favor, inicia sesión primero.');
            return;
        }
        
        console.log('✅ Usuario autenticado:', currentUser.email);
        console.log('   - Nombre:', currentUser.name);
        console.log('   - ID:', currentUser.id);
        
        // 2. Verificar stripe_customer_id
        console.log('\n2️⃣ Verificando stripe_customer_id...');
        const stripeCustomerId = currentUser.stripeCustomerId;
        
        if (!stripeCustomerId) {
            console.warn('⚠️ Usuario NO tiene stripe_customer_id configurado');
            console.log('💡 Para obtener datos reales de Stripe:');
            console.log('   1. Ve a Airtable');
            console.log('   2. Agrega el campo "stripe_customer_id" en tu tabla de usuarios');
            console.log('   3. Agrega el ID del cliente de Stripe (formato: cus_xxxxx)');
            console.log('   4. Recarga la página y vuelve a ejecutar este script');
        } else {
            console.log('✅ stripe_customer_id encontrado:', stripeCustomerId);
        }
        
        // 3. Verificar StripeService
        console.log('\n3️⃣ Verificando StripeService...');
        if (!window.StripeService) {
            console.error('❌ StripeService no está disponible');
            return;
        }
        
        const stripeService = new StripeService();
        await stripeService.initialize();
        console.log('✅ StripeService inicializado');
        
        // 4. Probar obtención de datos
        console.log('\n4️⃣ Probando obtención de datos de Stripe...');
        
        if (stripeCustomerId) {
            console.log('📊 Intentando obtener datos reales del backend...');
            
            // Probar backend
            try {
                const testUrl = `/api/stripe/customer/${stripeCustomerId}`;
                console.log('🔗 URL del backend:', testUrl);
                
                const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.authService.getToken()}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Backend disponible y respondiendo');
                    console.log('📦 Datos del cliente:', data);
                } else {
                    console.warn('⚠️ Backend no disponible o error:', response.status, response.statusText);
                    console.log('💡 Se usarán datos simulados');
                }
            } catch (error) {
                console.warn('⚠️ Error al conectar con el backend:', error.message);
                console.log('💡 Se usarán datos simulados');
            }
        }
        
        // 5. Probar obtención de información del cliente
        console.log('\n5️⃣ Obteniendo información del cliente...');
        const customerInfo = await stripeService.getCustomerInfo();
        
        if (customerInfo) {
            console.log('✅ Información del cliente obtenida:');
            console.log('   - ID:', customerInfo.id);
            console.log('   - Email:', customerInfo.email);
            console.log('   - Nombre:', customerInfo.name);
            console.log('   - Moneda:', customerInfo.currency);
            console.log('   - Estado:', customerInfo.delinquent ? 'Moroso' : 'Al día');
            console.log('   - Fecha de creación:', customerInfo.created);
        } else {
            console.error('❌ No se pudo obtener información del cliente');
        }
        
        // 6. Probar obtención de suscripciones
        console.log('\n6️⃣ Obteniendo suscripciones...');
        const subscriptions = await stripeService.getSubscriptions();
        
        if (subscriptions && subscriptions.length > 0) {
            console.log(`✅ ${subscriptions.length} suscripción(es) encontrada(s):`);
            subscriptions.forEach((sub, index) => {
                console.log(`   ${index + 1}. ID: ${sub.id}, Estado: ${sub.status}`);
            });
        } else {
            console.log('ℹ️ No hay suscripciones (esto es normal si no hay suscripciones activas)');
        }
        
        // 7. Probar obtención de facturas
        console.log('\n7️⃣ Obteniendo facturas...');
        const invoices = await stripeService.getInvoices();
        
        if (invoices && invoices.length > 0) {
            console.log(`✅ ${invoices.length} factura(s) encontrada(s):`);
            invoices.forEach((inv, index) => {
                console.log(`   ${index + 1}. ${inv.number || inv.id}, Estado: ${inv.status}, Monto: ${inv.amount_due / 100} ${inv.currency?.toUpperCase() || 'USD'}`);
            });
        } else {
            console.log('ℹ️ No hay facturas (esto es normal si no hay facturas)');
        }
        
        // 8. Probar obtención de métodos de pago
        console.log('\n8️⃣ Obteniendo métodos de pago...');
        const paymentMethods = await stripeService.getPaymentMethods();
        
        if (paymentMethods && paymentMethods.length > 0) {
            console.log(`✅ ${paymentMethods.length} método(s) de pago encontrado(s):`);
            paymentMethods.forEach((pm, index) => {
                if (pm.card) {
                    console.log(`   ${index + 1}. ${pm.card.brand.toUpperCase()} ****${pm.card.last4}, Expira: ${pm.card.exp_month}/${pm.card.exp_year}`);
                }
            });
        } else {
            console.log('ℹ️ No hay métodos de pago configurados');
        }
        
        // 9. Verificar BillingManager
        console.log('\n9️⃣ Verificando BillingManager...');
        if (!window.BillingManager) {
            console.error('❌ BillingManager no está disponible');
            return;
        }
        
        if (!window.billingManager) {
            console.log('🔄 Inicializando BillingManager...');
            window.billingManager = new BillingManager();
            await window.billingManager.init();
        }
        
        console.log('✅ BillingManager disponible');
        console.log('   - Customer Info:', window.billingManager.customerInfo ? '✅' : '❌');
        console.log('   - Subscriptions:', window.billingManager.subscriptions?.length || 0);
        console.log('   - Invoices:', window.billingManager.invoices?.length || 0);
        console.log('   - Payment Methods:', window.billingManager.paymentMethods?.length || 0);
        
        // 10. Resumen final
        console.log('\n📋 RESUMEN:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        if (stripeCustomerId) {
            console.log('✅ stripe_customer_id configurado:', stripeCustomerId);
        } else {
            console.log('⚠️ stripe_customer_id NO configurado');
            console.log('   → Los datos mostrados serán simulados');
        }
        
        if (customerInfo && customerInfo.id !== 'cus_demo123') {
            console.log('✅ Datos reales de Stripe disponibles');
        } else {
            console.log('⚠️ Usando datos simulados');
            console.log('   → Para obtener datos reales:');
            console.log('     1. Agrega stripe_customer_id en Airtable');
            console.log('     2. (Opcional) Implementa backend en /api/stripe');
        }
        
        console.log('\n💡 Para ver la pantalla de facturación:');
        console.log('   1. Ve a "Mi Perfil" > "Facturación"');
        console.log('   2. O ejecuta: window.profileManager.switchTab("billing")');
        
        console.log('\n✅ Prueba completada');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        console.error('Stack:', error.stack);
    }
}

// Función auxiliar para probar desde la consola
window.testBillingStripe = testBillingStripe;

console.log('✅ Script de prueba cargado');
console.log('💡 Ejecuta: testBillingStripe()');

