class UserMenuManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateUserInfo();
    }

    setupEventListeners() {
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');
        const dropdownItems = document.querySelectorAll('.dropdown-item');

        if (!userInfo || !userDropdown) {
            console.warn('⚠️ Elementos del menú de usuario no encontrados');
            return;
        }

        // Toggle del menú al hacer clic en el usuario
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!userInfo.contains(e.target) && !userDropdown.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Manejar acciones de los items del menú
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const action = item.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Cerrar menú con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
            }
        });
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');

        if (!userInfo || !userDropdown) return;

        userInfo.classList.add('active');
        userDropdown.style.display = 'block';
        this.isOpen = true;

        // Animar la aparición
        setTimeout(() => {
            userDropdown.style.opacity = '1';
            userDropdown.style.transform = 'translateY(0)';
        }, 10);
    }

    closeDropdown() {
        const userInfo = document.getElementById('userInfo');
        const userDropdown = document.getElementById('userDropdown');

        if (!userInfo || !userDropdown) return;

        userInfo.classList.remove('active');
        userDropdown.style.opacity = '0';
        userDropdown.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            userDropdown.style.display = 'none';
        }, 300);

        this.isOpen = false;
    }

    handleMenuAction(action) {
        this.closeDropdown();

        switch (action) {
            case 'profile':
                this.openProfile();
                break;
            case 'billing':
                this.openBilling();
                break;
            case 'tokens':
                this.openTokens();
                break;
            case 'support':
                this.openSupport();
                break;
            case 'logout':
                this.logout();
                break;
            default:
                console.warn('Acción no reconocida:', action);
        }
    }

    openProfile() {
        console.log('🔍 Abriendo perfil...');
        
        // Usar el sistema de navegación del dashboard
        this.updateNavigation('profile');
        
        // Si el ProfileManager está disponible, inicializar el tab de perfil
        setTimeout(() => {
            if (window.profileManager) {
                window.profileManager.switchTab('profile-info');
            }
        }, 100);
    }

    openBilling() {
        console.log('💳 Abriendo facturación...');
        
        // Usar el sistema de navegación del dashboard
        this.updateNavigation('profile');
        
        // Si el ProfileManager está disponible, inicializar el tab de facturación
        setTimeout(() => {
            if (window.profileManager) {
                window.profileManager.switchTab('billing');
                
                // Inicializar BillingManager si no está inicializado
                if (!window.billingManager) {
                    console.log('🔄 Inicializando BillingManager...');
                    window.billingManager = new BillingManager();
                }
            }
        }, 100);
    }

    openTokens() {
        console.log('🪙 Abriendo tokens consumidos...');
        
        // Usar el sistema de navegación del dashboard
        this.updateNavigation('overview');
    }

    openSupport() {
        console.log('🆘 Abriendo soporte técnico...');
        this.showSupportModal();
    }

    showSupportModal() {
        const user = window.authService ? window.authService.getCurrentUser() : null;
        const userEmail = user ? user.email : '';
        const userName = user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : 'Usuario';

        // Crear modal de soporte
        const modal = document.createElement('div');
        modal.className = 'support-modal';
        modal.innerHTML = `
            <div class="modal-content support-modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-life-ring"></i>
                        Soporte Técnico
                    </h3>
                    <button class="modal-close" id="closeSupportModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="supportForm" class="support-form">
                        <div class="form-group">
                            <label for="supportName">Nombre</label>
                            <input 
                                type="text" 
                                id="supportName" 
                                name="name" 
                                class="form-input" 
                                value="${userName}"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="supportEmail">Email</label>
                            <input 
                                type="email" 
                                id="supportEmail" 
                                name="email" 
                                class="form-input" 
                                value="${userEmail}"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="supportCategory">Tipo de Problema</label>
                            <select id="supportCategory" name="category" class="form-input" required>
                                <option value="">Selecciona una categoría</option>
                                <option value="technical">Problema Técnico</option>
                                <option value="billing">Facturación</option>
                                <option value="account">Cuenta de Usuario</option>
                                <option value="chatbot">Funcionamiento del Chatbot</option>
                                <option value="agents">Agentes IA</option>
                                <option value="integrations">Integraciones</option>
                                <option value="performance">Rendimiento</option>
                                <option value="feature">Solicitud de Función</option>
                                <option value="other">Otro</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="supportSubject">Asunto</label>
                            <input 
                                type="text" 
                                id="supportSubject" 
                                name="subject" 
                                class="form-input" 
                                placeholder="Describe brevemente el problema"
                                required
                            >
                        </div>

                        <div class="form-group">
                            <label for="supportMessage">Descripción del Problema</label>
                            <textarea 
                                id="supportMessage" 
                                name="message" 
                                class="form-textarea" 
                                rows="5"
                                placeholder="Describe detalladamente tu problema o pregunta..."
                                required
                            ></textarea>
                        </div>

                        <div class="form-group">
                            <label for="supportAttachment">
                                <i class="fas fa-paperclip"></i>
                                Adjuntar Imagen (opcional)
                            </label>
                            <input 
                                type="file" 
                                id="supportAttachment" 
                                name="attachment" 
                                class="form-file-input"
                                accept="image/*"
                            >
                            <div class="file-upload-info">
                                <i class="fas fa-info-circle"></i>
                                Formatos aceptados: JPG, PNG, GIF (Máx. 5MB)
                            </div>
                            <div id="filePreview" class="file-preview"></div>
                        </div>

                        <div class="support-info">
                            <i class="fas fa-envelope"></i>
                            Tu solicitud será enviada a: <strong>soporte@konsul.digital</strong>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" id="cancelSupportBtn">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" id="submitSupportBtn">
                                <i class="fas fa-paper-plane"></i>
                                Enviar Solicitud
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        this.setupSupportModalListeners(modal);
    }

    setupSupportModalListeners(modal) {
        const closeBtn = modal.querySelector('#closeSupportModal');
        const cancelBtn = modal.querySelector('#cancelSupportBtn');
        const supportForm = modal.querySelector('#supportForm');
        const fileInput = modal.querySelector('#supportAttachment');
        const filePreview = modal.querySelector('#filePreview');

        // Cerrar modal
        const closeModal = () => {
            modal.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Preview de imagen
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('El archivo es demasiado grande. Máximo 5MB.');
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    filePreview.innerHTML = `
                        <div class="preview-container">
                            <img src="${event.target.result}" alt="Preview">
                            <button type="button" class="remove-preview" onclick="this.closest('.preview-container').remove(); document.getElementById('supportAttachment').value = '';">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            }
        });

        // Enviar formulario
        supportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSupportSubmit(supportForm, modal);
        });
    }

    async handleSupportSubmit(form, modal) {
        const submitBtn = form.querySelector('#submitSupportBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            const formData = new FormData(form);
            const user = window.authService ? window.authService.getCurrentUser() : null;
            
            // Preparar datos para envío
            const supportData = {
                name: formData.get('name'),
                email: formData.get('email'),
                category: formData.get('category'),
                subject: formData.get('subject'),
                message: formData.get('message'),
                attachment: formData.get('attachment'),
                userId: user ? user.id : 'N/A',
                userName: user ? (user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()) : 'Usuario',
                userEmail: user ? user.email : formData.get('email'),
                timestamp: new Date().toISOString()
            };

            // Simular envío de correo (en producción, esto iría a un backend real)
            console.log('📧 Enviando solicitud de soporte:', supportData);
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mostrar mensaje de éxito
            this.showSuccessMessage();
            
            // Cerrar modal
            modal.remove();

        } catch (error) {
            console.error('Error enviando solicitud:', error);
            alert('Hubo un error al enviar tu solicitud. Por favor, intenta de nuevo o contacta directamente a soporte@konsul.digital');
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    showSuccessMessage() {
        const notification = document.createElement('div');
        notification.className = 'notification notification-success support-success';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>¡Solicitud Enviada!</strong>
                    <p>Tu mensaje ha sido enviado a soporte@konsul.digital. Te responderemos pronto.</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Permitir cerrar manualmente
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    async logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('🚪 Cerrando sesión...');
            
            try {
                if (window.authService) {
                    await window.authService.logout();
                }
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Error en logout:', error);
                // Redirigir de todas formas
                window.location.href = 'login.html';
            }
        }
    }

    updateNavigation(activeSection) {
        console.log('🧭 Actualizando navegación a:', activeSection);
        
        // Usar el sistema de navegación del dashboard
        if (window.dashboard && window.dashboard.navigateToSection) {
            console.log('✅ Usando sistema de navegación del dashboard');
            window.dashboard.navigateToSection(activeSection);
        } else {
            console.log('⚠️ Dashboard no disponible, usando fallback');
            // Fallback: actualizar navegación manualmente
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.classList.remove('active');
                
                const href = item.querySelector('a')?.getAttribute('href');
                if (href === `#${activeSection}`) {
                    item.classList.add('active');
                }
            });
            
            // Actualizar secciones de contenido
            document.querySelectorAll('.content-section').forEach(sec => {
                sec.classList.remove('active');
            });
            const targetSection = document.getElementById(activeSection);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        }
    }

    updateUserInfo() {
        // Actualizar información del usuario si está autenticado
        if (window.authService && window.authService.isAuthenticated()) {
            const user = window.authService.getCurrentUser();
            
            if (user) {
                console.log('👤 Actualizando info de usuario:', user);
                
                // Actualizar nombre en el header
                const userName = document.getElementById('userName');
                if (userName) {
                    // Usar el nombre completo o el primer nombre, lo que esté disponible
                    const displayName = user.name || user.firstName || 'Usuario';
                    userName.textContent = displayName;
                    console.log('✅ Nombre actualizado en header:', displayName);
                }

                // Actualizar información en el dropdown
                const userFullName = document.getElementById('userFullName');
                const userEmail = document.getElementById('userEmail');
                
                if (userFullName) {
                    // Priorizar el nombre completo de Airtable
                    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
                    userFullName.textContent = fullName || 'Usuario';
                    console.log('✅ Nombre completo actualizado en dropdown:', fullName);
                }
                
                if (userEmail) {
                    userEmail.textContent = user.email || 'usuario@ejemplo.com';
                    console.log('✅ Email actualizado:', user.email);
                }

                // Actualizar avatar con iniciales si no hay imagen
                this.updateUserAvatar(user);
            }
        }
    }

    updateUserAvatar(user) {
        const avatarElements = document.querySelectorAll('.user-avatar, .user-avatar-large');
        
        avatarElements.forEach(avatar => {
            if (user.avatar || user.profileImage) {
                // Si hay imagen de avatar, mostrarla
                const avatarUrl = user.avatar || user.profileImage;
                avatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                // Si no hay imagen, mostrar iniciales
                const initials = this.getUserInitials(user);
                avatar.innerHTML = `<span style="font-weight: 600;">${initials}</span>`;
            }
        });
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

    showComingSoonModal(title, message) {
        // Crear modal simple
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 2rem;">
                        <i class="fas fa-tools" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;"></i>
                        <p>${message}</p>
                        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 1rem;">
                            Estamos trabajando en esta funcionalidad. ¡Pronto estará disponible!
                        </p>
                    </div>
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

        // Cerrar con tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.userMenuManager = new UserMenuManager();
});
