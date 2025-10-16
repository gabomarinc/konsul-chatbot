// Data Service - Unified interface for data management
class DataService {
    constructor(api) {
        this.api = api;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.pendingRequests = new Map(); // Para evitar llamados duplicados
        
        // Verificar que la API esté disponible
        if (!this.api) {
            console.error('❌ DataService: No se proporcionó una instancia de API');
        } else {
            console.log('✅ DataService inicializado con API:', typeof this.api);
        }
    }

    // Cache management
    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    // Evitar llamados duplicados
    async getOrFetch(key, fetchFunction) {
        // Verificar cache primero
        const cached = this.getFromCache(key);
        if (cached) {
            // Solo log en modo debug
            // console.log(`📋 Cache hit para ${key}`);
            return cached;
        }

        // Verificar si ya hay una petición en curso
        if (this.pendingRequests.has(key)) {
            console.log(`⏳ Esperando petición en curso para ${key}`);
            return await this.pendingRequests.get(key);
        }

        // Crear nueva petición
        console.log(`🔄 Iniciando petición para ${key}`);
        const promise = fetchFunction();
        this.pendingRequests.set(key, promise);

        try {
            const result = await promise;
            this.setCache(key, result);
            return result;
        } finally {
            this.pendingRequests.delete(key);
        }
    }

    // Clear cache
    clearCache(key) {
        if (key) {
            // Limpiar cache específico
            const cacheKeys = Array.from(this.cache.keys()).filter(k => k.startsWith(key));
            cacheKeys.forEach(k => this.cache.delete(k));
            if (cacheKeys.length > 0) {
                console.log(`🧹 Cache limpiado para: ${key} (${cacheKeys.length} entradas)`);
            }
        } else {
            // Limpiar todo el cache
            this.cache.clear();
            console.log('🧹 Todo el cache limpiado');
        }
    }

    // API Health
    async getApiHealth() {
        try {
            console.log('🔍 Verificando salud de la API...');
            const result = await this.api.getApiHealth();
            console.log('📊 Estado de API:', result.success ? 'Online' : 'Offline');
            return result;
        } catch (error) {
            console.error('❌ Error verificando salud de API:', error);
            return { success: false, error: error.message };
        }
    }

    // Workspaces
    async getWorkspaces() {
        return await this.getOrFetch('workspaces', async () => {
            console.log('🏢 Obteniendo workspaces...');
            const result = await this.api.getWorkspaces();
            console.log(`✅ ${result.success ? result.data.length : 0} workspaces obtenidos`);
            return result;
        });
    }

    // Workspace credits
    async getWorkspaceCredits(workspaceId) {
        try {
            console.log(`💰 Obteniendo créditos del workspace: ${workspaceId}`);
            const result = await this.api.getWorkspaceCredits(workspaceId);
            if (result.success) {
                console.log(`✅ Créditos obtenidos: ${result.data.credits} (Status: ${result.data.status})`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo créditos del workspace:', error);
            return { success: false, error: error.message };
        }
    }

    // Chats
    async getChats(options = {}) {
        const cacheKey = `chats_${JSON.stringify(options)}`;
        return await this.getOrFetch(cacheKey, async () => {
            console.log('💬 Obteniendo chats...');
            const result = await this.api.getChats(options);
            console.log(`✅ ${result.data.length} chats obtenidos (fuente: ${result.source || 'api'})`);
            return result;
        });
    }

    // Get all chats with pagination
    async getAllChats(options = {}) {
        const cacheKey = `all_chats_${JSON.stringify(options)}`;
        return await this.getOrFetch(cacheKey, async () => {
            console.log('📄 Obteniendo todos los chats con paginación...');
            const result = await this.api.getAllChats(options);
            console.log(`✅ ${result.totalChats} chats obtenidos en ${result.totalPages} páginas (fuente: ${result.source || 'api'})`);
            return result;
        });
    }

    async getChatsFresh(options = {}) {
        try {
            // Obtener chats sin cache, directamente de la API
            const result = await this.api.getChats(options);
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo chats frescos:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    async getChatMessages(chatId, options = {}) {
        try {
            console.log(`💬 Obteniendo mensajes del chat: ${chatId}`);
            const result = await this.api.getChatMessages(chatId, options);
            console.log(`✅ ${result.success ? result.data.length : 0} mensajes obtenidos`);
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo mensajes del chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Get ALL chat messages with pagination
    async getAllChatMessages(chatId, options = {}) {
        try {
            console.log(`💬 Obteniendo TODOS los mensajes del chat: ${chatId}`);
            
            // Método 1: Intentar método principal con paginación robusta
            console.log('🔄 Intentando método principal con paginación robusta...');
            let result = await this.api.getAllChatMessages(chatId, options);
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`✅ Método principal: ${result.data.length} mensajes obtenidos (total: ${result.total}) con estrategia: ${result.strategy}`);
                return result;
            }
            
            // Método 2: Intentar método alternativo con diferentes estrategias
            console.log('🔄 Método principal falló, intentando método alternativo...');
            result = await this.api.getAllChatMessagesAlternative(chatId, options);
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`✅ Método alternativo: ${result.data.length} mensajes obtenidos (total: ${result.total}) con estrategia: ${result.strategy}`);
                return result;
            }
            
            // Método 3: Intentar diferentes endpoints
            console.log('🔄 Método alternativo falló, intentando diferentes endpoints...');
            result = await this.api.getAllChatMessagesWithEndpoints(chatId, options);
            
            if (result.success && result.data && result.data.length > 0) {
                console.log(`✅ Método endpoints: ${result.data.length} mensajes obtenidos (total: ${result.total}) con endpoint: ${result.endpoint} y estrategia: ${result.strategy}`);
                return result;
            }
            
            // Si todos los métodos fallan, devolver error
            console.log('❌ Todos los métodos fallaron');
            return { success: false, error: 'No se pudieron obtener mensajes con ningún método' };
            
        } catch (error) {
            console.error('❌ Error obteniendo todos los mensajes del chat:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteChat(chatId) {
        try {
            console.log(`🗑️ Eliminando chat: ${chatId}`);
            const result = await this.api.deleteChat(chatId);
            if (result.success) {
                console.log(`✅ Chat ${chatId} eliminado exitosamente`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error eliminando chat:', error);
            return { success: false, error: error.message };
        }
    }

    async sendMessage(chatId, message) {
        try {
            console.log(`📤 Enviando mensaje al chat: ${chatId}`);
            const result = await this.api.sendMessage(chatId, message);
            if (result.success) {
                console.log(`✅ Mensaje enviado al chat ${chatId}`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    async assumeChat(chatId) {
        try {
            console.log(`👤 Asumiendo chat: ${chatId}`);
            const result = await this.api.startHumanTakeover(chatId);
            if (result.success) {
                console.log(`✅ Chat ${chatId} asumido exitosamente`);
                // Limpiar cache para refrescar la lista
                this.clearCache('chats');
            }
            return result;
        } catch (error) {
            console.error('❌ Error asumiendo chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Agents
    async getAgents() {
        return await this.getOrFetch('agents', async () => {
            console.log('🤖 Obteniendo agentes...');
            const result = await this.api.getAgents();
            console.log(`✅ ${result.data.length} agentes obtenidos (fuente: ${result.source || 'api'})`);
            return result;
        });
    }

    async getAgentCredits(agentId, year = new Date().getFullYear()) {
        try {
            console.log(`💰 Obteniendo créditos del agente: ${agentId}`);
            const result = await this.api.getAgentCredits(agentId, year);
            if (result.success) {
                console.log(`✅ Créditos obtenidos para agente ${agentId}: ${result.data.total || 0}`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo créditos del agente:', error);
            return { success: false, error: error.message };
        }
    }

    // Channels
    async getChannels(agentId, options = {}) {
        try {
            console.log(`📱 Obteniendo canales del agente: ${agentId}`);
            const result = await this.api.getChannels(agentId, options);
            if (result.success) {
                console.log(`✅ ${result.data.length} canales obtenidos (fuente: ${result.source || 'api'})`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo canales:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Get all channels from all agents in workspace
    async getAllChannels() {
        try {
            console.log(`📱 Obteniendo todos los canales del workspace...`);
            
            // Obtener todos los agentes
            const agentsResult = await this.getAgents();
            
            if (!agentsResult.success || !agentsResult.data || agentsResult.data.length === 0) {
                console.log('⚠️ No hay agentes disponibles para obtener canales');
                return { success: true, data: [], count: 0 };
            }
            
            // Obtener canales de cada agente
            const channelsPromises = agentsResult.data.map(agent => 
                this.getChannels(agent.id)
            );
            
            const channelsResults = await Promise.all(channelsPromises);
            
            // Consolidar todos los canales
            const allChannels = [];
            channelsResults.forEach((result, index) => {
                if (result.success && result.data) {
                    const agent = agentsResult.data[index];
                    result.data.forEach(channel => {
                        allChannels.push({
                            ...channel,
                            agentId: agent.id,
                            agentName: agent.name
                        });
                    });
                }
            });
            
            console.log(`✅ Total de canales en el workspace: ${allChannels.length}`);
            
            return {
                success: true,
                data: allChannels,
                count: allChannels.length
            };
        } catch (error) {
            console.error('❌ Error obteniendo todos los canales:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Team
    async getTeamMembers() {
        return await this.getOrFetch('team', async () => {
            console.log('👥 Obteniendo miembros del equipo...');
            const result = await this.api.getTeamMembers();
            console.log(`✅ ${result.data.length} miembros del equipo obtenidos (fuente: ${result.source || 'api'})`);
            return result;
        });
    }

    // Interactions/Attendances
    async getInteractions(options = {}) {
        const cacheKey = `interactions_${JSON.stringify(options)}`;
        return await this.getOrFetch(cacheKey, async () => {
            console.log('📞 Obteniendo interacciones...');
            const result = await this.api.getInteractions(options);
            console.log(`✅ ${result.data.length} interacciones obtenidas (fuente: ${result.source || 'api'})`);
            return result;
        });
    }

    // Delete chat
    async deleteChat(chatId) {
        try {
            console.log('🗑️ Eliminando chat desde DataService...');
            const result = await this.api.deleteChat(chatId);
            
            if (result.success) {
                // Limpiar cache de chats para forzar recarga
                this.clearCache('chats');
                console.log('✅ Chat eliminado y cache limpiado');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error eliminando chat desde DataService:', error);
            return { success: false, error: error.message };
        }
    }

    // Stats
    async getStats() {
        try {
            console.log('📊 Obteniendo estadísticas...');
            
            // Obtener datos para calcular estadísticas
            const [chatsResult, agentsResult, teamResult] = await Promise.all([
                this.getChats(),
                this.getAgents(),
                this.getTeamMembers()
            ]);

            const stats = {
                totalChats: chatsResult.success ? chatsResult.data.length : 0,
                totalAgents: agentsResult.success ? agentsResult.data.length : 0,
                totalTeamMembers: teamResult.success ? teamResult.data.length : 0,
                activeChats: chatsResult.success ? chatsResult.data.filter(chat => chat.status === 'active').length : 0,
                uniqueUsers: chatsResult.success ? new Set(chatsResult.data.map(chat => chat.user)).size : 0,
                totalTokens: this.calculateTotalTokens(chatsResult.data || []),
                lastUpdated: new Date().toISOString()
            };

            console.log('✅ Estadísticas calculadas:', stats);
            return { success: true, data: stats };
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return { success: false, error: error.message };
        }
    }

    calculateTotalTokens(chats) {
        let totalTokens = 0;
        chats.forEach(chat => {
            if (chat.messages) {
                chat.messages.forEach(message => {
                    // Estimación aproximada: 1 token = 4 caracteres
                    totalTokens += Math.ceil(message.content.length / 4);
                });
            }
        });
        return totalTokens;
    }

    // Agent Trainings
    async getAgentTrainings(agentId, options = {}) {
        try {
            console.log(`📚 Obteniendo entrenamientos del agente: ${agentId}`);
            const result = await this.api.getAgentTrainings(agentId, options);
            if (result.success) {
                console.log(`✅ ${result.data.length} entrenamientos obtenidos (fuente: ${result.source || 'api'})`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo entrenamientos:', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Dashboard data
    async getDashboardData() {
        try {
            console.log('📊 Obteniendo datos completos del dashboard...');
            
            const [chatsResult, agentsResult, teamResult, statsResult, interactionsResult] = await Promise.all([
                this.getChats(),
                this.getAgents(),
                this.getTeamMembers(),
                this.getStats(),
                this.getInteractions()
            ]);

            const dashboardData = {
                chats: chatsResult.success ? chatsResult.data : [],
                agents: agentsResult.success ? agentsResult.data : [],
                team: teamResult.success ? teamResult.data : [],
                stats: statsResult.success ? statsResult.data : {},
                interactions: interactionsResult.success ? interactionsResult.data : [],
                apiHealth: true,
                lastSync: new Date().toISOString()
            };

            console.log('✅ Datos del dashboard obtenidos:', {
                chats: dashboardData.chats.length,
                agents: dashboardData.agents.length,
                team: dashboardData.team.length,
                interactions: dashboardData.interactions.length,
                apiHealth: dashboardData.apiHealth
            });

            return { success: true, data: dashboardData };
        } catch (error) {
            console.error('❌ Error obteniendo datos del dashboard:', error);
            return { success: false, error: error.message };
        }
    }

    async getAgentIntentions(agentId, options = {}) {
        try {
            console.log(`🎯 Obteniendo intenciones del agente: ${agentId}`);
            const result = await this.api.getAgentIntentions(agentId, options);
            if (result.success) {
                console.log(`✅ ${result.data.length} intenciones obtenidas (fuente: ${result.source || 'api'})`);
            }
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo intenciones:', error);
            return { success: false, error: error.message, data: [] };
        }
    }
}