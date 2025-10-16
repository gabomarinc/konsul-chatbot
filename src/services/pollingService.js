/**
 * PollingService - Maneja el polling de chats y mensajes
 */
class PollingService {
    constructor(dataService, notificationService) {
        this.dataService = dataService;
        this.notificationService = notificationService;
        this.pollingInterval = null;
        this.pollingFrequency = 10000; // 10 segundos
        this.lastKnownChats = new Map(); // chatId -> { lastMessageTime, messageCount }
        this.isPolling = false;
        this.currentChatId = null;

        console.log('✅ PollingService inicializado');
    }

    /**
     * Inicia el polling
     */
    async startPolling() {
        if (this.isPolling) {
            console.log('⚠️ Polling ya está activo');
            return;
        }

        console.log('🔄 Iniciando polling cada', this.pollingFrequency / 1000, 'segundos');
        this.isPolling = true;

        // Cargar estado inicial sin notificaciones
        await this.loadInitialState();

        // Configurar intervalo de polling
        this.pollingInterval = setInterval(() => {
            this.checkForUpdates();
        }, this.pollingFrequency);
    }

    /**
     * Carga el estado inicial sin mostrar notificaciones
     */
    async loadInitialState() {
        try {
            console.log('📥 Cargando estado inicial de chats...');
            
            const result = await this.dataService.getChats();
            
            if (result.success && result.data) {
                // Guardar estado inicial sin notificar
                result.data.forEach(chat => {
                    this.lastKnownChats.set(chat.id, {
                        lastMessageTime: this.getLastMessageTime(chat),
                        messageCount: chat.messages ? chat.messages.length : 0
                    });
                });
                
                console.log('✅ Estado inicial cargado:', this.lastKnownChats.size, 'chats');
            }
        } catch (error) {
            console.error('❌ Error cargando estado inicial:', error);
        }
    }

    /**
     * Detiene el polling
     */
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            this.isPolling = false;
            console.log('🛑 Polling detenido');
        }
    }

    /**
     * Establece el chat actual
     */
    setCurrentChat(chatId) {
        this.currentChatId = chatId;
    }

    /**
     * Verifica si hay actualizaciones
     */
    async checkForUpdates() {
        try {
            // Forzar obtención de datos frescos sin cache
            const result = await this.dataService.getChatsFresh();
            
            if (!result.success || !result.data) {
                console.log('⚠️ No se pudieron obtener chats para polling');
                return;
            }

            const currentChats = result.data;
            const newChats = [];
            const chatsWithNewMessages = [];

            // Verificar cada chat
            for (const chat of currentChats) {
                const chatId = chat.id;
                
                if (!chatId) {
                    console.warn('⚠️ Chat sin ID, saltando:', chat);
                    continue;
                }
                
                const lastKnown = this.lastKnownChats.get(chatId);

                // Nuevo chat detectado
                if (!lastKnown) {
                    console.log('🆕 Nuevo chat detectado:', chat.name || chat.userName);
                    newChats.push(chat);

                    // Guardar información del chat
                    this.lastKnownChats.set(chatId, {
                        lastMessageTime: this.getLastMessageTime(chat),
                        messageCount: chat.messages ? chat.messages.length : 0
                    });
                    continue;
                }

                // Verificar nuevos mensajes en chat existente
                const currentLastMessageTime = this.getLastMessageTime(chat);
                const currentMessageCount = chat.messages ? chat.messages.length : 0;

                if (currentLastMessageTime > lastKnown.lastMessageTime || 
                    currentMessageCount > lastKnown.messageCount) {
                    
                    const newMessagesCount = currentMessageCount - lastKnown.messageCount;
                    
                    chatsWithNewMessages.push({
                        chat,
                        newMessagesCount: Math.max(1, newMessagesCount)
                    });

                    // Actualizar información del chat
                    this.lastKnownChats.set(chatId, {
                        lastMessageTime: currentLastMessageTime,
                        messageCount: currentMessageCount
                    });
                }
            }

            // Emitir eventos si hay cambios
            if (newChats.length > 0) {
                console.log(`🆕 ${newChats.length} nuevos chats detectados`);
                window.dispatchEvent(new CustomEvent('newChatsDetected', {
                    detail: { newChats, allChats: currentChats }
                }));
            }

            if (chatsWithNewMessages.length > 0) {
                console.log(`💬 ${chatsWithNewMessages.length} chats con nuevos mensajes`);
                window.dispatchEvent(new CustomEvent('newMessagesDetected', {
                    detail: { chatsWithNewMessages }
                }));
            }

            // NO refrescar el chat actual automáticamente para evitar cargas constantes
            // El usuario verá los mensajes cuando haga scroll o recargue manualmente

        } catch (error) {
            console.error('❌ Error en polling:', error);
        }
    }

    /**
     * Obtiene el timestamp del último mensaje
     */
    getLastMessageTime(chat) {
        if (!chat.messages || chat.messages.length === 0) {
            return 0;
        }

        const lastMessage = chat.messages[chat.messages.length - 1];
        const timestamp = lastMessage.time || lastMessage.timestamp;
        
        if (!timestamp) return 0;

        // Convertir a timestamp numérico
        return new Date(timestamp).getTime();
    }

    /**
     * Refresca el chat actual
     */
    async refreshCurrentChat() {
        if (!this.currentChatId) {
            console.log('⚠️ No hay chat actual para refrescar');
            return;
        }

        try {
            console.log('🔄 Refrescando chat actual:', this.currentChatId);
            
            // Validar que el chatId no sea undefined
            if (this.currentChatId === 'undefined' || this.currentChatId === undefined) {
                console.error('❌ ChatId inválido:', this.currentChatId);
                return;
            }
            
            // Obtener mensajes actualizados
            const result = await this.dataService.getAllChatMessages(this.currentChatId);
            
            if (result.success && result.data) {
                window.dispatchEvent(new CustomEvent('chatRefreshed', {
                    detail: {
                        chatId: this.currentChatId,
                        messages: result.data
                    }
                }));
            }
        } catch (error) {
            console.error('❌ Error refrescando chat:', error);
        }
    }

    /**
     * Cambia la frecuencia de polling
     */
    setPollingFrequency(milliseconds) {
        this.pollingFrequency = milliseconds;
        
        if (this.isPolling) {
            this.stopPolling();
            this.startPolling();
        }
    }

    /**
     * Limpia el estado del polling
     */
    clear() {
        this.lastKnownChats.clear();
        this.currentChatId = null;
    }
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PollingService;
}
