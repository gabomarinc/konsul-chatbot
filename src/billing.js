// Manager de Facturación
class BillingManager {
    constructor() {
        this.stripeService = null;
        this.customerInfo = null;
        this.subscriptions = [];
        this.invoices = [];
        this.paymentMethods = [];
        this.init();
    }

    async init() {
        try {
            console.log('🔄 Inicializando Billing Manager...');
            
            // Inicializar Stripe Service
            this.stripeService = new StripeService();
            await this.stripeService.initialize();
            
            // Cargar datos de facturación
            await this.loadBillingData();
            
            console.log('✅ Billing Manager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Billing Manager:', error);
        }
    }

    // Cargar todos los datos de facturación
    async loadBillingData() {
        try {
            console.log('📊 Cargando datos de facturación...');
            
            // Cargar datos en paralelo
            const [customerInfo, subscriptions, invoices, paymentMethods] = await Promise.all([
                this.stripeService.getCustomerInfo(),
                this.stripeService.getSubscriptions(),
                this.stripeService.getInvoices(),
                this.stripeService.getPaymentMethods()
            ]);

            this.customerInfo = customerInfo;
            this.subscriptions = subscriptions;
            this.invoices = invoices;
            this.paymentMethods = paymentMethods;

            // Renderizar la UI
            this.renderBillingUI();
            
            console.log('✅ Datos de facturación cargados correctamente');
        } catch (error) {
            console.error('❌ Error cargando datos de facturación:', error);
            this.showErrorMessage('Error cargando datos de facturación');
        }
    }

    // Renderizar la interfaz de facturación
    renderBillingUI() {
        console.log('🎨 Renderizando interfaz de facturación...');
        console.log('- Customer Info:', this.customerInfo);
        console.log('- Subscriptions:', this.subscriptions);
        console.log('- Invoices:', this.invoices);
        console.log('- Payment Methods:', this.paymentMethods);
        
        this.renderCustomerInfo();
        this.renderSubscriptions();
        this.renderInvoices();
        this.renderPaymentMethods();
        
        console.log('✅ Interfaz de facturación renderizada');
    }

    // Renderizar información del cliente
    renderCustomerInfo() {
        console.log('👤 Renderizando información del cliente...');
        const customerInfoSection = document.getElementById('customerInfoSection');
        
        if (!customerInfoSection) {
            console.error('❌ No se encontró el elemento customerInfoSection');
            return;
        }
        
        if (!this.customerInfo) {
            console.warn('⚠️ No hay información del cliente para renderizar');
            return;
        }
        
        console.log('✅ Renderizando información del cliente:', this.customerInfo);

        customerInfoSection.innerHTML = `
            <div class="billing-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-user"></i>
                        Información del Cliente
                    </h3>
                </div>
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <label>ID del Cliente:</label>
                            <span class="info-value">${this.customerInfo.id}</span>
                        </div>
                        <div class="info-item">
                            <label>Email:</label>
                            <span class="info-value">${this.customerInfo.email}</span>
                        </div>
                        <div class="info-item">
                            <label>Nombre:</label>
                            <span class="info-value">${this.customerInfo.name}</span>
                        </div>
                        <div class="info-item">
                            <label>Fecha de Registro:</label>
                            <span class="info-value">${this.formatDate(this.customerInfo.created)}</span>
                        </div>
                        <div class="info-item">
                            <label>Moneda:</label>
                            <span class="info-value">${this.customerInfo.currency.toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <label>Estado:</label>
                            <span class="status-badge ${this.customerInfo.delinquent ? 'danger' : 'success'}">
                                ${this.customerInfo.delinquent ? 'Moroso' : 'Al día'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar suscripciones
    renderSubscriptions() {
        const subscriptionsSection = document.getElementById('subscriptionsSection');
        if (!subscriptionsSection) return;

        if (this.subscriptions.length === 0) {
            subscriptionsSection.innerHTML = `
                <div class="billing-card">
                    <div class="card-header">
                        <h3>
                            <i class="fas fa-credit-card"></i>
                            Suscripciones
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="empty-state">
                            <i class="fas fa-credit-card"></i>
                            <p>No tienes suscripciones activas</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const subscriptionsHTML = this.subscriptions.map(subscription => {
            const product = subscription.items.data[0]?.price?.product;
            const price = subscription.items.data[0]?.price;
            const statusColor = this.stripeService.getStatusColor(subscription.status, 'subscription');
            const statusText = this.stripeService.getSubscriptionStatusText(subscription.status);

            return `
                <div class="subscription-item">
                    <div class="subscription-header">
                        <div class="subscription-info">
                            <h4>${product?.name || 'Plan Premium'}</h4>
                            <p>${product?.description || 'Plan con todas las funcionalidades'}</p>
                        </div>
                        <div class="subscription-status">
                            <span class="status-badge ${statusColor}">${statusText}</span>
                        </div>
                    </div>
                    <div class="subscription-details">
                        <div class="detail-item">
                            <label>Precio:</label>
                            <span>${this.stripeService.formatStripeAmount(price?.unit_amount || 0)} ${price?.recurring?.interval || 'mensual'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Período actual:</label>
                            <span>${this.stripeService.formatStripeDate(subscription.current_period_start)} - ${this.stripeService.formatStripeDate(subscription.current_period_end)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Cancelar al finalizar:</label>
                            <span>${subscription.cancel_at_period_end ? 'Sí' : 'No'}</span>
                        </div>
                    </div>
                    <div class="subscription-actions">
                        ${subscription.status === 'active' ? `
                            <button class="btn btn-outline btn-sm" onclick="window.billingManager.manageSubscription('${subscription.id}')">
                                <i class="fas fa-cog"></i>
                                Gestionar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        subscriptionsSection.innerHTML = `
            <div class="billing-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-credit-card"></i>
                        Suscripciones Activas
                    </h3>
                </div>
                <div class="card-body">
                    <div class="subscriptions-list">
                        ${subscriptionsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar facturas
    renderInvoices() {
        const invoicesSection = document.getElementById('invoicesSection');
        if (!invoicesSection) return;

        if (this.invoices.length === 0) {
            invoicesSection.innerHTML = `
                <div class="billing-card">
                    <div class="card-header">
                        <h3>
                            <i class="fas fa-file-invoice"></i>
                            Facturas
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="empty-state">
                            <i class="fas fa-file-invoice"></i>
                            <p>No hay facturas disponibles</p>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const invoicesHTML = this.invoices.map(invoice => {
            const statusColor = this.stripeService.getStatusColor(invoice.status);
            const statusText = this.stripeService.getInvoiceStatusText(invoice.status);

            return `
                <div class="invoice-item">
                    <div class="invoice-header">
                        <div class="invoice-info">
                            <h4>${invoice.number}</h4>
                            <p>${this.stripeService.formatStripeDate(invoice.created)}</p>
                        </div>
                        <div class="invoice-amount">
                            <span class="amount">${this.stripeService.formatStripeAmount(invoice.amount_due)}</span>
                            <span class="status-badge ${statusColor}">${statusText}</span>
                        </div>
                    </div>
                    <div class="invoice-details">
                        <div class="detail-item">
                            <label>Vencimiento:</label>
                            <span>${this.stripeService.formatStripeDate(invoice.due_date)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Pagado:</label>
                            <span>${this.stripeService.formatStripeAmount(invoice.amount_paid)}</span>
                        </div>
                    </div>
                    <div class="invoice-actions">
                        <button class="btn btn-outline btn-sm" onclick="window.billingManager.downloadInvoice('${invoice.id}')">
                            <i class="fas fa-download"></i>
                            Descargar PDF
                        </button>
                        ${invoice.status === 'open' ? `
                            <button class="btn btn-primary btn-sm" onclick="window.billingManager.payInvoice('${invoice.id}')">
                                <i class="fas fa-credit-card"></i>
                                Pagar Ahora
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        invoicesSection.innerHTML = `
            <div class="billing-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-file-invoice"></i>
                        Historial de Facturas
                    </h3>
                </div>
                <div class="card-body">
                    <div class="invoices-list">
                        ${invoicesHTML}
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar métodos de pago
    renderPaymentMethods() {
        const paymentMethodsSection = document.getElementById('paymentMethodsSection');
        if (!paymentMethodsSection) return;

        if (this.paymentMethods.length === 0) {
            paymentMethodsSection.innerHTML = `
                <div class="billing-card">
                    <div class="card-header">
                        <h3>
                            <i class="fas fa-credit-card"></i>
                            Métodos de Pago
                        </h3>
                    </div>
                    <div class="card-body">
                        <div class="empty-state">
                            <i class="fas fa-credit-card"></i>
                            <p>No hay métodos de pago configurados</p>
                            <button class="btn btn-primary" onclick="window.billingManager.addPaymentMethod()">
                                <i class="fas fa-plus"></i>
                                Agregar Método de Pago
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }

        const paymentMethodsHTML = this.paymentMethods.map(pm => {
            const cardIcon = this.getCardIcon(pm.card.brand);
            return `
                <div class="payment-method-item">
                    <div class="payment-method-info">
                        <div class="card-icon">
                            <i class="${cardIcon}"></i>
                        </div>
                        <div class="card-details">
                            <h4>**** **** **** ${pm.card.last4}</h4>
                            <p>${pm.card.brand.toUpperCase()} • Expira ${pm.card.exp_month}/${pm.card.exp_year}</p>
                        </div>
                    </div>
                    <div class="payment-method-actions">
                        <button class="btn btn-outline btn-sm" onclick="window.billingManager.editPaymentMethod('${pm.id}')">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="window.billingManager.removePaymentMethod('${pm.id}')">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        paymentMethodsSection.innerHTML = `
            <div class="billing-card">
                <div class="card-header">
                    <h3>
                        <i class="fas fa-credit-card"></i>
                        Métodos de Pago
                    </h3>
                    <button class="btn btn-primary btn-sm" onclick="window.billingManager.addPaymentMethod()">
                        <i class="fas fa-plus"></i>
                        Agregar
                    </button>
                </div>
                <div class="card-body">
                    <div class="payment-methods-list">
                        ${paymentMethodsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    // Obtener ícono de la tarjeta
    getCardIcon(brand) {
        const icons = {
            'visa': 'fab fa-cc-visa',
            'mastercard': 'fab fa-cc-mastercard',
            'amex': 'fab fa-cc-amex',
            'discover': 'fab fa-cc-discover',
            'diners': 'fab fa-cc-diners-club',
            'jcb': 'fab fa-cc-jcb',
            'unionpay': 'fab fa-cc-unionpay'
        };
        return icons[brand] || 'fas fa-credit-card';
    }

    // Formatear fecha
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Métodos de acción (simulados)
    manageSubscription(subscriptionId) {
        console.log('🔧 Gestionando suscripción:', subscriptionId);
        this.showNotification('Funcionalidad de gestión de suscripción en desarrollo', 'info');
    }

    downloadInvoice(invoiceId) {
        console.log('📥 Descargando factura:', invoiceId);
        this.showNotification('Descarga de factura en desarrollo', 'info');
    }

    payInvoice(invoiceId) {
        console.log('💳 Pagando factura:', invoiceId);
        this.showNotification('Proceso de pago en desarrollo', 'info');
    }

    addPaymentMethod() {
        console.log('➕ Agregando método de pago');
        this.showNotification('Funcionalidad de agregar método de pago en desarrollo', 'info');
    }

    editPaymentMethod(paymentMethodId) {
        console.log('✏️ Editando método de pago:', paymentMethodId);
        this.showNotification('Funcionalidad de edición en desarrollo', 'info');
    }

    removePaymentMethod(paymentMethodId) {
        console.log('🗑️ Eliminando método de pago:', paymentMethodId);
        if (confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
            this.showNotification('Método de pago eliminado', 'success');
        }
    }

    // Mostrar mensaje de error
    showErrorMessage(message) {
        const errorSection = document.getElementById('billingContent');
        if (errorSection) {
            errorSection.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.billingManager.loadBillingData()">
                        <i class="fas fa-refresh"></i>
                        Reintentar
                    </button>
                </div>
            `;
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        if (window.dashboard && window.dashboard.showNotification) {
            window.dashboard.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Hacer disponible globalmente
window.BillingManager = BillingManager;






