// GPTMaker API Integration
class GPTMakerAPI {
    constructor(token = null) {
        // Usar configuración global si está disponible
        if (window.gptmakerConfig) {
            this.baseURL = window.gptmakerConfig.getBaseURL();
            this.token = token || window.gptmakerConfig.getToken();
        } else {
            // Fallback a configuración manual
            this.baseURL = 'https://api.gptmaker.ai';
            this.token = token || this.getTokenFromStorage() || this.getTokenFromConfig();
        }
        
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        
        console.log('GPTMakerAPI inicializado con baseURL:', this.baseURL);
        console.log('Token configurado:', this.token ? 'Sí' : 'No');
        
        // Validar token si está disponible
        if (this.token && window.gptmakerConfig) {
            const validation = window.gptmakerConfig.validateToken();
            if (!validation.valid) {
                console.warn('⚠️ Token inválido:', validation.error);
            } else {
                console.log('✅ Token válido');
            }
        }
    }

    getTokenFromStorage() {
        return localStorage.getItem('gptmaker_token');
    }

    getTokenFromConfig() {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJncHRtYWtlciIsImlkIjoiM0U2MTZFMDQ2RDI3RTFDQjYyM0JGRTVFOUE2RTlCREUiLCJ0ZW5hbnQiOiIzRTYxNkUwNDZEMjdFMUNCNjIzQkZFNUU5QTZFOUJERSIsInV1aWQiOiJjMDU1NGM1Yy1mYjhiLTQ5YjUtOGRhMy1mZGEzMTc1MGZlZDgifQ.el1Rog4MU6G0UJ8tBzsWhhnecYoZ6n7nUFC-6l1VpJE';
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('gptmaker_token', token);
        } else {
            localStorage.removeItem('gptmaker_token');
        }
    }

    async request(endpoint, options = {}) {
        // Verificar que tenemos token
        if (!this.token) {
            console.error('❌ No hay token configurado para GPTMaker API');
            return {
                success: false,
                error: 'No hay token configurado',
                status: 401
            };
        }

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            console.log(`🌐 Realizando petición a: ${url}`);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`);
                console.error(`❌ Respuesta del servidor: ${errorText}`);
                
                // Si es error 401, el token puede estar expirado o ser inválido
                if (response.status === 401) {
                    console.error('❌ Token inválido o expirado');
                    localStorage.removeItem('gptmaker_token');
                }
                
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ Respuesta exitosa de ${url}`);
            return {
                success: true,
                data: data,
                status: response.status
            };
        } catch (error) {
            console.error(`❌ Error en petición a ${url}:`, error);
            
            // Verificar si es un error de CORS o red
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('❌ Error de red o CORS. Verifica la configuración del servidor.');
                return {
                    success: false,
                    error: 'Error de conexión. Verifica la configuración del servidor.',
                    status: 0
                };
            }
            
            return {
                success: false,
                error: error.message,
                status: error.status || 0
            };
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

    // Get agent trainings
    async getAgentTrainings(agentId, options = {}) {
        const cacheKey = `trainings-${agentId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log(`📚 Obteniendo entrenamientos del agente: ${agentId}`);
            
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page);
            if (options.pageSize) params.append('pageSize', options.pageSize);
            // La documentación indica que 'type' puede ser requerido; por defecto consultamos TEXT
            if (options.type) {
                params.append('type', options.type);
            } else {
                params.append('type', 'TEXT');
            }
            if (options.query) params.append('query', options.query);
            
            const queryString = params.toString();
            const endpoint = `/v2/agent/${agentId}/trainings${queryString ? `?${queryString}` : ''}`;
            
            console.log(`📚 Endpoint de entrenamientos: ${endpoint}`);
            
            const result = await this.request(endpoint);
            
            if (result.success && result.data !== undefined) {
                let trainingsArray = result.data;
                
                console.log('🔍 Estructura completa de respuesta de entrenamientos:', {
                    success: result.success,
                    dataType: typeof result.data,
                    isArray: Array.isArray(result.data),
                    dataKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'N/A',
                    fullResponse: result
                });
                
                // Log detallado de la estructura de datos
                if (result.data && typeof result.data === 'object') {
                    console.log('📋 Claves disponibles en result.data:', Object.keys(result.data));
                    if (result.data.data && Array.isArray(result.data.data)) {
                        console.log('📋 Primer entrenamiento en result.data.data:', result.data.data[0]);
                    }
                }
                
                if (!Array.isArray(trainingsArray)) {
                    console.log('⚠️ La API no devolvió un array directo, intentando extraer...');
                    const d = result.data;
                    if (d && Array.isArray(d.data)) trainingsArray = d.data;
                    else if (d && Array.isArray(d.items)) trainingsArray = d.items;
                    else if (d && Array.isArray(d.results)) trainingsArray = d.results;
                    else if (d && Array.isArray(d.trainings)) trainingsArray = d.trainings;
                    else if (d && typeof d === 'object') {
                        // Buscar el primer array en las propiedades
                        const firstArray = Object.values(d).find(v => Array.isArray(v));
                        trainingsArray = firstArray || [];
                    } else {
                        trainingsArray = [];
                    }
                }
                
                // Intentar extraer campos adicionales si existen
                trainingsArray = trainingsArray.map(training => {
                    // Si el training tiene propiedades anidadas, intentar extraerlas
                    if (training.data && typeof training.data === 'object') {
                        return {
                            ...training,
                            ...training.data,
                            // Preservar el ID original
                            id: training.id || training.data.id
                        };
                    }
                    return training;
                });
                
                console.log(`✅ ${trainingsArray.length} entrenamientos obtenidos para el agente ${agentId}`);
                
                trainingsArray.forEach((training, index) => {
                    console.log(`📚 Entrenamiento ${index + 1}:`, {
                        id: training.id,
                        type: training.type,
                        text: training.text ? training.text.substring(0, 50) + '...' : 'Sin texto',
                        image: training.image ? 'Con imagen' : 'Sin imagen',
                        url: training.url || 'Sin URL',
                        title: training.title || 'Sin título',
                        description: training.description || 'Sin descripción',
                        // Log completo del objeto para debugging
                        fullObject: training
                    });
                });
                
                // Los entrenamientos ya vienen con todos los datos disponibles
                const enrichedTrainings = trainingsArray;
                
                const updatedResult = {
                    success: true,
                    data: enrichedTrainings,
                    count: enrichedTrainings.length
                };
                
                this.setCache(cacheKey, updatedResult);
                return updatedResult;
            } else {
                throw new Error('No se pudieron obtener entrenamientos del agente');
            }
        } catch (error) {
            console.error('❌ Error obteniendo entrenamientos del agente:', error.message);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Health check
    async getApiHealth() {
        try {
            const result = await this.request('/health');
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Get workspaces
    async getWorkspaces() {
        const cacheKey = 'workspaces';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('🔍 Obteniendo lista de workspaces...');
            const result = await this.request('/v2/workspaces');
            
            if (result.success && result.data) {
                console.log('✅ WORKSPACES ENCONTRADOS:', result.data);
                console.log(`📊 Total de workspaces: ${result.data.length}`);
                
                // Log detallado de cada workspace
                result.data.forEach((workspace, index) => {
                    console.log(`📋 Workspace ${index + 1}:`, {
                        id: workspace.id,
                        name: workspace.name
                    });
                });
                
                this.setCache(cacheKey, result);
                return result;
            } else {
                throw new Error('No se pudieron obtener workspaces');
            }
        } catch (error) {
            console.error('❌ Error obteniendo workspaces:', error);
            
            // Fallback: usar el workspace del token
            const tokenInfo = this.parseToken();
            if (tokenInfo?.tenant) {
                console.log('🔄 Usando workspace del token como fallback');
                const fallbackWorkspace = {
                    id: tokenInfo.tenant,
                    name: 'Workspace del Token'
                };
                
                const fallbackResult = {
                    success: true,
                    data: [fallbackWorkspace],
                    source: 'token'
                };
                
                this.setCache(cacheKey, fallbackResult);
                return fallbackResult;
            }
            
            return { success: false, error: error.message };
        }
    }

    // Get workspace credits
    async getWorkspaceCredits(workspaceId) {
        const cacheKey = `workspace-credits-${workspaceId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log(`💰 Obteniendo créditos del workspace: ${workspaceId}`);
            const result = await this.request(`/v2/workspace/${workspaceId}/credits`);
            
            if (result.success && result.data) {
                console.log('✅ Créditos del workspace obtenidos:', result.data);
                this.setCache(cacheKey, result);
                return result;
            } else {
                throw new Error('No se pudieron obtener créditos del workspace');
            }
        } catch (error) {
            console.error('❌ Error obteniendo créditos del workspace:', error);
            return { success: false, error: error.message };
        }
    }

    // Get chats
    async getChats(options = {}) {
        const cacheKey = `chats-${JSON.stringify(options)}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // Obtener el workspace ID correcto usando la API real
            const workspaces = await this.getWorkspaces();
            let workspaceId = null;
            let workspaceName = null;
            
            if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                // Usar el primer workspace disponible
                workspaceId = workspaces.data[0].id;
                workspaceName = workspaces.data[0].name;
                console.log(`✅ Usando workspace real: ${workspaceName} (${workspaceId})`);
            } else {
                // Fallback al token si no hay workspaces
                const tokenInfo = this.parseToken();
                workspaceId = tokenInfo?.tenant || tokenInfo?.id;
                workspaceName = 'Workspace del Token';
                console.log(`⚠️ Fallback al workspace del token: ${workspaceId}`);
            }
            
            if (!workspaceId) {
                throw new Error('No se pudo obtener el workspace ID');
            }

            console.log(`💬 Obteniendo chats del workspace: ${workspaceName} (${workspaceId})`);
            
            // Construir parámetros de consulta
            const queryParams = new URLSearchParams();
            if (options.agentId) queryParams.append('agentId', options.agentId);
            if (options.page) queryParams.append('page', options.page);
            if (options.pageSize) queryParams.append('pageSize', options.pageSize);
            if (options.query) queryParams.append('query', options.query);
            
            const queryString = queryParams.toString();
            const url = `/v2/workspace/${workspaceId}/chats${queryString ? `?${queryString}` : ''}`;
            
            console.log(`🔍 URL de chats: ${url}`);
            console.log(`🔍 Parámetros: ${queryString || 'ninguno'}`);
            
            const result = await this.request(url);
            
            if (result.success && result.data) {
                console.log(`✅ ${result.data.length} chats obtenidos desde la API del workspace: ${workspaceName}`);
                
                // Log detallado de cada chat
                result.data.forEach((chat, index) => {
                    console.log(`💬 Chat ${index + 1}:`, {
                        id: chat.id,
                        name: chat.name,
                        agentName: chat.agentName,
                        userName: chat.userName,
                        whatsappPhone: chat.whatsappPhone,
                        type: chat.type,
                        finished: chat.finished,
                        unReadCount: chat.unReadCount
                    });
                });
                
                this.setCache(cacheKey, result);
                return result;
            } else {
                throw new Error('No se pudieron obtener chats de la API');
            }
        } catch (error) {
            console.error('❌ Error obteniendo chats de la API:', error.message);
            
            // Fallback a datos mock
            const mockChats = this.getMockChats();
            return {
                success: true,
                data: mockChats,
                source: 'mock'
            };
        }
    }

    // Get all chats with pagination
    async getAllChats(options = {}) {
        console.log('📄 Obteniendo todos los chats con paginación...');
        
        try {
            const allChats = [];
            let page = 1;
            const pageSize = 50; // Tamaño de página razonable
            let hasMore = true;
            
            while (hasMore) {
                console.log(`📄 Cargando página ${page}...`);
                
                const result = await this.getChats({
                    ...options,
                    page: page,
                    pageSize: pageSize
                });
                
                if (result.success && result.data && result.data.length > 0) {
                    allChats.push(...result.data);
                    console.log(`✅ Página ${page}: ${result.data.length} chats (Total: ${allChats.length})`);
                    
                    // Si recibimos menos chats que el pageSize, no hay más páginas
                    if (result.data.length < pageSize) {
                        hasMore = false;
                        console.log(`📄 Última página alcanzada (${result.data.length} < ${pageSize})`);
                    } else {
                        page++;
                    }
                } else {
                    hasMore = false;
                    console.log(`📄 No hay más chats en la página ${page}`);
                }
            }
            
            console.log(`✅ Total de chats obtenidos: ${allChats.length}`);
            
            return {
                success: true,
                data: allChats,
                source: 'api',
                totalPages: page,
                totalChats: allChats.length
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo todos los chats:', error.message);
            
            // Fallback a datos mock
            const mockChats = this.getMockChats();
            return {
                success: true,
                data: mockChats,
                source: 'mock',
                totalPages: 1,
                totalChats: mockChats.length
            };
        }
    }

    // Get chat messages
    async getChatMessages(chatId, options = {}) {
        try {
            console.log(`💬 Obteniendo mensajes del chat: ${chatId}`);
            
            // Usar el endpoint correcto según la documentación
            const result = await this.request(`/v2/chat/${chatId}/messages`, {
                method: 'GET',
                ...options
            });
            
            if (result.success && result.data) {
                console.log(`✅ ${result.data.length} mensajes obtenidos para el chat ${chatId}`);
                
                // Log detallado de cada mensaje
                result.data.forEach((message, index) => {
                    console.log(`💬 Mensaje ${index + 1}:`, {
                        id: message.id,
                        role: message.role,
                        text: message.text?.substring(0, 50) + '...',
                        type: message.type,
                        userName: message.userName,
                        time: message.time
                    });
                });
                
                return result;
            } else {
                throw new Error('No se pudieron obtener mensajes del chat');
            }
        } catch (error) {
            console.error('❌ Error obteniendo mensajes del chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete chat
    async deleteChat(chatId) {
        try {
            console.log(`🗑️ Eliminando chat: ${chatId}`);
            
            const result = await this.request(`/v2/chat/${chatId}`, {
                method: 'DELETE'
            });
            
            if (result.success) {
                console.log(`✅ Chat ${chatId} eliminado exitosamente`);
                return { success: true, message: 'Chat eliminado exitosamente' };
            } else {
                throw new Error('No se pudo eliminar el chat');
            }
        } catch (error) {
            console.error('❌ Error eliminando chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Get ALL chat messages with pagination
    async getAllChatMessages(chatId, options = {}) {
        try {
            console.log(`💬 Obteniendo TODOS los mensajes del chat: ${chatId}`);
            
            // Estrategia 1: Intentar con diferentes pageSize para forzar paginación
            const pageSizes = [10, 25, 50, 100];
            let bestResult = null;
            let maxMessages = 0;
            
            for (const pageSize of pageSizes) {
                console.log(`🔄 Probando paginación con pageSize: ${pageSize}`);
                
                let allMessages = [];
                let page = 1;
                let hasMore = true;
                let totalPages = 0;
                let consecutiveEmptyPages = 0;
                let maxPages = 50; // Aumentar límite de páginas
                
                while (hasMore && page <= maxPages) {
                    console.log(`📄 Obteniendo página ${page} con pageSize ${pageSize}...`);
                    
                    // Construir URL con parámetros de consulta
                    const queryParams = new URLSearchParams();
                    queryParams.append('page', page.toString());
                    queryParams.append('pageSize', pageSize.toString());
                    
                    const url = `/v2/chat/${chatId}/messages?${queryParams.toString()}`;
                    console.log(`🔍 URL: ${url}`);
                    
                    try {
                        const pageResult = await this.request(url);
                        
                        if (pageResult.success && pageResult.data) {
                            const messagesInPage = pageResult.data.length;
                            console.log(`✅ Página ${page}: ${messagesInPage} mensajes obtenidos`);
                            
                            if (messagesInPage > 0) {
                                allMessages = allMessages.concat(pageResult.data);
                                totalPages = page;
                                consecutiveEmptyPages = 0;
                                
                                // Si obtenemos menos mensajes que el pageSize, no hay más páginas
                                if (messagesInPage < pageSize) {
                                    console.log(`📄 Última página alcanzada (${messagesInPage} < ${pageSize})`);
                                    hasMore = false;
                                } else {
                                    page++;
                                }
                            } else {
                                consecutiveEmptyPages++;
                                console.log(`📄 Página ${page} vacía (${consecutiveEmptyPages} páginas vacías consecutivas)`);
                                
                                // Si tenemos 2 páginas vacías consecutivas, terminar
                                if (consecutiveEmptyPages >= 2) {
                                    console.log('📄 2 páginas vacías consecutivas, terminando paginación');
                                    hasMore = false;
                                } else {
                                    page++;
                                }
                            }
                        } else {
                            console.log(`❌ Error en página ${page}:`, pageResult.error || 'Sin datos');
                            hasMore = false;
                        }
                    } catch (pageError) {
                        console.log(`❌ Error en página ${page}:`, pageError.message);
                        hasMore = false;
                    }
                }
                
                console.log(`📊 Con pageSize ${pageSize}: ${allMessages.length} mensajes obtenidos en ${totalPages} páginas`);
                
                // Guardar el mejor resultado
                if (allMessages.length > maxMessages) {
                    maxMessages = allMessages.length;
                    bestResult = {
                        messages: allMessages,
                        pages: totalPages,
                        pageSize: pageSize
                    };
                    console.log(`🏆 Nuevo mejor resultado: ${allMessages.length} mensajes con pageSize ${pageSize}`);
                }
            }
            
            // Si no obtuvimos mensajes con paginación, intentar sin parámetros
            if (!bestResult || bestResult.messages.length === 0) {
                console.log('🔄 Intentando sin parámetros de paginación...');
                const result = await this.request(`/v2/chat/${chatId}/messages`);
                
                if (result.success && result.data && result.data.length > 0) {
                    console.log(`✅ Obtenidos ${result.data.length} mensajes sin paginación`);
                    bestResult = {
                        messages: result.data,
                        pages: 1,
                        pageSize: 'none'
                    };
                }
            }
            
            if (bestResult && bestResult.messages.length > 0) {
                // Ordenar mensajes por tiempo (más antiguos primero)
                bestResult.messages.sort((a, b) => (a.time || 0) - (b.time || 0));
                
                console.log(`✅ MEJOR RESULTADO: ${bestResult.messages.length} mensajes obtenidos con pageSize ${bestResult.pageSize} en ${bestResult.pages} páginas`);
                
                // Log de los primeros y últimos mensajes para verificar orden
                if (bestResult.messages.length > 0) {
                    console.log(`📅 Primer mensaje: ${new Date(bestResult.messages[0].time || 0).toLocaleString()}`);
                    console.log(`📅 Último mensaje: ${new Date(bestResult.messages[bestResult.messages.length - 1].time || 0).toLocaleString()}`);
                    
                    // Log de algunos mensajes para verificar contenido
                    console.log('📝 Primeros 5 mensajes:');
                    bestResult.messages.slice(0, 5).forEach((msg, index) => {
                        console.log(`  ${index + 1}. [${msg.role}] ${msg.text?.substring(0, 50)}... (${new Date(msg.time || 0).toLocaleString()})`);
                    });
                    
                    console.log('📝 Últimos 5 mensajes:');
                    bestResult.messages.slice(-5).forEach((msg, index) => {
                        const realIndex = bestResult.messages.length - 5 + index + 1;
                        console.log(`  ${realIndex}. [${msg.role}] ${msg.text?.substring(0, 50)}... (${new Date(msg.time || 0).toLocaleString()})`);
                    });
                }
                
                return {
                    success: true,
                    data: bestResult.messages,
                    total: bestResult.messages.length,
                    pages: bestResult.pages,
                    strategy: `pageSize-${bestResult.pageSize}`
                };
            } else {
                console.error('❌ No se pudieron obtener mensajes con ninguna estrategia');
                return { success: false, error: 'No se pudieron obtener mensajes con ninguna estrategia de paginación' };
            }
            
        } catch (error) {
            console.error('❌ Error obteniendo todos los mensajes del chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Alternative method to get all messages with different pagination strategies
    async getAllChatMessagesAlternative(chatId, options = {}) {
        try {
            console.log(`💬 Método alternativo para obtener TODOS los mensajes del chat: ${chatId}`);
            
            // Estrategia 1: Usar offset y limit en lugar de page y pageSize
            console.log('🔄 Probando con offset y limit...');
            
            const limit = 50;
            let offset = 0;
            let allMessages = [];
            let hasMore = true;
            let totalPages = 0;
            
            while (hasMore && offset < 5000) { // Límite de 5000 mensajes
                console.log(`📄 Obteniendo mensajes con offset: ${offset}, limit: ${limit}`);
                
                const queryParams = new URLSearchParams();
                queryParams.append('offset', offset.toString());
                queryParams.append('limit', limit.toString());
                
                const url = `/v2/chat/${chatId}/messages?${queryParams.toString()}`;
                console.log(`🔍 URL con offset: ${url}`);
                
                try {
                    const result = await this.request(url);
                    
                    if (result.success && result.data && result.data.length > 0) {
                        allMessages = allMessages.concat(result.data);
                        totalPages++;
                        
                        if (result.data.length < limit) {
                            console.log(`📄 Última página alcanzada (${result.data.length} < ${limit})`);
                            hasMore = false;
                        } else {
                            offset += limit;
                        }
                    } else {
                        console.log(`❌ Sin datos en offset ${offset}`);
                        hasMore = false;
                    }
                } catch (error) {
                    console.log(`❌ Error en offset ${offset}:`, error.message);
                    hasMore = false;
                }
            }
            
            if (allMessages.length > 0) {
                console.log(`✅ Con offset/limit: ${allMessages.length} mensajes obtenidos en ${totalPages} páginas`);
                
                // Ordenar mensajes por tiempo
                allMessages.sort((a, b) => (a.time || 0) - (b.time || 0));
                
                return {
                    success: true,
                    data: allMessages,
                    total: allMessages.length,
                    pages: totalPages,
                    strategy: 'offset-limit'
                };
            }
            
            // Estrategia 2: Usar diferentes parámetros de paginación
            console.log('🔄 Probando con diferentes parámetros de paginación...');
            
            const paginationStrategies = [
                { page: 'page', size: 'size' },
                { page: 'p', size: 's' },
                { page: 'pageNumber', size: 'pageSize' },
                { page: 'currentPage', size: 'itemsPerPage' }
            ];
            
            for (const strategy of paginationStrategies) {
                console.log(`🔄 Probando estrategia: ${strategy.page} y ${strategy.size}`);
                
                let allMessages = [];
                let page = 1;
                let hasMore = true;
                let totalPages = 0;
                const pageSize = 25;
                
                while (hasMore && page <= 20) {
                    const queryParams = new URLSearchParams();
                    queryParams.append(strategy.page, page.toString());
                    queryParams.append(strategy.size, pageSize.toString());
                    
                    const url = `/v2/chat/${chatId}/messages?${queryParams.toString()}`;
                    console.log(`🔍 Probando: ${url}`);
                    
                    try {
                        const result = await this.request(url);
                        
                        if (result.success && result.data && result.data.length > 0) {
                            allMessages = allMessages.concat(result.data);
                            totalPages = page;
                            
                            if (result.data.length < pageSize) {
                                hasMore = false;
                            } else {
                                page++;
                            }
                        } else {
                            hasMore = false;
                        }
                    } catch (error) {
                        console.log(`❌ Error con estrategia ${strategy.page}/${strategy.size}:`, error.message);
                        hasMore = false;
                    }
                }
                
                if (allMessages.length > 0) {
                    console.log(`✅ Con estrategia ${strategy.page}/${strategy.size}: ${allMessages.length} mensajes obtenidos`);
                    
                    // Ordenar mensajes por tiempo
                    allMessages.sort((a, b) => (a.time || 0) - (b.time || 0));
                    
                    return {
                        success: true,
                        data: allMessages,
                        total: allMessages.length,
                        pages: totalPages,
                        strategy: `${strategy.page}-${strategy.size}`
                    };
                }
            }
            
            // Si ninguna estrategia funciona, devolver error
            return { success: false, error: 'No se pudieron obtener mensajes con ninguna estrategia de paginación' };
            
        } catch (error) {
            console.error('❌ Error en método alternativo:', error);
            return { success: false, error: error.message };
        }
    }

    // Method to try different endpoints for getting messages
    async getAllChatMessagesWithEndpoints(chatId, options = {}) {
        try {
            console.log(`💬 Probando diferentes endpoints para obtener mensajes del chat: ${chatId}`);
            
            // Diferentes endpoints posibles
            const endpoints = [
                `/v2/chat/${chatId}/messages`,
                `/v2/conversation/${chatId}/messages`,
                `/v2/chats/${chatId}/messages`,
                `/v2/messages?chatId=${chatId}`,
                `/v2/messages?conversationId=${chatId}`,
                `/v2/chat/${chatId}/history`,
                `/v2/conversation/${chatId}/history`
            ];
            
            let bestResult = null;
            let maxMessages = 0;
            
            for (const endpoint of endpoints) {
                console.log(`🔄 Probando endpoint: ${endpoint}`);
                
                try {
                    // Probar sin parámetros
                    let result = await this.request(endpoint);
                    
                    if (result.success && result.data && result.data.length > 0) {
                        console.log(`✅ Endpoint ${endpoint}: ${result.data.length} mensajes sin parámetros`);
                        
                        if (result.data.length > maxMessages) {
                            maxMessages = result.data.length;
                            bestResult = {
                                messages: result.data,
                                endpoint: endpoint,
                                strategy: 'no-params'
                            };
                        }
                    }
                    
                    // Probar con paginación
                    const pageSizes = [10, 25, 50];
                    for (const pageSize of pageSizes) {
                        const queryParams = new URLSearchParams();
                        queryParams.append('page', '1');
                        queryParams.append('pageSize', pageSize.toString());
                        
                        const urlWithParams = `${endpoint}?${queryParams.toString()}`;
                        console.log(`🔍 Probando: ${urlWithParams}`);
                        
                        result = await this.request(urlWithParams);
                        
                        if (result.success && result.data && result.data.length > 0) {
                            console.log(`✅ Endpoint ${endpoint} con pageSize ${pageSize}: ${result.data.length} mensajes`);
                            
                            if (result.data.length > maxMessages) {
                                maxMessages = result.data.length;
                                bestResult = {
                                    messages: result.data,
                                    endpoint: endpoint,
                                    strategy: `pageSize-${pageSize}`
                                };
                            }
                        }
                    }
                    
                } catch (error) {
                    console.log(`❌ Error con endpoint ${endpoint}:`, error.message);
                }
            }
            
            if (bestResult && bestResult.messages.length > 0) {
                // Ordenar mensajes por tiempo
                bestResult.messages.sort((a, b) => (a.time || 0) - (b.time || 0));
                
                console.log(`🏆 MEJOR ENDPOINT: ${bestResult.endpoint} con ${bestResult.messages.length} mensajes usando estrategia ${bestResult.strategy}`);
                
                return {
                    success: true,
                    data: bestResult.messages,
                    total: bestResult.messages.length,
                    endpoint: bestResult.endpoint,
                    strategy: bestResult.strategy
                };
            } else {
                return { success: false, error: 'No se pudieron obtener mensajes con ningún endpoint' };
            }
            
        } catch (error) {
            console.error('❌ Error probando endpoints:', error);
            return { success: false, error: error.message };
        }
    }

    // Delete chat
    async deleteChat(chatId) {
        try {
            console.log(`🗑️ Eliminando chat: ${chatId}`);
            
            const result = await this.request(`/v2/conversation/${chatId}`, {
                method: 'DELETE'
            });
            
            if (result.success) {
                console.log(`✅ Chat ${chatId} eliminado exitosamente`);
                // Limpiar cache de chats
                this.cache.delete('chats');
                return result;
            } else {
                throw new Error('No se pudo eliminar el chat');
            }
        } catch (error) {
            console.error('❌ Error eliminando chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Send message
    async startHumanTakeover(chatId) {
        try {
            console.log(`👤 Asumiendo atendimiento humano del chat: ${chatId}`);
            
            const result = await this.request(`/v2/chat/${chatId}/start-human`, {
                method: 'PUT'
            });
            
            if (result.success) {
                console.log(`✅ Atendimiento humano asumido para el chat ${chatId}`);
                // Limpiar cache de chats
                this.cache.delete('chats');
                return result;
            } else {
                throw new Error('No se pudo asumir el atendimiento');
            }
        } catch (error) {
            console.error('❌ Error asumiendo atendimiento:', error);
            throw error;
        }
    }

    async sendMessage(chatId, message) {
        try {
            console.log(`📤 Enviando mensaje al chat: ${chatId}`);
            console.log(`📝 Mensaje: "${message}"`);
            
            const result = await this.request(`/v2/chat/${chatId}/send-message`, {
                method: 'POST',
                body: JSON.stringify({
                    message: message
                })
            });
            
            if (result.success) {
                console.log(`✅ Mensaje enviado exitosamente al chat ${chatId}`);
                // Limpiar cache de chats y mensajes
                this.cache.delete('chats');
                this.cache.delete(`messages-${chatId}`);
                return result;
            } else {
                throw new Error('No se pudo enviar el mensaje');
            }
        } catch (error) {
            console.error('❌ Error enviando mensaje:', error);
            return { success: false, error: error.message };
        }
    }

    // Assume chat
    async assumeChat(chatId) {
        try {
            console.log(`👤 Asumiendo chat: ${chatId}`);
            
            const result = await this.request(`/v2/conversation/${chatId}/start-human`, {
                method: 'POST'
            });
            
            if (result.success) {
                console.log(`✅ Chat ${chatId} asumido exitosamente`);
                return result;
            } else {
                throw new Error('No se pudo asumir el chat');
            }
        } catch (error) {
            console.error('❌ Error asumiendo chat:', error);
            return { success: false, error: error.message };
        }
    }

    // Get agents
    async getAgents() {
        const cacheKey = 'agents';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('🤖 Obteniendo agentes...');
            
            // Obtener el workspace ID correcto usando la API real
            const workspaces = await this.getWorkspaces();
            let workspaceId = null;
            let workspaceName = null;
            
            if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                // Usar el primer workspace disponible
                workspaceId = workspaces.data[0].id;
                workspaceName = workspaces.data[0].name;
                console.log(`🤖 Usando workspace real para agentes: ${workspaceName} (${workspaceId})`);
            } else {
                // Fallback al token si no hay workspaces
                const tokenInfo = this.parseToken();
                workspaceId = tokenInfo?.tenant || tokenInfo?.id;
                workspaceName = 'Workspace del Token';
                console.log(`🤖 Fallback al workspace del token: ${workspaceId}`);
            }
            
            if (!workspaceId) {
                throw new Error('No se pudo obtener el workspace ID');
            }

            console.log(`🤖 Obteniendo agentes del workspace: ${workspaceName} (${workspaceId})`);
            
            const result = await this.request(`/v2/workspace/${workspaceId}/agents`);
            
            if (result.success && result.data) {
                // Verificar si result.data es un array o un objeto
                let agentsArray = result.data;
                if (!Array.isArray(agentsArray)) {
                    console.log('⚠️ La API no devolvió un array directo, intentando extraer...');
                    
                    // Intentar extraer array de diferentes estructuras
                    if (result.data.data && Array.isArray(result.data.data)) {
                        agentsArray = result.data.data;
                        console.log('📋 Extrayendo array de result.data.data');
                    } else if (result.data.agents && Array.isArray(result.data.agents)) {
                        agentsArray = result.data.agents;
                        console.log('📋 Extrayendo array de result.data.agents');
                    } else if (result.data.results && Array.isArray(result.data.results)) {
                        agentsArray = result.data.results;
                        console.log('📋 Extrayendo array de result.data.results');
                    } else {
                        console.log('❌ No se pudo extraer un array de la respuesta');
                        throw new Error('La API no devolvió un array de agentes como indica la documentación');
                    }
                }
                
                console.log(`✅ ${agentsArray.length} agentes obtenidos desde la API del workspace: ${workspaceName}`);
                
                // Log detallado de cada agente
                agentsArray.forEach((agent, index) => {
                    console.log(`🤖 Agente ${index + 1}:`, {
                        id: agent.id,
                        name: agent.name,
                        type: agent.type,
                        communicationType: agent.communicationType,
                        jobName: agent.jobName
                    });
                });
                
                // Actualizar result.data con el array extraído
                const updatedResult = {
                    ...result,
                    data: agentsArray
                };
                
                this.setCache(cacheKey, updatedResult);
                return updatedResult;
            } else {
                throw new Error('No se pudieron obtener agentes de la API');
            }
        } catch (error) {
            console.error('❌ Error obteniendo agentes de la API:', error.message);
            
            // Fallback a datos mock
            const mockAgents = this.getMockAgents();
            return {
                success: true,
                data: mockAgents,
                source: 'mock'
            };
        }
    }

    // Get agent credits
    async getAgentCredits(agentId, year = new Date().getFullYear()) {
        try {
            console.log(`💰 Obteniendo créditos del agente: ${agentId} para el año ${year}`);
            
            const result = await this.request(`/v2/agent/${agentId}/credits-spent?year=${year}`);
            
            if (result.success && result.data) {
                console.log(`✅ Créditos obtenidos para agente ${agentId}:`, {
                    total: result.data.total,
                    dataLength: result.data.data ? result.data.data.length : 0
                });
                return result;
            } else {
                throw new Error('No se pudieron obtener créditos del agente');
            }
        } catch (error) {
            console.error('❌ Error obteniendo créditos para agente', agentId, ':', error.message);
            return { success: false, error: error.message };
        }
    }

    // Get channels for an agent
    async getChannels(agentId, options = {}) {
        const cacheKey = `channels-${agentId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log(`📱 Obteniendo canales del agente: ${agentId}`);
            
            // Construir parámetros de consulta
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page);
            if (options.pageSize) params.append('pageSize', options.pageSize);
            if (options.query) params.append('query', options.query);
            
            const queryString = params.toString();
            const endpoint = `/v2/agent/${agentId}/search${queryString ? `?${queryString}` : ''}`;
            
            console.log(`📱 Endpoint de canales: ${endpoint}`);
            
            const result = await this.request(endpoint);
            
            if (result.success && result.data) {
                let channelsArray = result.data.data || result.data;
                
                if (!Array.isArray(channelsArray)) {
                    console.log('⚠️ La API no devolvió un array directo, intentando extraer...');
                    
                    if (result.data.data && Array.isArray(result.data.data)) {
                        channelsArray = result.data.data;
                    } else if (result.data.channels && Array.isArray(result.data.channels)) {
                        channelsArray = result.data.channels;
                    } else {
                        channelsArray = [];
                    }
                }
                
                const count = result.data.count || channelsArray.length;
                
                console.log(`✅ ${channelsArray.length} canales obtenidos para el agente ${agentId}`);
                
                // Log detallado de cada canal
                channelsArray.forEach((channel, index) => {
                    console.log(`📱 Canal ${index + 1}:`, {
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                        connected: channel.connected
                    });
                });
                
                const updatedResult = {
                    success: true,
                    data: channelsArray,
                    count: count
                };
                
                this.setCache(cacheKey, updatedResult);
                return updatedResult;
            } else {
                throw new Error('No se pudieron obtener canales del agente');
            }
        } catch (error) {
            console.error('❌ Error obteniendo canales del agente:', error.message);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Get team members
    async getTeamMembers() {
        const cacheKey = 'team';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('👥 Obteniendo miembros del equipo...');
            
            // Obtener el workspace ID correcto usando la API real
            const workspaces = await this.getWorkspaces();
            let workspaceId = null;
            let workspaceName = null;
            
            if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                // Usar el primer workspace disponible
                workspaceId = workspaces.data[0].id;
                workspaceName = workspaces.data[0].name;
                console.log(`👥 Usando workspace real para equipo: ${workspaceName} (${workspaceId})`);
            } else {
                // Fallback al token si no hay workspaces
                const tokenInfo = this.parseToken();
                workspaceId = tokenInfo?.tenant || tokenInfo?.id;
                workspaceName = 'Workspace del Token';
                console.log(`👥 Fallback al workspace del token: ${workspaceId}`);
            }
            
            if (!workspaceId) {
                throw new Error('No se pudo obtener el workspace ID');
            }
            
            // Intentar diferentes endpoints para usuarios
            let result = await this.request(`/v2/workspace/${workspaceId}/users`);
            
            // Si falla, intentar endpoint alternativo
            if (!result.success) {
                console.log('🔄 Intentando endpoint alternativo para usuarios...');
                result = await this.request(`/v2/users`);
            }
            
            // Si ambos fallan, usar datos mock
            if (!result.success) {
                console.log('⚠️ No se pudieron obtener usuarios de la API, usando datos mock');
                throw new Error('No se pudieron obtener miembros del equipo');
            }
            
            if (result.success && result.data) {
                console.log(`✅ ${result.data.length} miembros del equipo obtenidos desde la API del workspace: ${workspaceName}`);
                this.setCache(cacheKey, result);
                return result;
            } else {
                throw new Error('No se pudieron obtener miembros del equipo');
            }
        } catch (error) {
            console.error('❌ Error obteniendo miembros del equipo:', error.message);
            
            // Fallback a datos mock
            const mockTeam = this.getMockTeam();
            return {
                success: true,
                data: mockTeam,
                source: 'mock'
            };
        }
    }

    // Get interactions/attendances
    async getInteractions(options = {}) {
        const cacheKey = 'interactions';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // Obtener el workspace ID correcto usando la API real
            const workspaces = await this.getWorkspaces();
            let workspaceId = null;
            let workspaceName = null;
            
            if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                // Usar el primer workspace disponible
                workspaceId = workspaces.data[0].id;
                workspaceName = workspaces.data[0].name;
                console.log(`📞 Usando workspace real para interacciones: ${workspaceName} (${workspaceId})`);
            } else {
                // Fallback al token si no hay workspaces
                const tokenInfo = this.parseToken();
                workspaceId = tokenInfo?.tenant || tokenInfo?.id;
                workspaceName = 'Workspace del Token';
                console.log(`📞 Fallback al workspace del token: ${workspaceId}`);
            }
            
            if (!workspaceId) {
                throw new Error('No se pudo obtener el workspace ID');
            }

            console.log(`📞 Obteniendo interacciones del workspace: ${workspaceName} (${workspaceId})`);
            
            // Construir parámetros de consulta con valores por defecto
            const queryParams = new URLSearchParams();
            
            // Parámetros por defecto para obtener más datos
            queryParams.append('page', options.page || '1');
            queryParams.append('pageSize', options.pageSize || '50');
            
            // Parámetros opcionales
            if (options.agentId) queryParams.append('agentId', options.agentId);
            
            console.log('🔍 Parámetros construidos:', {
                page: options.page || '1',
                pageSize: options.pageSize || '50',
                agentId: options.agentId || 'ninguno'
            });
            
            const queryString = queryParams.toString();
            const url = `/v2/workspace/${workspaceId}/interactions${queryString ? `?${queryString}` : ''}`;
            
            console.log(`🔍 URL de interacciones: ${url}`);
            console.log(`🔍 Parámetros de consulta: ${queryString || 'ninguno'}`);
            console.log(`🔍 Workspace ID usado: ${workspaceId}`);
            
            const result = await this.request(url);
            
            console.log('🔍 Respuesta completa de interacciones:', {
                success: result.success,
                status: result.status,
                dataType: typeof result.data,
                dataKeys: result.data ? Object.keys(result.data) : 'no data',
                fullResponse: result
            });
            
            if (result.success && result.data) {
                console.log('🔍 Estructura de respuesta de interacciones:', {
                    success: result.success,
                    dataType: typeof result.data,
                    isArray: Array.isArray(result.data),
                    dataKeys: result.data ? Object.keys(result.data) : 'no data',
                    dataLength: result.data ? (Array.isArray(result.data) ? result.data.length : 'not array') : 'no data'
                });
                
                // Verificar que result.data es un array
                let interactionsArray = result.data;
                if (!Array.isArray(interactionsArray)) {
                    console.log('⚠️ La API no devolvió un array directo, intentando extraer...');
                    
                    // Intentar extraer array de diferentes estructuras
                    if (result.data.data && Array.isArray(result.data.data)) {
                        interactionsArray = result.data.data;
                        console.log('📋 Extrayendo array de result.data.data');
                    } else if (result.data.interactions && Array.isArray(result.data.interactions)) {
                        interactionsArray = result.data.interactions;
                        console.log('📋 Extrayendo array de result.data.interactions');
                    } else if (result.data.results && Array.isArray(result.data.results)) {
                        interactionsArray = result.data.results;
                        console.log('📋 Extrayendo array de result.data.results');
                    } else {
                        console.log('❌ No se pudo extraer un array de la respuesta');
                        throw new Error('La API no devolvió un array de interacciones como indica la documentación');
                    }
                }
                
                console.log(`✅ ${interactionsArray.length} interacciones obtenidas desde la API`);
                
                const apiResult = {
                    success: true,
                    data: interactionsArray,
                    source: 'api'
                };
                
                this.setCache(cacheKey, apiResult);
                return apiResult;
            } else {
                throw new Error('No se pudieron obtener interacciones de la API');
            }
        } catch (error) {
            console.error('❌ Error obteniendo interacciones de la API:', error.message);
            
            // Fallback a datos mock
            const mockInteractions = this.getMockInteractions();
            return {
                success: true,
                data: mockInteractions,
                source: 'mock'
            };
        }
    }

    // Parse JWT token
    parseToken() {
        try {
            const payload = this.token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded;
        } catch (error) {
            console.error('Error parsing token:', error);
            return null;
        }
    }

    // Mock data methods
    getMockChats() {
        return [
            {
                id: 'chat-1',
                user: '351963409216',
                agent: 'Paulina',
                lastMessage: 'Hola, ¿en qué puedo ayudarte?',
                type: 'whatsapp',
                timestamp: new Date().toISOString(),
                messages: [
                    { role: 'user', content: 'Hola', timestamp: new Date().toISOString() },
                    { role: 'agent', content: 'Hola, ¿en qué puedo ayudarte?', timestamp: new Date().toISOString() }
                ]
            },
            {
                id: 'chat-2',
                user: '50764392877',
                agent: 'Paulina',
                lastMessage: 'Gracias por contactarnos',
                type: 'whatsapp',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                messages: [
                    { role: 'user', content: 'Necesito información', timestamp: new Date().toISOString() },
                    { role: 'agent', content: 'Gracias por contactarnos', timestamp: new Date().toISOString() }
                ]
            }
        ];
    }

    getMockAgents() {
        return [
            {
                id: 'agent-1',
                name: 'Paulina',
                behavior: 'Profesional y amigable',
                avatar: null,
                communicationType: 'NORMAL',
                type: 'SUPPORT',
                jobName: 'TechCorp Solutions',
                jobSite: 'https://techcorp.com',
                jobDescription: 'Asistente virtual especializada en atención al cliente y soporte técnico',
                credits: 150
            },
            {
                id: 'agent-2',
                name: 'Axel Aleman',
                behavior: 'Persuasivo y orientado a resultados',
                avatar: null,
                communicationType: 'FORMAL',
                type: 'SALE',
                jobName: 'SalesPro Inc',
                jobSite: 'https://salespro.com',
                jobDescription: 'Especialista en ventas, consultas técnicas y generación de leads',
                credits: 89
            }
        ];
    }


    getMockTeam() {
        return [
            {
                id: 'user-1',
                name: 'María González',
                role: 'Manager',
                email: 'maria@empresa.com',
                skills: ['Gestión', 'Liderazgo', 'Estrategia']
            },
            {
                id: 'user-2',
                name: 'Carlos Rodríguez',
                role: 'Trainer',
                email: 'carlos@empresa.com',
                skills: ['Capacitación', 'IA', 'Tecnología']
            },
            {
                id: 'user-3',
                name: 'Ana Martínez',
                role: 'Attendant',
                email: 'ana@empresa.com',
                skills: ['Atención', 'Comunicación', 'Soporte']
            }
        ];
    }

    getMockInteractions() {
        return [
            {
                id: 'interaction-1',
                chatName: 'María González',
                agentName: 'Paulina',
                status: 'RESOLVED',
                startAt: new Date(Date.now() - 3600000).toISOString(),
                resolvedAt: new Date().toISOString(),
                transferAt: null
            },
            {
                id: 'interaction-2',
                chatName: 'Carlos Rodríguez',
                agentName: 'Axel Aleman',
                status: 'RUNNING',
                startAt: new Date(Date.now() - 1800000).toISOString(),
                resolvedAt: null,
                transferAt: null
            }
        ];
    }

    async getAgentIntentions(agentId, options = {}) {
        const cacheKey = `intentions-${agentId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log(`🎯 Obteniendo intenciones del agente: ${agentId}`);
            
            const params = new URLSearchParams();
            if (options.page) params.append('page', options.page);
            if (options.pageSize) params.append('pageSize', options.pageSize);
            if (options.query) params.append('query', options.query);
            
            const queryString = params.toString();
            const endpoint = `/v2/agent/${agentId}/intentions${queryString ? `?${queryString}` : ''}`;
            
            console.log(`🎯 Endpoint de intenciones: ${endpoint}`);
            
            const result = await this.request(endpoint);
            
            if (result.success && result.data !== undefined) {
                let intentionsArray = result.data;
                
                console.log('🔍 Estructura completa de respuesta de intenciones:', {
                    success: result.success,
                    dataType: typeof result.data,
                    isArray: Array.isArray(result.data),
                    dataKeys: result.data && typeof result.data === 'object' ? Object.keys(result.data) : 'N/A',
                    fullResponse: result
                });
                
                if (!Array.isArray(intentionsArray)) {
                    console.log('⚠️ La API no devolvió un array directo, intentando extraer...');
                    const d = result.data;
                    if (d && Array.isArray(d.data)) intentionsArray = d.data;
                    else if (d && Array.isArray(d.items)) intentionsArray = d.items;
                    else if (d && Array.isArray(d.results)) intentionsArray = d.results;
                    else if (d && Array.isArray(d.intentions)) intentionsArray = d.intentions;
                    else if (d && typeof d === 'object') {
                        // Buscar el primer array en las propiedades
                        const firstArray = Object.values(d).find(v => Array.isArray(v));
                        intentionsArray = firstArray || [];
                    } else {
                        intentionsArray = [];
                    }
                }
                
                console.log(`✅ ${intentionsArray.length} intenciones obtenidas para el agente ${agentId}`);
                
                intentionsArray.forEach((intention, index) => {
                    console.log(`🎯 Intención ${index + 1}:`, {
                        id: intention.id,
                        description: intention.description ? intention.description.substring(0, 50) + '...' : 'Sin descripción',
                        type: intention.type,
                        httpMethod: intention.httpMethod,
                        url: intention.url || 'Sin URL',
                        fields: intention.fields ? intention.fields.length : 0,
                        headers: intention.headers ? intention.headers.length : 0,
                        params: intention.params ? intention.params.length : 0,
                        variables: intention.variables ? intention.variables.length : 0,
                        fullObject: intention
                    });
                });
                
                const updatedResult = {
                    success: true,
                    data: intentionsArray,
                    count: intentionsArray.length
                };
                
                this.setCache(cacheKey, updatedResult);
                return updatedResult;
            } else {
                throw new Error('No se pudieron obtener intenciones del agente');
            }
        } catch (error) {
            console.error('❌ Error obteniendo intenciones del agente:', error.message);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}