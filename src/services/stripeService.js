// Servicio de Stripe para gestión de facturación
class StripeService {
    constructor() {
        // Cargar configuración de Stripe
        this.config = window.StripeConfig?.config || {
            publishableKey: 'pk_live_51OAW7JGAJ3j5QtJb8OCglZ26J5uSVzVpDlMEqiwpOWBH8X2ibPYU8ibbiWQ9RAkgvcmchT7IHqXR37i6cewDUfT000WwpwoJip',
            apiVersion: '2023-10-16',
            backendURL: '/api/stripe'
        };
        
        this.publishableKey = this.config.publishableKey;
        this.apiVersion = this.config.apiVersion;
        this.backendURL = this.config.backendURL;
        this.baseURL = 'https://api.stripe.com/v1';
        this.customerId = null;
        this.subscriptions = [];
        this.invoices = [];
        this.paymentMethods = [];
    }

    // Configurar el servicio con la clave pública
    async initialize() {
        try {
            console.log('🔄 Inicializando Stripe Service...');
            
            // Para las llamadas al backend, no necesitamos inicializar Stripe.js
            // Solo lo inicializamos si está disponible para funcionalidades del frontend
            if (typeof Stripe !== 'undefined') {
                this.stripe = Stripe(this.publishableKey);
                console.log('✅ Stripe.js inicializado para frontend');
            } else {
                console.log('⚠️ Stripe.js no disponible, usando solo llamadas al backend');
            }
            
            console.log('✅ Stripe Service inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Stripe Service:', error);
            return false;
        }
    }

    // Cargar el script de Stripe
    loadStripeScript() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="stripe.com"]')) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Error cargando Stripe.js'));
            document.head.appendChild(script);
        });
    }

    // Método para hacer llamadas seguras al backend
    async makeSecureRequest(endpoint, options = {}) {
        try {
            const url = `${this.backendURL}${endpoint}`;
            const config = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            // Agregar token de autenticación si está disponible
            const authToken = window.authService?.getToken();
            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }

            console.log(`🔄 Haciendo petición segura a: ${url}`);
            console.log('   Método:', config.method);
            console.log('   Headers:', config.headers);
            
            // Crear un timeout manual (aumentado a 10 segundos)
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: Backend no responde después de 10 segundos')), 10000);
            });
            
            const fetchPromise = fetch(url, config);
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            console.log('📡 Respuesta recibida:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error en respuesta:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Respuesta del backend exitosa');
            return data;
        } catch (error) {
            console.error('❌ Error en petición segura:', error);
            console.error('   Tipo:', error.name);
            console.error('   Mensaje:', error.message);
            
            // Manejar errores específicos
            if (error.message.includes('Failed to fetch') || error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
                console.error('⚠️ Posible bloqueo por extensión del navegador o CORS');
                console.error('💡 Solución: Desactiva ad-blockers o extensiones de privacidad que puedan bloquear Stripe');
            }
            
            throw error;
        }
    }

    // Obtener información del cliente DIRECTAMENTE de Stripe
    async getCustomerInfo() {
        try {
            console.log('🔄 Obteniendo información del cliente desde Stripe...');
            
            // Obtener SOLO el stripe_customer_id del usuario autenticado (único dato de Airtable)
            const currentUser = window.authService?.getCurrentUser();
            
            if (!currentUser) {
                console.error('❌ No hay usuario autenticado');
                throw new Error('Usuario no autenticado');
            }
            
            console.log('👤 Usuario actual:', {
                email: currentUser.email,
                id: currentUser.id,
                stripeCustomerId: currentUser.stripeCustomerId || 'NO ENCONTRADO'
            });
            
            // Verificar todos los campos posibles del usuario
            const possibleStripeFields = [
                currentUser.stripeCustomerId,
                currentUser.stripe_customer_id,
                currentUser.StripeCustomerId,
                currentUser['stripe_customer_id'],
                currentUser['StripeCustomerId']
            ];
            
            const stripeCustomerId = possibleStripeFields.find(id => id && id.trim() !== '');
            
            if (!stripeCustomerId) {
                console.error('❌ Usuario no tiene stripe_customer_id configurado en Airtable');
                console.log('📋 Campos disponibles en el usuario:', Object.keys(currentUser));
                console.log('💡 Para mostrar datos de Stripe:');
                console.log('   1. Ejecuta: debugStripeCustomerId() en la consola');
                console.log('   2. Verifica el nombre exacto del campo en Airtable');
                console.log('   3. Asegúrate de que el campo tenga un valor (ej: cus_THw3cWvDfKwj5g)');
                throw new Error('stripe_customer_id no configurado en Airtable');
            }
            
            console.log('✅ stripe_customer_id encontrado:', stripeCustomerId);
            console.log('🔍 Obteniendo datos de Stripe para customer:', stripeCustomerId);
            
            // Obtener datos REALES directamente de Stripe (sin fallbacks)
            const customerInfo = await this.makeSecureRequest(`/customer/${stripeCustomerId}`);
            
            // Validar que la respuesta tenga la estructura esperada
            if (!customerInfo || !customerInfo.id) {
                throw new Error('Respuesta inválida del backend de Stripe');
            }
            
            this.customerId = customerInfo.id;
            console.log('✅ Información del cliente obtenida directamente de Stripe:', customerInfo);
            console.log('   - ID:', customerInfo.id);
            console.log('   - Email:', customerInfo.email);
            console.log('   - Nombre:', customerInfo.name);
            console.log('   - Moneda:', customerInfo.currency);
            
            return customerInfo;
            
        } catch (error) {
            console.error('❌ Error obteniendo información del cliente de Stripe:', error);
            console.error('   Tipo de error:', error.name);
            console.error('   Mensaje:', error.message);
            if (error.stack) {
                console.error('   Stack:', error.stack);
            }
            throw error; // Propagar el error en lugar de devolver null
        }
    }

    // Obtener suscripciones activas DIRECTAMENTE de Stripe
    async getSubscriptions() {
        try {
            console.log('🔄 Obteniendo suscripciones desde Stripe...');
            
            // Obtener SOLO el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo suscripciones de Stripe para customer:', stripeCustomerId);
            
            // Obtener datos REALES directamente de Stripe
            const subscriptions = await this.makeSecureRequest(`/subscriptions/${stripeCustomerId}`);
            
            // Validar y normalizar la respuesta
            let subscriptionsList = [];
            if (Array.isArray(subscriptions)) {
                subscriptionsList = subscriptions;
            } else if (subscriptions && subscriptions.data && Array.isArray(subscriptions.data)) {
                subscriptionsList = subscriptions.data;
            } else {
                console.warn('⚠️ Formato de respuesta inesperado, devolviendo array vacío');
                return [];
            }

            this.subscriptions = subscriptionsList;
            console.log(`✅ ${subscriptionsList.length} suscripción(es) obtenida(s) directamente de Stripe`);
            
            // Log de detalles de cada suscripción
            subscriptionsList.forEach((sub, index) => {
                const productName = sub.items?.data?.[0]?.price?.product?.name || 
                                   (typeof sub.items?.data?.[0]?.price?.product === 'string' 
                                    ? sub.items?.data?.[0]?.price?.product 
                                    : 'N/A');
                console.log(`   ${index + 1}. ${productName} - ${sub.status}`);
            });
            
            return subscriptionsList;
            
        } catch (error) {
            console.error('❌ Error obteniendo suscripciones de Stripe:', error);
            return []; // Devolver array vacío si hay error
        }
    }

    // Obtener facturas DIRECTAMENTE de Stripe
    async getInvoices() {
        try {
            console.log('🔄 Obteniendo facturas desde Stripe...');
            
            // Obtener SOLO el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo facturas de Stripe para customer:', stripeCustomerId);
            
            // Obtener datos REALES directamente de Stripe
            const invoices = await this.makeSecureRequest(`/invoices/${stripeCustomerId}`);
            
            // Validar y normalizar la respuesta
            let invoicesList = [];
            if (Array.isArray(invoices)) {
                invoicesList = invoices;
            } else if (invoices && invoices.data && Array.isArray(invoices.data)) {
                invoicesList = invoices.data;
            } else {
                console.warn('⚠️ Formato de respuesta inesperado, devolviendo array vacío');
                return [];
            }

            this.invoices = invoicesList;
            console.log(`✅ ${invoicesList.length} factura(s) obtenida(s) directamente de Stripe`);
            
            // Log de detalles de cada factura
            invoicesList.forEach((inv, index) => {
                console.log(`   ${index + 1}. ${inv.number || inv.id} - ${inv.status} - ${this.formatStripeAmount(inv.amount_due || 0, inv.currency || 'usd')}`);
            });
            
            return invoicesList;
            
        } catch (error) {
            console.error('❌ Error obteniendo facturas de Stripe:', error);
            return []; // Devolver array vacío si hay error
        }
    }

    // Obtener métodos de pago DIRECTAMENTE de Stripe
    async getPaymentMethods() {
        try {
            console.log('🔄 Obteniendo métodos de pago desde Stripe...');
            
            // Obtener SOLO el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo métodos de pago de Stripe para customer:', stripeCustomerId);
            
            // Obtener datos REALES directamente de Stripe
            const paymentMethods = await this.makeSecureRequest(`/payment-methods/${stripeCustomerId}`);
            
            // Validar y normalizar la respuesta
            let paymentMethodsList = [];
            if (Array.isArray(paymentMethods)) {
                paymentMethodsList = paymentMethods;
            } else if (paymentMethods && paymentMethods.data && Array.isArray(paymentMethods.data)) {
                paymentMethodsList = paymentMethods.data;
            } else {
                console.warn('⚠️ Formato de respuesta inesperado, devolviendo array vacío');
                return [];
            }

            this.paymentMethods = paymentMethodsList;
            console.log(`✅ ${paymentMethodsList.length} método(s) de pago obtenido(s) directamente de Stripe`);
            
            // Log de detalles de cada método de pago
            paymentMethodsList.forEach((pm, index) => {
                if (pm.card) {
                    console.log(`   ${index + 1}. ${pm.card.brand.toUpperCase()} ****${pm.card.last4} - Expira ${pm.card.exp_month}/${pm.card.exp_year}`);
                }
            });
            
            return paymentMethodsList;
            
        } catch (error) {
            console.error('❌ Error obteniendo métodos de pago de Stripe:', error);
            return []; // Devolver array vacío si hay error
        }
    }

    // Formatear fecha de Stripe
    formatStripeDate(timestamp) {
        return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Formatear monto de Stripe
    formatStripeAmount(amount, currency = 'usd') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100);
    }

    // Obtener estado de la suscripción en español
    getSubscriptionStatusText(status) {
        const statusMap = {
            'active': 'Activa',
            'incomplete': 'Incompleta',
            'incomplete_expired': 'Expirada',
            'past_due': 'Vencida',
            'canceled': 'Cancelada',
            'unpaid': 'Sin pagar',
            'trialing': 'En período de prueba'
        };
        return statusMap[status] || status;
    }

    // Obtener estado de la factura en español
    getInvoiceStatusText(status) {
        const statusMap = {
            'draft': 'Borrador',
            'open': 'Abierta',
            'paid': 'Pagada',
            'void': 'Anulada',
            'uncollectible': 'Incolectable'
        };
        return statusMap[status] || status;
    }

    // Obtener color del estado
    getStatusColor(status, type = 'invoice') {
        if (type === 'subscription') {
            switch (status) {
                case 'active': return 'success';
                case 'trialing': return 'info';
                case 'past_due': return 'warning';
                case 'canceled': return 'danger';
                default: return 'secondary';
            }
        } else {
            switch (status) {
                case 'paid': return 'success';
                case 'open': return 'warning';
                case 'draft': return 'info';
                case 'void': return 'danger';
                default: return 'secondary';
            }
        }
    }

    // Crear cliente en Stripe
    async createCustomer(customerData) {
        try {
            console.log('🔄 Creando cliente...');
            const customer = await this.makeSecureRequest('/customer', {
                method: 'POST',
                body: JSON.stringify(customerData)
            });
            console.log('✅ Cliente creado:', customer);
            return customer;
        } catch (error) {
            console.error('❌ Error creando cliente:', error);
            throw error;
        }
    }

    // Crear suscripción
    async createSubscription(subscriptionData) {
        try {
            console.log('🔄 Creando suscripción...');
            const subscription = await this.makeSecureRequest('/subscription', {
                method: 'POST',
                body: JSON.stringify(subscriptionData)
            });
            console.log('✅ Suscripción creada:', subscription);
            return subscription;
        } catch (error) {
            console.error('❌ Error creando suscripción:', error);
            throw error;
        }
    }

    // Cancelar suscripción
    async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
        try {
            console.log('🔄 Cancelando suscripción:', subscriptionId);
            const subscription = await this.makeSecureRequest(`/subscription/${subscriptionId}/cancel`, {
                method: 'POST',
                body: JSON.stringify({ cancel_at_period_end: cancelAtPeriodEnd })
            });
            console.log('✅ Suscripción cancelada:', subscription);
            return subscription;
        } catch (error) {
            console.error('❌ Error cancelando suscripción:', error);
            throw error;
        }
    }

    // Crear intent de pago
    async createPaymentIntent(paymentData) {
        try {
            console.log('🔄 Creando intent de pago...');
            const paymentIntent = await this.makeSecureRequest('/payment-intent', {
                method: 'POST',
                body: JSON.stringify(paymentData)
            });
            console.log('✅ Intent de pago creado:', paymentIntent);
            return paymentIntent;
        } catch (error) {
            console.error('❌ Error creando intent de pago:', error);
            throw error;
        }
    }

    // Crear setup intent para métodos de pago
    async createSetupIntent(customerId) {
        try {
            console.log('🔄 Creando setup intent...');
            const setupIntent = await this.makeSecureRequest('/setup-intent', {
                method: 'POST',
                body: JSON.stringify({ customer: customerId })
            });
            console.log('✅ Setup intent creado:', setupIntent);
            return setupIntent;
        } catch (error) {
            console.error('❌ Error creando setup intent:', error);
            throw error;
        }
    }

    // Crear sesión del portal de facturación
    async createBillingPortalSession(returnUrl) {
        try {
            console.log('🔄 Creando sesión del portal de facturación...');

            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId ||
                currentUser?.stripe_customer_id ||
                currentUser?.StripeCustomerId ||
                currentUser?.Stripe_Customer_Id ||
                currentUser?.['Stripe Customer ID'] ||
                currentUser?.['stripe customer id'];

            if (!stripeCustomerId) {
                throw new Error('stripe_customer_id no configurado en Airtable');
            }

            const response = await this.makeSecureRequest('/portal-session', {
                method: 'POST',
                body: JSON.stringify({
                    customerId: stripeCustomerId,
                    returnUrl
                })
            });

            if (!response?.url) {
                throw new Error('Respuesta inválida al crear la sesión del portal');
            }

            console.log('✅ Sesión del portal creada correctamente');
            return response.url;
        } catch (error) {
            console.error('❌ Error creando sesión del portal de facturación:', error);
            throw error;
        }
    }
}

// Hacer disponible globalmente
window.StripeService = StripeService;






