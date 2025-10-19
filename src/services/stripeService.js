// Servicio de Stripe para gestión de facturación
class StripeService {
    constructor() {
        this.publishableKey = 'pk_live_51OAW7JGAJ3j5QtJb8OCglZ26J5uSVzVpDlMEqiwpOWBH8X2ibPYU8ibbiWQ9RAkgvcmchT7IHqXR37i6cewDUfT000WwpwoJip';
        this.apiVersion = '2023-10-16';
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
            
            // Cargar el script de Stripe si no está disponible
            if (typeof Stripe === 'undefined') {
                await this.loadStripeScript();
            }
            
            this.stripe = Stripe(this.publishableKey);
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

    // Obtener información del cliente (simulado para demo)
    async getCustomerInfo() {
        try {
            // En una implementación real, esto haría una llamada a tu backend
            // que luego haría la llamada a Stripe con la clave secreta
            
            // Para demo, retornamos datos simulados
            const customerInfo = {
                id: 'cus_demo123',
                email: window.authService?.getCurrentUser()?.email || 'admin@example.com',
                name: window.authService?.getCurrentUser()?.name || 'Usuario Demo',
                created: new Date().toISOString(),
                currency: 'usd',
                default_source: null,
                delinquent: false,
                metadata: {
                    company: 'Konsul Digital'
                }
            };

            this.customerId = customerInfo.id;
            console.log('✅ Información del cliente obtenida:', customerInfo);
            return customerInfo;
        } catch (error) {
            console.error('❌ Error obteniendo información del cliente:', error);
            return null;
        }
    }

    // Obtener suscripciones activas (simulado para demo)
    async getSubscriptions() {
        try {
            // En una implementación real, esto haría una llamada a tu backend
            const subscriptions = [
                {
                    id: 'sub_demo123',
                    status: 'active',
                    current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime() / 1000,
                    current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime() / 1000,
                    cancel_at_period_end: false,
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
            console.log('✅ Suscripciones obtenidas:', subscriptions);
            return subscriptions;
        } catch (error) {
            console.error('❌ Error obteniendo suscripciones:', error);
            return [];
        }
    }

    // Obtener facturas (simulado para demo)
    async getInvoices() {
        try {
            // En una implementación real, esto haría una llamada a tu backend
            const invoices = [
                {
                    id: 'in_demo123',
                    number: 'INV-001',
                    status: 'paid',
                    amount_paid: 2999,
                    amount_due: 2999,
                    currency: 'usd',
                    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime() / 1000,
                    due_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime() / 1000,
                    hosted_invoice_url: '#',
                    invoice_pdf: '#',
                    lines: {
                        data: [{
                            description: 'Plan Premium - Mensual',
                            amount: 2999,
                            currency: 'usd',
                            period: {
                                start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).getTime() / 1000,
                                end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime() / 1000
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
                    created: new Date().getTime() / 1000,
                    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime() / 1000,
                    hosted_invoice_url: '#',
                    invoice_pdf: '#',
                    lines: {
                        data: [{
                            description: 'Plan Premium - Mensual',
                            amount: 2999,
                            currency: 'usd',
                            period: {
                                start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).getTime() / 1000,
                                end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).getTime() / 1000
                            }
                        }]
                    }
                }
            ];

            this.invoices = invoices;
            console.log('✅ Facturas obtenidas:', invoices);
            return invoices;
        } catch (error) {
            console.error('❌ Error obteniendo facturas:', error);
            return [];
        }
    }

    // Obtener métodos de pago (simulado para demo)
    async getPaymentMethods() {
        try {
            // En una implementación real, esto haría una llamada a tu backend
            const paymentMethods = [
                {
                    id: 'pm_demo123',
                    type: 'card',
                    card: {
                        brand: 'visa',
                        last4: '4242',
                        exp_month: 12,
                        exp_year: 2025
                    }
                }
            ];

            this.paymentMethods = paymentMethods;
            console.log('✅ Métodos de pago obtenidos:', paymentMethods);
            return paymentMethods;
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
}

// Hacer disponible globalmente
window.StripeService = StripeService;





