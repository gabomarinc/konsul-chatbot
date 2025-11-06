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
                timeout: 5000, // 5 segundos de timeout
                ...options
            };

            // Agregar token de autenticación si está disponible
            const authToken = window.authService?.getToken();
            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }

            console.log(`🔄 Haciendo petición segura a: ${url}`);
            
            // Crear un timeout manual
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: Backend no responde')), 5000);
            });
            
            const fetchPromise = fetch(url, config);
            const response = await Promise.race([fetchPromise, timeoutPromise]);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Respuesta del backend:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en petición segura:', error);
            throw error;
        }
    }

    // Obtener información del cliente
    async getCustomerInfo() {
        try {
            console.log('🔄 Obteniendo información del cliente...');
            
            // Obtener el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado en Airtable');
                console.log('💡 Para mostrar datos reales de Stripe, agrega el campo "stripe_customer_id" en Airtable con el ID del cliente de Stripe');
                
                // Fallback a datos simulados si no hay stripe_customer_id
                const customerInfo = {
                    id: 'cus_demo123',
                    email: currentUser?.email || 'admin@example.com',
                    name: currentUser?.name || currentUser?.company || 'Usuario Demo',
                    created: currentUser?.createdAt ? new Date(currentUser.createdAt).toISOString() : new Date().toISOString(),
                    currency: 'usd',
                    default_source: null,
                    delinquent: false,
                    metadata: {
                        company: currentUser?.company || 'Konsul Digital'
                    }
                };

                this.customerId = customerInfo.id;
                console.log('✅ Información del cliente obtenida (simulada - sin stripe_customer_id):', customerInfo);
                return customerInfo;
            }
            
            console.log('🔍 Usando stripe_customer_id:', stripeCustomerId);
            
            // Intentar obtener datos reales del backend usando el stripe_customer_id
            try {
                const customerInfo = await this.makeSecureRequest(`/customer/${stripeCustomerId}`);
                
                // Validar que la respuesta tenga la estructura esperada
                if (customerInfo && customerInfo.id) {
                    this.customerId = customerInfo.id;
                    console.log('✅ Información del cliente obtenida desde backend:', customerInfo);
                    return customerInfo;
                } else {
                    throw new Error('Respuesta inválida del backend');
                }
            } catch (backendError) {
                console.warn('⚠️ Backend no disponible o error:', backendError.message);
                console.log('💡 Para obtener datos reales de Stripe, implementa un backend con los endpoints de /api/stripe');
                console.log('📖 Ver archivo backend-example.js para referencia');
                
                // Fallback a datos simulados pero usando el ID real
                const customerInfo = {
                    id: stripeCustomerId,
                    email: currentUser?.email || 'admin@example.com',
                    name: currentUser?.name || currentUser?.company || 'Usuario Demo',
                    created: currentUser?.createdAt ? new Date(currentUser.createdAt).toISOString() : new Date().toISOString(),
                    currency: 'usd',
                    default_source: null,
                    delinquent: false,
                    metadata: {
                        company: currentUser?.company || 'Konsul Digital'
                    }
                };

                this.customerId = customerInfo.id;
                console.log('✅ Información del cliente obtenida (simulada con ID real):', customerInfo);
                return customerInfo;
            }
        } catch (error) {
            console.error('❌ Error obteniendo información del cliente:', error);
            return null;
        }
    }

    // Obtener suscripciones activas
    async getSubscriptions() {
        try {
            console.log('🔄 Obteniendo suscripciones...');
            
            // Obtener el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo suscripciones para stripe_customer_id:', stripeCustomerId);
            
            // Intentar obtener datos reales del backend usando el stripe_customer_id
            try {
                const subscriptions = await this.makeSecureRequest(`/subscriptions/${stripeCustomerId}`);
                
                // Validar que la respuesta sea un array
                if (Array.isArray(subscriptions)) {
                    this.subscriptions = subscriptions;
                    console.log(`✅ ${subscriptions.length} suscripción(es) obtenida(s) desde backend:`, subscriptions);
                    return subscriptions;
                } else if (subscriptions && subscriptions.data && Array.isArray(subscriptions.data)) {
                    // Si viene en formato { data: [...] }
                    this.subscriptions = subscriptions.data;
                    console.log(`✅ ${subscriptions.data.length} suscripción(es) obtenida(s) desde backend:`, subscriptions.data);
                    return subscriptions.data;
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (backendError) {
                console.warn('⚠️ Backend no disponible, usando datos simulados:', backendError.message);
                
                // Fallback a datos simulados si el backend no está disponible
                const subscriptions = [
                    {
                        id: 'sub_demo123',
                        status: 'active',
                        current_period_start: Math.floor((Date.now() - 15 * 24 * 60 * 60 * 1000) / 1000),
                        current_period_end: Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000),
                        cancel_at_period_end: false,
                        customer: stripeCustomerId,
                        items: {
                            data: [{
                                price: {
                                    id: 'price_demo123',
                                    unit_amount: 2999, // $29.99
                                    currency: 'usd',
                                    recurring: {
                                        interval: 'month'
                                    },
                                    product: {
                                        id: 'prod_demo123',
                                        name: 'Plan Premium',
                                        description: 'Plan premium con todas las funcionalidades'
                                    }
                                }
                            }]
                        }
                    }
                ];

                this.subscriptions = subscriptions;
                console.log('✅ Suscripciones obtenidas (simuladas):', subscriptions);
                return subscriptions;
            }
        } catch (error) {
            console.error('❌ Error obteniendo suscripciones:', error);
            return [];
        }
    }

    // Obtener facturas
    async getInvoices() {
        try {
            console.log('🔄 Obteniendo facturas...');
            
            // Obtener el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo facturas para stripe_customer_id:', stripeCustomerId);
            
            // Intentar obtener datos reales del backend usando el stripe_customer_id
            try {
                const invoices = await this.makeSecureRequest(`/invoices/${stripeCustomerId}`);
                
                // Validar que la respuesta sea un array
                if (Array.isArray(invoices)) {
                    this.invoices = invoices;
                    console.log(`✅ ${invoices.length} factura(s) obtenida(s) desde backend:`, invoices);
                    return invoices;
                } else if (invoices && invoices.data && Array.isArray(invoices.data)) {
                    // Si viene en formato { data: [...] }
                    this.invoices = invoices.data;
                    console.log(`✅ ${invoices.data.length} factura(s) obtenida(s) desde backend:`, invoices.data);
                    return invoices.data;
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (backendError) {
                console.warn('⚠️ Backend no disponible, usando datos simulados:', backendError.message);
                
                // Fallback a datos simulados si el backend no está disponible
                const invoices = [
                    {
                        id: 'in_demo123',
                        number: 'INV-001',
                        status: 'paid',
                        amount_paid: 2999,
                        amount_due: 2999,
                        currency: 'usd',
                        customer: stripeCustomerId,
                        created: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
                        due_date: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
                        hosted_invoice_url: '#',
                        invoice_pdf: '#',
                        lines: {
                            data: [{
                                description: 'Plan Premium - Mensual',
                                amount: 2999,
                                currency: 'usd',
                                period: {
                                    start: Math.floor((Date.now() - 60 * 24 * 60 * 60 * 1000) / 1000),
                                    end: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)
                                }
                            }]
                        }
                    },
                    {
                        id: 'in_demo124',
                        number: 'INV-002',
                        status: 'open',
                        amount_paid: 0,
                        amount_due: 2999,
                        currency: 'usd',
                        customer: stripeCustomerId,
                        created: Math.floor(Date.now() / 1000),
                        due_date: Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000),
                        hosted_invoice_url: '#',
                        invoice_pdf: '#',
                        lines: {
                            data: [{
                                description: 'Plan Premium - Mensual',
                                amount: 2999,
                                currency: 'usd',
                                period: {
                                    start: Math.floor((Date.now() - 15 * 24 * 60 * 60 * 1000) / 1000),
                                    end: Math.floor((Date.now() + 15 * 24 * 60 * 60 * 1000) / 1000)
                                }
                            }]
                        }
                    }
                ];

                this.invoices = invoices;
                console.log('✅ Facturas obtenidas (simuladas):', invoices);
                return invoices;
            }
        } catch (error) {
            console.error('❌ Error obteniendo facturas:', error);
            return [];
        }
    }

    // Obtener métodos de pago
    async getPaymentMethods() {
        try {
            console.log('🔄 Obteniendo métodos de pago...');
            
            // Obtener el stripe_customer_id del usuario autenticado
            const currentUser = window.authService?.getCurrentUser();
            const stripeCustomerId = currentUser?.stripeCustomerId;
            
            if (!stripeCustomerId) {
                console.warn('⚠️ Usuario no tiene stripe_customer_id configurado');
                return [];
            }
            
            console.log('🔍 Obteniendo métodos de pago para stripe_customer_id:', stripeCustomerId);
            
            // Intentar obtener datos reales del backend usando el stripe_customer_id
            try {
                const paymentMethods = await this.makeSecureRequest(`/payment-methods/${stripeCustomerId}`);
                
                // Validar que la respuesta sea un array
                if (Array.isArray(paymentMethods)) {
                    this.paymentMethods = paymentMethods;
                    console.log(`✅ ${paymentMethods.length} método(s) de pago obtenido(s) desde backend:`, paymentMethods);
                    return paymentMethods;
                } else if (paymentMethods && paymentMethods.data && Array.isArray(paymentMethods.data)) {
                    // Si viene en formato { data: [...] }
                    this.paymentMethods = paymentMethods.data;
                    console.log(`✅ ${paymentMethods.data.length} método(s) de pago obtenido(s) desde backend:`, paymentMethods.data);
                    return paymentMethods.data;
                } else {
                    throw new Error('Formato de respuesta inválido');
                }
            } catch (backendError) {
                console.warn('⚠️ Backend no disponible, usando datos simulados:', backendError.message);
                
                // Fallback a datos simulados si el backend no está disponible
                const paymentMethods = [
                    {
                        id: 'pm_demo123',
                        type: 'card',
                        customer: stripeCustomerId,
                        card: {
                            brand: 'visa',
                            last4: '4242',
                            exp_month: 12,
                            exp_year: 2025
                        }
                    }
                ];

                this.paymentMethods = paymentMethods;
                console.log('✅ Métodos de pago obtenidos (simulados):', paymentMethods);
                return paymentMethods;
            }
        } catch (error) {
            console.error('❌ Error obteniendo métodos de pago:', error);
            return [];
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
}

// Hacer disponible globalmente
window.StripeService = StripeService;






