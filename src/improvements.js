// Gestión de sugerencias de mejoras
class ImprovementsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const suggestionForm = document.getElementById('suggestionForm');
        if (suggestionForm) {
            suggestionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSuggestionSubmit(e);
            });
        }
    }

    async handleSuggestionSubmit(event) {
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Obtener datos del formulario
            const formData = new FormData(form);
            const suggestion = formData.get('suggestion');

            // Obtener información del usuario
            const user = window.authService ? window.authService.getCurrentUser() : null;
            const userName = user ? user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Usuario Anónimo';
            const userEmail = user ? user.email : 'No disponible';

            // Validar que haya texto
            if (!suggestion || suggestion.trim().length === 0) {
                this.showNotification('Por favor escribe una sugerencia', 'error');
                return;
            }

            // Mostrar loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            // Preparar datos para envío
            const suggestionData = {
                suggestion: suggestion,
                userName: userName,
                userEmail: userEmail,
                timestamp: new Date().toISOString(),
                subject: `Sugerencia de mejoras del usuario ${userName} del chatbot`
            };

            console.log('📧 Preparando envío de sugerencia:', suggestionData);

            // Crear el enlace mailto
            const subject = encodeURIComponent(suggestionData.subject);
            const body = encodeURIComponent(
                `Sugerencia de Mejora\n\n` +
                `Usuario: ${userName}\n` +
                `Email: ${userEmail}\n` +
                `Fecha: ${new Date().toLocaleString('es-ES')}\n\n` +
                `Sugerencia:\n${suggestion}\n\n` +
                `---\n` +
                `Enviado desde el Dashboard del Chatbot`
            );

            const mailtoLink = `mailto:somos@konsul.digital?subject=${subject}&body=${body}`;

            // Abrir cliente de correo
            window.location.href = mailtoLink;

            // Simular delay para dar tiempo a que se abra el cliente de correo
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mostrar mensaje de éxito
            this.showSuccessNotification();

            // Limpiar formulario
            form.reset();

            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;

        } catch (error) {
            console.error('❌ Error enviando sugerencia:', error);
            this.showNotification('Hubo un error al preparar el envío. Por favor, intenta de nuevo.', 'error');
            
            // Restaurar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification notification-success suggestion-success';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>¡Gracias por tu sugerencia!</strong>
                    <p>Tu cliente de correo se ha abierto. Por favor, envía el mensaje para completar el proceso.</p>
                    <p style="font-size: 0.875rem; margin-top: 0.5rem; opacity: 0.9;">
                        Si no se abrió automáticamente, puedes escribirnos a: <strong>somos@konsul.digital</strong>
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 8 segundos
        setTimeout(() => {
            notification.remove();
        }, 8000);

        // Permitir cerrar manualmente
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    showNotification(message, type = 'info') {
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
    window.improvementsManager = new ImprovementsManager();
    console.log('✅ ImprovementsManager inicializado');
});












