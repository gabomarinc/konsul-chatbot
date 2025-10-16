/**
 * NotificationService - Maneja las notificaciones en la aplicación
 */
class NotificationService {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.init();
    }

    init() {
        // Crear contenedor de notificaciones
        this.container = document.createElement('div');
        this.container.className = 'notifications-container';
        document.body.appendChild(this.container);

        console.log('✅ NotificationService inicializado');
    }

    /**
     * Muestra una notificación
     */
    show(options) {
        const {
            id = Date.now().toString(),
            title,
            body,
            icon = 'fa-comment',
            duration = 5000,
            onClick = null
        } = options;

        // Si ya existe una notificación con este ID, no crear otra
        if (this.notifications.has(id)) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.dataset.notificationId = id;
        notification.style.animation = 'slideInRight 0.3s ease-out';

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-body">${body}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Event listener para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hide(id);
        });

        // Event listener para clic en la notificación
        if (onClick) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', () => {
                onClick();
                this.hide(id);
            });
        }

        // Agregar al contenedor
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Auto-ocultar después de la duración especificada
        if (duration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, duration);
        }

        // Reproducir sonido de notificación (opcional)
        this.playNotificationSound();

        return id;
    }

    /**
     * Oculta una notificación
     */
    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.style.animation = 'slideOutRight 0.3s ease-in';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    /**
     * Muestra notificación de nuevo mensaje
     */
    showNewMessage(chatName, messageText, chatId) {
        const preview = messageText.length > 50 
            ? messageText.substring(0, 50) + '...' 
            : messageText;

        this.show({
            id: `message-${chatId}-${Date.now()}`,
            title: `Nuevo mensaje de ${chatName}`,
            body: preview,
            icon: 'fa-comment',
            duration: 5000,
            onClick: () => {
                window.dispatchEvent(new CustomEvent('openChat', {
                    detail: { chatId }
                }));
            }
        });
    }

    /**
     * Muestra notificación de nuevo chat
     */
    showNewChat(chatName, chatId) {
        this.show({
            id: `chat-${chatId}`,
            title: 'Nuevo chat',
            body: `${chatName} ha iniciado una conversación`,
            icon: 'fa-user-plus',
            duration: 5000,
            onClick: () => {
                window.dispatchEvent(new CustomEvent('openChat', {
                    detail: { chatId }
                }));
            }
        });
    }

    /**
     * Reproduce sonido de notificación (opcional)
     */
    playNotificationSound() {
        try {
            // Crear un beep corto usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silenciar errores de audio
            console.debug('Audio notification not available');
        }
    }

    /**
     * Limpia todas las notificaciones
     */
    clearAll() {
        this.notifications.forEach((notification, id) => {
            this.hide(id);
        });
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationService;
}

