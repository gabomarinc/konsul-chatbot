class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Verificar que authService esté disponible
        if (!window.authService) {
            console.error('❌ AuthService no disponible');
            window.location.href = 'login.html';
            return;
        }

        // Forzar recarga de datos de autenticación
        window.authService.loadAuthData();
        
        // Verificar autenticación
        if (!window.authService.isAuthenticated()) {
            console.log('❌ Usuario no autenticado, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        this.currentUser = window.authService.getCurrentUser();
        console.log('✅ Usuario autenticado:', this.currentUser);
        
        // Solo verificar que tenga email (no ID, porque lo buscaremos después)
        if (!this.currentUser || !this.currentUser.email) {
            console.error('❌ Usuario sin email, redirigiendo a login...');
            window.location.href = 'login.html';
            return;
        }

        // Inicializar interfaz
        this.setupEventListeners();
        this.loadProfileData();
        this.loadBillingData();
    }

    setupEventListeners() {
        // Navegación entre tabs
        document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Formulario de perfil
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Formulario de contraseña
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Botón de actualizar método de pago
        const updatePaymentBtn = document.getElementById('updatePaymentBtn');
        if (updatePaymentBtn) {
            updatePaymentBtn.addEventListener('click', () => {
                this.showUpdatePaymentModal();
            });
        }

        // Botón de ver todas las facturas
        const viewAllInvoicesBtn = document.getElementById('viewAllInvoicesBtn');
        if (viewAllInvoicesBtn) {
            viewAllInvoicesBtn.addEventListener('click', () => {
                this.showAllInvoices();
            });
        }
    }

    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.profile-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Cargar datos específicos del tab
        switch (tabName) {
            case 'profile-info':
                this.loadProfileData();
                break;
            case 'security':
                this.clearPasswordForm();
                break;
            case 'billing':
                this.loadBillingData();
                break;
        }
    }

    loadProfileData() {
        if (!this.currentUser) return;

        console.log('📝 Cargando datos de perfil:', this.currentUser);

        // Si el usuario tiene un nombre completo de Airtable, separarlo
        let firstName = this.currentUser.firstName || '';
        let lastName = this.currentUser.lastName || '';
        
        if (!firstName && this.currentUser.name) {
            const nameParts = this.currentUser.name.trim().split(' ');
            firstName = nameParts[0] || '';
            lastName = nameParts.slice(1).join(' ') || '';
        }

        // Llenar campos del formulario
        const fields = {
            firstName: firstName,
            lastName: lastName,
            email: this.currentUser.email || '',
            company: this.currentUser.company || ''
        };

        console.log('📊 Campos a llenar:', fields);

        Object.entries(fields).forEach(([fieldName, value]) => {
            const input = document.getElementById(fieldName);
            if (input) {
                input.value = value;
                console.log(`✅ Campo ${fieldName} llenado con:`, value);
            } else {
                console.warn(`⚠️ No se encontró el campo:`, fieldName);
            }
        });

        // Actualizar header del perfil
        this.updateProfileHeader();
    }

    updateProfileHeader() {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profileRole = document.getElementById('profileRole');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');

        if (profileName) {
            // Priorizar el nombre completo de Airtable
            const fullName = this.currentUser.name || `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim();
            profileName.textContent = fullName || 'Usuario';
            console.log('✅ Nombre en header del perfil:', fullName);
        }

        if (profileEmail) {
            profileEmail.textContent = this.currentUser.email || '';
        }

        if (profileRole) {
            const roleText = this.currentUser.role === 'admin' ? 'Administrador' : 'Usuario';
            profileRole.textContent = roleText;
        }

        if (avatarPlaceholder) {
            const initials = this.getUserInitials(this.currentUser);
            avatarPlaceholder.textContent = initials;
        }
    }

    getUserInitials(user) {
        // Si hay nombre completo, separarlo
        if (user.name) {
            const nameParts = user.name.trim().split(' ');
            const first = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() : '';
            const last = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() : '';
            return (first + last) || 'U';
        }
        
        // Si hay firstName y lastName separados
        const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : '';
        const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
        return (first + last) || 'U';
    }

    async updateProfile() {
        const form = document.getElementById('profileForm');
        const formData = new FormData(form);
        
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        
        const profileData = {
            firstName: firstName,
            lastName: lastName,
            // Crear el nombre completo combinado
            name: `${firstName} ${lastName}`.trim(),
            email: formData.get('email'),
            company: formData.get('company')
        };

        // Validaciones básicas
        if (!profileData.firstName || !profileData.email) {
            this.showNotification('Por favor completa el nombre y email', 'error');
            return;
        }

        if (!this.isValidEmail(profileData.email)) {
            this.showNotification('Por favor ingresa un email válido', 'error');
            return;
        }

        try {
            console.log('📤 Enviando actualización de perfil:', profileData);
            
            const result = await window.authService.updateProfile(profileData);

            if (result.success) {
                // Actualizar copia local desde authService
                this.currentUser = window.authService.getCurrentUser();
                this.updateProfileHeader();
                
                // Actualizar también el menú de usuario
                if (window.userMenuManager) {
                    window.userMenuManager.updateUserInfo();
                }
                
                this.showNotification('Perfil actualizado exitosamente', 'success');
            } else {
                this.showNotification(result.error || 'Error al actualizar perfil', 'error');
            }

        } catch (error) {
            console.error('Error actualizando perfil:', error);
            this.showNotification(error.message || 'Error de conexión', 'error');
        }
    }

    async changePassword() {
        const form = document.getElementById('passwordForm');
        const formData = new FormData(form);
        
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        // Validaciones
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        try {
            const result = await window.authService.changePassword(currentPassword, newPassword);

            if (result.success) {
                this.showNotification('Contraseña cambiada exitosamente', 'success');
                this.clearPasswordForm();
            } else {
                this.showNotification(result.error || 'Error al cambiar contraseña', 'error');
            }

        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            this.showNotification('Error de conexión', 'error');
        }
    }

    clearPasswordForm() {
        const form = document.getElementById('passwordForm');
        if (form) {
            form.reset();
        }
    }

    async loadBillingData() {
        try {
            console.log('💳 Cargando datos de facturación con StripeService...');
            
            // Verificar si el BillingManager está disponible
            if (!window.billingManager) {
                console.log('🔄 Inicializando BillingManager...');
                
                // Verificar que las clases estén disponibles
                if (typeof BillingManager === 'undefined') {
                    console.error('❌ BillingManager no está disponible');
                    this.showNotification('Error: BillingManager no está disponible', 'error');
                    return;
                }
                
                if (typeof StripeService === 'undefined') {
                    console.error('❌ StripeService no está disponible');
                    this.showNotification('Error: StripeService no está disponible', 'error');
                    return;
                }
                
                window.billingManager = new BillingManager();
                await window.billingManager.init();
            }

            // Verificar que los datos se cargaron correctamente
            console.log('📊 Verificando datos cargados...');
            console.log('- Customer Info:', window.billingManager.customerInfo);
            console.log('- Subscriptions:', window.billingManager.subscriptions);
            console.log('- Invoices:', window.billingManager.invoices);
            console.log('- Payment Methods:', window.billingManager.paymentMethods);

            // El BillingManager ya maneja toda la carga de datos y renderizado
            // Solo necesitamos asegurarnos de que esté inicializado
            console.log('✅ Datos de facturación cargados correctamente');

        } catch (error) {
            console.error('Error cargando datos de facturación:', error);
            this.showNotification('Error cargando información de facturación', 'error');
        }
    }

    updateBillingInfo(billing) {
        // Actualizar plan actual
        const currentPlan = document.getElementById('currentPlan');
        const planPrice = document.getElementById('planPrice');
        const planFeatures = document.getElementById('planFeatures');

        if (currentPlan) {
            currentPlan.textContent = billing.plan || 'Plan Pro';
        }

        if (planPrice) {
            planPrice.textContent = billing.price || '$29/mes';
        }

        if (planFeatures && billing.features) {
            planFeatures.innerHTML = billing.features.map(feature => `
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>${feature}</span>
                </div>
            `).join('');
        }

        // Actualizar método de pago
        const paymentInfo = document.querySelector('.payment-info span');
        const cardType = document.querySelector('.card-type');

        if (paymentInfo && billing.paymentMethod) {
            paymentInfo.textContent = billing.paymentMethod.maskedNumber || '**** **** **** 4242';
        }

        if (cardType && billing.paymentMethod) {
            cardType.textContent = billing.paymentMethod.type || 'Visa';
        }
    }

    updateInvoicesList(invoices) {
        const invoicesList = document.getElementById('invoicesList');
        if (!invoicesList) return;

        if (invoices.length === 0) {
            invoicesList.innerHTML = `
                <div class="no-invoices">
                    <i class="fas fa-file-invoice"></i>
                    <p>No hay facturas disponibles</p>
                </div>
            `;
            return;
        }

        invoicesList.innerHTML = invoices.map(invoice => `
            <div class="invoice-item">
                <div class="invoice-info">
                    <div class="invoice-amount">$${invoice.amount}</div>
                    <div class="invoice-date">${this.formatDate(invoice.date)}</div>
                </div>
                <span class="invoice-status ${invoice.status}">${this.getStatusText(invoice.status)}</span>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    getStatusText(status) {
        const statusMap = {
            'paid': 'Pagado',
            'pending': 'Pendiente',
            'failed': 'Fallido'
        };
        return statusMap[status] || status;
    }

    showUpdatePaymentModal() {
        // Crear modal simple para actualizar método de pago
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Actualizar Método de Pago</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Esta funcionalidad está en desarrollo. Por favor contacta al soporte para actualizar tu método de pago.</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showAllInvoices() {
        // Crear modal para mostrar todas las facturas
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Todas las Facturas</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Esta funcionalidad está en desarrollo. Por favor contacta al soporte para ver el historial completo de facturas.</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners para cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            try {
                await window.authService.logout();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error en logout:', error);
                // Redirigir de todas formas
                window.location.href = 'login.html';
            }
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';

        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Permitir cerrar manualmente
        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

