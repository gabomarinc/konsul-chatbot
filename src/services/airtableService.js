class AirtableService {
    constructor() {
        // Configuración de Airtable
        this.baseId = 'appoqCG814jMJbf4X';
        this.apiKey = null; // Se cargará desde variables de entorno o configuración
        this.apiBase = 'https://api.airtable.com/v0';
        this.tableName = 'Users'; // Nombre de la tabla en Airtable
        
        // Configuración de rate limiting
        this.rateLimitDelay = 30000; // 30 segundos inicial (como sugiere Airtable)
        this.maxRetries = 5; // Máximo de reintentos
        
        console.log('🗄️ AirtableService inicializado');
    }
    
    /**
     * Maneja rate limiting con exponential backoff mejorado
     * @param {Function} requestFn - Función que ejecuta la petición
     * @param {Object} options - Opciones de retry
     * @returns {Promise} Resultado de la petición
     */
    async handleRateLimit(requestFn, options = {}) {
        const {
            maxRetries = this.maxRetries,
            initialDelay = this.rateLimitDelay,
            maxDelay = 300000 // 5 minutos máximo
        } = options;
        
        let retries = maxRetries;
        let delay = initialDelay;
        let lastError = null;
        
        while (retries > 0) {
            try {
                const response = await requestFn();
                
                // Si es 429 (rate limit), esperar y reintentar
                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    const waitTime = retryAfter 
                        ? Math.min(parseInt(retryAfter) * 1000, maxDelay)
                        : Math.min(delay, maxDelay);
                    
                    console.warn(`⏳ Rate limit (429) alcanzado. Esperando ${Math.round(waitTime/1000)}s antes de reintentar... (${maxRetries - retries + 1}/${maxRetries} intento)`);
                    
                    // Mostrar progreso visual
                    if (window.dashboard) {
                        window.dashboard.showNotification(
                            `Rate limit alcanzado. Esperando ${Math.round(waitTime/1000)}s...`, 
                            'warning'
                        );
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    
                    // Exponential backoff: duplicar el tiempo de espera
                    delay = Math.min(delay * 2, maxDelay);
                    retries--;
                    continue;
                }
                
                // Si es otro error, lanzarlo
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
                }
                
                // Si llegamos aquí, la respuesta es exitosa
                return response;
                
            } catch (error) {
                lastError = error;
                
                // Si es un error de rate limit pero no viene del response, también reintentar
                if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('Too Many Requests')) {
                    const waitTime = Math.min(delay, maxDelay);
                    console.warn(`⏳ Error de rate limit detectado. Esperando ${Math.round(waitTime/1000)}s... (${maxRetries - retries + 1}/${maxRetries} intento)`);
                    
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    delay = Math.min(delay * 2, maxDelay);
                    retries--;
                    continue;
                }
                
                // Si no es rate limit, lanzar el error inmediatamente
                throw error;
            }
        }
        
        // Si llegamos aquí, se agotaron los reintentos
        throw new Error(`Rate limit: Se agotaron los ${maxRetries} reintentos. ${lastError?.message || ''}`);
    }

    // ===== CONFIGURACIÓN =====

    setApiKey(apiKey) {
        this.apiKey = apiKey;
        console.log('🔑 API Key de Airtable configurada');
    }

    getHeaders() {
        if (!this.apiKey) {
            throw new Error('API Key de Airtable no configurada');
        }
        
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    // ===== MÉTODOS DE USUARIOS =====

    async createUser(userData) {
        try {
            console.log('📝 Creando usuario en Airtable:', userData.email);
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}`;
            
            const fields = {
                'email': userData.email,
                'first_name': userData.firstName || userData.name?.split(' ')[0] || '',
                'last_name': userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
                'password_hash': userData.password, // Nota: Considerar hashear la contraseña
                'role': userData.role || 'user',
                'status': 'active',
                'has_paid': userData.hasPaid || false,
                // Campos para gestión de equipo (se crean si no existen)
                'is_team_member': userData.isTeamMember || false,
                'member_role': userData.memberRole || ''
            };

            if (userData.ownerRecordId) {
                fields['team_owner_email'] = [userData.ownerRecordId];
            } else if (userData.teamOwnerEmail || userData.email) {
                fields['team_owner_email'] = userData.teamOwnerEmail || userData.email;
            }

            const payload = { fields };

            // Usar handleRateLimit para manejar rate limiting
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(payload)
                });
            });

            const data = await response.json();
            console.log('✅ Usuario creado en Airtable:', data.id);
            
            return {
                success: true,
                user: this.transformAirtableUser(data)
            };

        } catch (error) {
            console.error('❌ Error creando usuario en Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUserByEmail(email) {
        try {
            console.log('🔍 Buscando usuario por email:', email);
            
            // Usar filterByFormula para buscar por email
            // Nota: El campo en tu Airtable se llama 'email' (minúscula)
            const formula = encodeURIComponent(`{email} = '${email.replace(/'/g, "\\'")}'`);
            
            // OPTIMIZACIÓN: Solo solicitar campos necesarios
            const fieldsNeeded = [
                'email',
                'first_name',
                'last_name',
                'role',
                'status',
                'has_paid',
                'stripe_customer_id',
                'token_api',
                'empresa',
                'profile_image',
                'is_team_member',
                'member_role',
                'team_owner_email',
                'created_at',
                'last_login'
            ];
            
            const params = [
                `filterByFormula=${formula}`
            ];
            
            fieldsNeeded.forEach(field => {
                params.push(`fields[]=${encodeURIComponent(field)}`);
            });
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}?${params.join('&')}`;
            
            console.log('📡 URL de Airtable:', url);
            
            // Usar handleRateLimit para manejar rate limiting con exponential backoff
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
            });

            console.log('📡 Response status:', response.status);

            const data = await response.json();
            console.log('📊 Datos recibidos de Airtable:', data);
            
            if (data.records && data.records.length > 0) {
                console.log('✅ Usuario encontrado en Airtable');
                console.log('👤 Datos del usuario:', data.records[0]);
                return {
                    success: true,
                    user: this.transformAirtableUser(data.records[0])
                };
            } else {
                console.log('⚠️ Usuario no encontrado en Airtable');
                console.log('📊 Registros recibidos:', data.records?.length || 0);
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

        } catch (error) {
            console.error('❌ Error buscando usuario en Airtable:', error);
            console.error('❌ Detalles del error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUserById(recordId) {
        try {
            console.log('🔍 Obteniendo usuario por ID:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}/${recordId}`;
            
            // Usar handleRateLimit para manejar rate limiting
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error obteniendo usuario de Airtable');
            }

            const data = await response.json();
            console.log('✅ Usuario obtenido de Airtable');
            
            return {
                success: true,
                user: this.transformAirtableUser(data)
            };

        } catch (error) {
            console.error('❌ Error obteniendo usuario de Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateUser(recordId, userData) {
        try {
            console.log('📝 Actualizando usuario en Airtable:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}/${recordId}`;
            
            const fields = {};
            if (userData.email !== undefined) fields['email'] = userData.email;
            if (userData.name !== undefined) {
                const nameParts = userData.name.split(' ');
                fields['first_name'] = nameParts[0] || '';
                fields['last_name'] = nameParts.slice(1).join(' ') || '';
            }
            if (userData.firstName !== undefined) fields['first_name'] = userData.firstName;
            if (userData.lastName !== undefined) fields['last_name'] = userData.lastName;
            // El campo empresa en Airtable se llama 'empresa'
            if (userData.company !== undefined) fields['empresa'] = userData.company;
            if (userData.profileImage !== undefined) fields['profile_image'] = userData.profileImage;
            if (userData.role !== undefined) fields['role'] = userData.role;
            if (userData.status !== undefined) fields['status'] = userData.status;
            if (userData.hasPaid !== undefined) fields['has_paid'] = userData.hasPaid;
            if (userData.token_api !== undefined) fields['token_api'] = userData.token_api;
            // Campos equipo
            if (userData.isTeamMember !== undefined) fields['is_team_member'] = userData.isTeamMember;
            if (userData.teamOwnerEmail !== undefined) fields['team_owner_email'] = userData.teamOwnerEmail;
            if (userData.memberRole !== undefined) fields['member_role'] = userData.memberRole;
            
            console.log('📤 Campos que se enviarán a Airtable:', fields);
            
            // Usar handleRateLimit para manejar rate limiting
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({ fields })
                });
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error actualizando usuario en Airtable');
            }

            const data = await response.json();
            console.log('✅ Usuario actualizado en Airtable');
            
            return {
                success: true,
                user: this.transformAirtableUser(data)
            };

        } catch (error) {
            console.error('❌ Error actualizando usuario en Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updatePassword(recordId, newPassword) {
        try {
            console.log('🔐 Actualizando contraseña en Airtable:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}/${recordId}`;
            
            // Usar handleRateLimit para manejar rate limiting
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        fields: {
                            'password_hash': newPassword // Nota: Considerar hashear la contraseña
                        }
                    })
                });
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error actualizando contraseña en Airtable');
            }

            console.log('✅ Contraseña actualizada en Airtable');
            
            return { success: true };

        } catch (error) {
            console.error('❌ Error actualizando contraseña en Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateLastLogin(recordId) {
        try {
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}/${recordId}`;
            
            // Usar handleRateLimit para manejar rate limiting
            // Nota: Este método no debe fallar si hay rate limit, solo loguear
            try {
                const response = await this.handleRateLimit(async () => {
                    return await fetch(url, {
                        method: 'PATCH',
                        headers: this.getHeaders(),
                        body: JSON.stringify({
                            fields: {
                                'last_login': new Date().toISOString()
                            }
                        })
                    });
                }, {
                    maxRetries: 2, // Menos reintentos para operaciones no críticas
                    initialDelay: 10000 // 10 segundos inicial para operaciones no críticas
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.warn('⚠️ No se pudo actualizar last_login (puede que el campo no exista):', error);
                    // No fallar si este campo no existe
                    return { success: true };
                }
            } catch (error) {
                // Si falla por rate limit, no bloquear el login
                console.warn('⚠️ No se pudo actualizar last_login debido a rate limit, continuando...');
                return { success: true };
            }

            console.log('✅ Última sesión actualizada en Airtable');
            return { success: true };

        } catch (error) {
            console.warn('⚠️ Error actualizando última sesión (continuando):', error);
            // No fallar si este campo no existe
            return { success: true };
        }
    }

    async deleteUser(recordId) {
        try {
            console.log('🗑️ Eliminando usuario de Airtable:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}/${recordId}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error eliminando usuario de Airtable');
            }

            console.log('✅ Usuario eliminado de Airtable');
            
            return { success: true };

        } catch (error) {
            console.error('❌ Error eliminando usuario de Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAllUsers(options = {}) {
        try {
            console.log('📋 Obteniendo todos los usuarios de Airtable...');
            
            const { maxRecords = 100, view = 'Grid view', sort = [] } = options;
            
            let url = `${this.apiBase}/${this.baseId}/${this.tableName}?maxRecords=${maxRecords}`;
            
            if (view) {
                url += `&view=${encodeURIComponent(view)}`;
            }
            
            if (sort.length > 0) {
                const sortParams = sort.map(s => `sort[0][field]=${s.field}&sort[0][direction]=${s.direction}`).join('&');
                url += `&${sortParams}`;
            }
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error obteniendo usuarios de Airtable');
            }

            const data = await response.json();
            
            const users = data.records.map(record => this.transformAirtableUser(record));
            
            console.log(`✅ ${users.length} usuarios obtenidos de Airtable`);
            
            return {
                success: true,
                users,
                offset: data.offset
            };

        } catch (error) {
            console.error('❌ Error obteniendo usuarios de Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ===== MÉTODOS DE TRANSFORMACIÓN =====

    transformAirtableUser(record) {
        if (!record || !record.fields) {
            console.error('❌ Record inválido:', record);
            return null;
        }

        const fields = record.fields;
        
        console.log('🔍 Campos disponibles en Airtable:', Object.keys(fields));
        console.log('📊 Valores de los campos:', fields);
        
        const teamOwnerLink = fields.team_owner_email;
        let teamOwnerRecordId = '';
        if (Array.isArray(teamOwnerLink) && teamOwnerLink.length > 0) {
            teamOwnerRecordId = teamOwnerLink[0];
        }

        const teamOwnerEmailFromLink =
            fields['email (from team_owner_email)'] ||
            fields['Email (from team_owner_email)'] ||
            fields['correo (from team_owner_email)'] ||
            fields['Correo (from team_owner_email)'] ||
            fields.team_owner_email_email ||
            '';

        let teamOwnerEmailValue = '';
        if (typeof fields.team_owner_email === 'string') {
            teamOwnerEmailValue = fields.team_owner_email;
        } else if (teamOwnerRecordId) {
            teamOwnerEmailValue = teamOwnerEmailFromLink || '';
        }

        // Mapear campos de Airtable a estructura esperada
        // Tu Airtable usa: email, first_name, last_name, password_hash, role, status, etc.
        const firstName = fields.first_name || fields.Name || fields.name || '';
        const lastName = fields.last_name || '';
        const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;
        
        const transformedUser = {
            id: record.id, // ID del registro de Airtable
            email: fields.email || fields.Email || '',
            name: fullName || fields.Name || '',
            company: fields.empresa || fields.Company || fields.company || '',
            password: fields.password_hash || fields.Password || fields.password || '',
            role: fields.role || fields.Role || 'user',
            status: fields.status || fields.Status || 'active',
            profileImage: fields.ProfileImage || fields.profileImage || fields.profile_image || '',
            createdAt: fields.created_at || fields.CreatedAt || fields.createdAt || '',
            lastLogin: fields.last_login || fields.LastLogin || fields.lastLogin || '',
            // Campos adicionales
            hasPaid: fields.has_paid || false,
            token_api: fields.token_api || '',
            stripeCustomerId: fields.stripe_customer_id || 
                              fields.stripeCustomerId || 
                              fields.StripeCustomerId || 
                              fields.Stripe_Customer_Id ||
                              fields['Stripe Customer ID'] ||
                              fields['stripe customer id'] ||
                              '',
            createdTime: record.createdTime,
            // Campos de equipo
            isTeamMember: fields.is_team_member || false,
            teamOwnerEmail: teamOwnerEmailValue || '',
            memberRole: fields.member_role || '',
            teamOwnerRecordId,
            ownerRecordId: teamOwnerRecordId
        };
        
        console.log('✨ Usuario transformado:', transformedUser);
        
        return transformedUser;
    }

    // ===== MÉTODOS DE UTILIDAD =====

    verifyPassword(storedPassword, providedPassword) {
        // Nota: En producción, usar bcrypt o similar para hashear contraseñas
        // Por ahora, comparación simple
        return storedPassword === providedPassword;
    }

    // ===== MÉTODOS DE EQUIPO (usando misma tabla Users) =====

    async getTeamMembers(ownerEmail) {
        try {
            if (!ownerEmail) throw new Error('ownerEmail es requerido');
            const formula = encodeURIComponent(`AND({is_team_member} = 1, {team_owner_email} = '${ownerEmail}')`);
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}?filterByFormula=${formula}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error obteniendo miembros del equipo');
            }

            const data = await response.json();
            const members = (data.records || []).map(r => this.transformAirtableUser(r));
            return { success: true, members };
        } catch (error) {
            console.error('❌ Error getTeamMembers:', error);
            return { success: false, error: error.message, members: [] };
        }
    }

    async addTeamMember(ownerEmail, memberData) {
        try {
            if (!ownerEmail) throw new Error('ownerEmail es requerido');
            if (!memberData?.email) throw new Error('email del miembro es requerido');

            const result = await this.createUser({
                email: memberData.email,
                name: memberData.name,
                firstName: memberData.firstName,
                lastName: memberData.lastName,
                role: 'user',
                status: 'active',
                isTeamMember: true,
                teamOwnerEmail: ownerEmail,
                memberRole: memberData.role || 'agent',
                ownerRecordId: memberData.ownerRecordId
            });
            if (!result.success) throw new Error(result.error || 'No se pudo crear miembro');
            return { success: true, member: result.user };
        } catch (error) {
            console.error('❌ Error addTeamMember:', error);
            return { success: false, error: error.message };
        }
    }

    async removeTeamMember(recordId) {
        try {
            if (!recordId) throw new Error('recordId es requerido');
            const result = await this.deleteUser(recordId);
            return result;
        } catch (error) {
            console.error('❌ Error removeTeamMember:', error);
            return { success: false, error: error.message };
        }
    }

    // ===== MÉTODOS DE PROSPECTOS =====

    /**
     * Crea un prospecto individual en Airtable
     */
    async createProspect(prospectData) {
        try {
            console.log('📝 Creando prospecto en Airtable:', prospectData.nombre);
            
            const url = `${this.apiBase}/${this.baseId}/Prospectos`;
            
            // Obtener información del usuario/workspace actual
            let userEmail = null;
            let workspaceId = null;
            
            try {
                if (window.authService && window.authService.getCurrentUser) {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser) {
                        userEmail = currentUser.email;
                        console.log('👤 Usuario actual para prospecto:', userEmail);
                    }
                }
                
                // Intentar obtener workspace ID
                if (window.dashboard && window.dashboard.dataService) {
                    const workspaces = await window.dashboard.dataService.getWorkspaces();
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                        console.log('🏢 Workspace ID para prospecto:', workspaceId);
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener información de usuario/workspace:', error);
            }
            
            // Campos obligatorios
            const fields = {
                'nombre': prospectData.nombre || '',
                'chat_id': prospectData.chatId || '',
                'fecha_extraccion': prospectData.fechaExtraccion || new Date().toISOString()
            };

            // Agregar campos de asociación con usuario/workspace
            if (userEmail) {
                fields['user_email'] = userEmail;
            }
            if (workspaceId) {
                fields['workspace_id'] = workspaceId;
            }

            // Campos opcionales - Solo agregar si tienen datos
            // Guardar imágenes como JSON string si existen
            if (prospectData.imagenesUrls && Array.isArray(prospectData.imagenesUrls) && prospectData.imagenesUrls.length > 0) {
                fields['imagenes_urls'] = JSON.stringify(prospectData.imagenesUrls);
            }
            
            // Guardar documentos como JSON string si existen
            if (prospectData.documentosUrls && Array.isArray(prospectData.documentosUrls) && prospectData.documentosUrls.length > 0) {
                fields['documentos_urls'] = JSON.stringify(prospectData.documentosUrls);
            }

            const payload = { fields };

            // Usar handleRateLimit para manejar rate limiting
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'POST',
                    headers: this.getHeaders(),
                    body: JSON.stringify(payload)
                });
            });

            const data = await response.json();
            console.log('✅ Prospecto creado en Airtable:', data.id);
            
            return {
                success: true,
                prospect: this.transformAirtableProspect(data)
            };

        } catch (error) {
            console.error('❌ Error creando prospecto en Airtable:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Crea múltiples prospectos en un solo lote (batch)
     * Optimiza las llamadas a la API creando hasta 10 registros a la vez
     */
    async createProspectsBatch(prospectsData) {
        try {
            if (!Array.isArray(prospectsData) || prospectsData.length === 0) {
                return {
                    success: true,
                    created: [],
                    errors: [],
                    total: 0
                };
            }
            
            console.log(`📦 Creando ${prospectsData.length} prospectos en lotes...`);
            
            // Obtener información del usuario/workspace una sola vez
            let userEmail = null;
            let workspaceId = null;
            
            try {
                if (window.authService && window.authService.getCurrentUser) {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser) {
                        userEmail = currentUser.email;
                    }
                }
                
                if (window.dashboard && window.dashboard.dataService) {
                    const workspaces = await window.dashboard.dataService.getWorkspaces();
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener información de usuario/workspace:', error);
            }
            
            // Airtable permite hasta 10 registros por lote
            const BATCH_SIZE = 10;
            const batches = [];
            
            // Dividir en lotes de 10
            for (let i = 0; i < prospectsData.length; i += BATCH_SIZE) {
                batches.push(prospectsData.slice(i, i + BATCH_SIZE));
            }
            
            const created = [];
            const errors = [];
            
            // Procesar cada lote
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                console.log(`📦 Procesando lote ${batchIndex + 1}/${batches.length} (${batch.length} prospectos)...`);
                
                // Preparar records para el lote
                const records = batch.map(prospectData => {
                    const fields = {
                        'nombre': prospectData.nombre || '',
                        'chat_id': prospectData.chatId || '',
                        'fecha_extraccion': prospectData.fechaExtraccion || new Date().toISOString()
                    };
                    
                    // Agregar campos de asociación
                    if (userEmail) fields['user_email'] = userEmail;
                    if (workspaceId) fields['workspace_id'] = workspaceId;
                    
                    // Campos opcionales
                    if (prospectData.imagenesUrls && Array.isArray(prospectData.imagenesUrls) && prospectData.imagenesUrls.length > 0) {
                        fields['imagenes_urls'] = JSON.stringify(prospectData.imagenesUrls);
                    }
                    if (prospectData.documentosUrls && Array.isArray(prospectData.documentosUrls) && prospectData.documentosUrls.length > 0) {
                        fields['documentos_urls'] = JSON.stringify(prospectData.documentosUrls);
                    }
                    
                    return { fields };
                });
                
                const url = `${this.apiBase}/${this.baseId}/Prospectos`;
                const payload = { records };
                
                try {
                    // Usar handleRateLimit para manejar rate limiting
                    const response = await this.handleRateLimit(async () => {
                        return await fetch(url, {
                            method: 'POST',
                            headers: this.getHeaders(),
                            body: JSON.stringify(payload)
                        });
                    });
                    
                    const data = await response.json();
                    
                    // Airtable devuelve un array de records creados
                    if (data.records) {
                        data.records.forEach(record => {
                            created.push(this.transformAirtableProspect(record));
                        });
                        console.log(`✅ Lote ${batchIndex + 1}: ${data.records.length} prospectos creados`);
                    }
                    
                } catch (error) {
                    console.error(`❌ Error en lote ${batchIndex + 1}:`, error);
                    // Si falla un lote, guardar los errores pero continuar
                    batch.forEach(prospect => {
                        errors.push({
                            prospect: prospect,
                            error: error.message
                        });
                    });
                }
                
                // Pequeña pausa entre lotes para evitar rate limiting
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            console.log(`✅ Batch completado: ${created.length} creados, ${errors.length} errores`);
            
            return {
                success: errors.length === 0,
                created: created,
                errors: errors,
                total: prospectsData.length,
                createdCount: created.length,
                errorCount: errors.length
            };
            
        } catch (error) {
            console.error('❌ Error en createProspectsBatch:', error);
            return {
                success: false,
                created: [],
                errors: prospectsData.map(p => ({ prospect: p, error: error.message })),
                total: prospectsData.length,
                createdCount: 0,
                errorCount: prospectsData.length
            };
        }
    }

    async getAllProspects(options = {}) {
        try {
            console.log('🔍 Obteniendo prospectos de Airtable...');
            
            // Obtener información del usuario/workspace actual para filtrar
            let userEmail = null;
            let workspaceId = null;
            let filterFormula = null;
            
            try {
                if (window.authService && window.authService.getCurrentUser) {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser) {
                        userEmail = currentUser.email;
                        console.log('👤 Filtrando por usuario:', userEmail);
                    }
                }
                
                // Intentar obtener workspace ID
                if (window.dashboard && window.dashboard.dataService) {
                    const workspaces = await window.dashboard.dataService.getWorkspaces();
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                        console.log('🏢 Filtrando por workspace:', workspaceId);
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener información de usuario/workspace para filtrar:', error);
            }
            
            // Construir fórmula de filtro
            const filterParts = [];
            
            // Filtrar por user_email si existe el campo y tenemos el email
            if (userEmail && !options.includeAll) {
                // Intentar filtrar por user_email (si el campo existe en Airtable)
                filterParts.push(`{user_email} = '${userEmail.replace(/'/g, "\\'")}'`);
            }
            
            // Filtrar por workspace_id si existe el campo y tenemos el ID
            if (workspaceId && !options.includeAll) {
                filterParts.push(`{workspace_id} = '${workspaceId.replace(/'/g, "\\'")}'`);
            }
            
            // Si no hay filtros y no se solicita incluir todos, mostrar advertencia
            if (filterParts.length === 0 && !options.includeAll) {
                console.warn('⚠️ No se pudo filtrar por usuario/workspace. Mostrando todos los prospectos.');
                console.warn('💡 Considera agregar campos user_email o workspace_id en Airtable para filtrar correctamente.');
            }
            
            if (filterParts.length > 0) {
                // Si hay múltiples filtros, combinarlos con AND (el prospecto debe cumplir ambos)
                // Si solo hay uno, usarlo directamente
                filterFormula = filterParts.length > 1 
                    ? `AND(${filterParts.join(', ')})` 
                    : filterParts[0];
            }
            
            let url = `${this.apiBase}/${this.baseId}/Prospectos`;
            const params = [];
            
            // Agregar filtro si existe
            if (filterFormula) {
                params.push(`filterByFormula=${encodeURIComponent(filterFormula)}`);
            }
            
            // OPTIMIZACIÓN: Solo solicitar los campos necesarios en lugar de todos
            // Esto reduce el tamaño de la respuesta y mejora el rendimiento
            const fieldsNeeded = [
                'nombre', 'A nombre',
                'chat_id', 'A chat_id',
                'telefono',
                'canal',
                'fecha_extraccion',
                'fecha_ultimo_mensaje',
                'estado',
                'imagenes_urls',
                'documentos_urls',
                'agente_id',
                'notas',
                'comentarios',
                'campos_solicitados',
                'user_email',
                'workspace_id',
                'createdTime' // Necesario para ordenar
            ];
            
            // Airtable usa el parámetro "fields[]" para especificar campos
            fieldsNeeded.forEach(field => {
                params.push(`fields[]=${encodeURIComponent(field)}`);
            });
            
            if (options.maxRecords) params.push(`maxRecords=${options.maxRecords}`);
            if (options.pageSize) params.push(`pageSize=${options.pageSize}`);
            if (options.view) params.push(`view=${encodeURIComponent(options.view)}`);
            
            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            // Usar handleRateLimit para manejar rate limiting con exponential backoff mejorado
            const response = await this.handleRateLimit(async () => {
                return await fetch(url, {
                    method: 'GET',
                    headers: this.getHeaders()
                });
            });

            const data = await response.json();
            console.log(`✅ ${data.records.length} prospectos obtenidos de Airtable${filterFormula ? ' (filtrados)' : ' (todos)'}`);
            
            const prospects = data.records
                .map(record => this.transformAirtableProspect(record))
                .filter(prospect => prospect !== null);

            return {
                success: true,
                data: prospects,
                total: prospects.length,
                source: 'airtable',
                filtered: !!filterFormula
            };

        } catch (error) {
            console.error('❌ Error obteniendo prospectos de Airtable:', error);
            
            // Si es rate limit y no hay más reintentos, sugerir solución
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                console.error('💡 Solución: Espera unos minutos antes de volver a intentar, o considera implementar paginación.');
            }
            
            return {
                success: false,
                error: error.message,
                data: [],
                source: 'airtable'
            };
        }
    }

    async getProspectByChatId(chatId) {
        try {
            console.log('🔍 Buscando prospecto por chat_id:', chatId);
            
            // Intentar con ambos nombres de campo posibles (primero "A chat_id" que es el real en Airtable, luego "chat_id" como fallback)
            const fieldNames = ['A chat_id', 'chat_id'];
            let response = null;
            let data = null;
            
            for (const fieldName of fieldNames) {
                try {
                    // Escapar comillas simples en el chatId para evitar problemas en la fórmula
                    const escapedChatId = chatId.replace(/'/g, "\\'");
                    const formula = encodeURIComponent(`{${fieldName}} = '${escapedChatId}'`);
                    
                    // OPTIMIZACIÓN: Solo solicitar campos necesarios
                    const fieldsNeeded = [
                        'nombre', 'A nombre',
                        'chat_id', 'A chat_id',
                        'telefono',
                        'canal',
                        'fecha_extraccion',
                        'imagenes_urls',
                        'documentos_urls',
                        'comentarios',
                        'campos_solicitados',
                        'user_email',
                        'workspace_id'
                    ];
                    
                    const params = [
                        `filterByFormula=${formula}`
                    ];
                    
                    fieldsNeeded.forEach(field => {
                        params.push(`fields[]=${encodeURIComponent(field)}`);
                    });
                    
                    const url = `${this.apiBase}/${this.baseId}/Prospectos?${params.join('&')}`;
                    
                    // Usar handleRateLimit para manejar rate limiting
                    response = await this.handleRateLimit(async () => {
                        return await fetch(url, {
                            method: 'GET',
                            headers: this.getHeaders()
                        });
                    });
                    
                    if (response && response.ok) {
                        data = await response.json();
                        if (data.records && data.records.length > 0) {
                            console.log(`✅ Prospecto encontrado usando campo "${fieldName}": ${data.records.length} resultado(s)`);
                            // Si hay múltiples resultados, tomar el primero
                            if (data.records.length > 1) {
                                console.warn(`⚠️ Se encontraron ${data.records.length} prospectos con el mismo chat_id. Usando el primero.`);
                            }
                            break;
                        } else {
                            console.log(`  → No se encontraron prospectos con campo "${fieldName}"`);
                        }
                    } else {
                        const errorData = await response.json().catch(() => ({}));
                        console.warn(`⚠️ Respuesta no OK al buscar con campo "${fieldName}": ${response.status} - ${errorData.error?.message || 'Sin mensaje'}`);
                    }
                } catch (e) {
                    console.log(`⚠️ Error con campo ${fieldName}, intentando siguiente...`);
                    continue;
                }
            }

            // Si no hay respuesta OK después de intentar todos los campos, verificar errores
            if (!response || !response.ok) {
                const error = await response?.json().catch(() => ({}));
                console.warn(`⚠️ Error en respuesta HTTP al buscar prospecto: ${response?.status} - ${error?.error?.message || 'Sin mensaje'}`);
                // Continuar en lugar de lanzar error - puede que simplemente no exista
            }
            
            if (data && data.records && data.records.length > 0) {
                // Si hay múltiples, tomar el más reciente
                const records = data.records.sort((a, b) => {
                    const timeA = new Date(a.createdTime || 0).getTime();
                    const timeB = new Date(b.createdTime || 0).getTime();
                    return timeB - timeA; // Más reciente primero
                });
                
                const prospect = this.transformAirtableProspect(records[0]);
                console.log('✅ Prospecto encontrado:', {
                    id: prospect.id,
                    nombre: prospect.nombre,
                    chatId: prospect.chatId,
                    totalEncontrados: data.records.length
                });
                
                // Si hay múltiples, advertir
                if (data.records.length > 1) {
                    console.warn(`⚠️ ATENCIÓN: Se encontraron ${data.records.length} prospectos duplicados con el mismo chat_id: ${chatId}`);
                }
                
                return {
                    success: true,
                    prospect: prospect
                };
            } else {
                // Log detallado para debug
                console.log(`⚠️ No se encontró prospecto con chat_id: ${chatId}`);
                console.log(`   - Buscado en campos: ${fieldNames.join(', ')}`);
                console.log(`   - Response status: ${response?.status || 'N/A'}`);
                console.log(`   - Data recibida:`, data);
                return {
                    success: false,
                    prospect: null
                };
            }

        } catch (error) {
            console.error('❌ Error buscando prospecto por chat_id:', error);
            return {
                success: false,
                error: error.message,
                prospect: null
            };
        }
    }

    async getProspectById(recordId) {
        try {
            console.log('🔍 Obteniendo prospecto por ID:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/Prospectos/${recordId}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error obteniendo prospecto');
            }

            const record = await response.json();
            console.log('📋 Record obtenido de Airtable (raw):', {
                id: record.id,
                campos: Object.keys(record.fields || {}),
                tieneComentarios: !!(record.fields && record.fields.comentarios),
                comentariosRaw: record.fields && record.fields.comentarios ? record.fields.comentarios.substring(0, 50) + '...' : null
            });
            
            const prospect = this.transformAirtableProspect(record);
            
            console.log('✅ Prospecto transformado:', {
                id: prospect.id,
                nombre: prospect.nombre,
                tieneComentarios: !!prospect.comentarios,
                comentariosLength: prospect.comentarios ? prospect.comentarios.length : 0,
                comentarios: prospect.comentarios ? prospect.comentarios.substring(0, 50) + '...' : null
            });
            
            return {
                success: true,
                prospect: prospect
            };

        } catch (error) {
            console.error('❌ Error obteniendo prospecto por ID:', error);
            return {
                success: false,
                error: error.message,
                prospect: null
            };
        }
    }

    async updateProspect(recordId, prospectData) {
        try {
            console.log('📝 Actualizando prospecto en Airtable:', recordId);
            
            const url = `${this.apiBase}/${this.baseId}/Prospectos/${recordId}`;
            
            // Actualizar campos
            const fields = {};
            if (prospectData.nombre !== undefined) fields['nombre'] = prospectData.nombre;
            if (prospectData.chatId !== undefined) fields['chat_id'] = prospectData.chatId;
            if (prospectData.fechaExtraccion !== undefined) fields['fecha_extraccion'] = prospectData.fechaExtraccion;
            
            // Actualizar imágenes como JSON string si existen
            if (prospectData.imagenesUrls !== undefined) {
                if (Array.isArray(prospectData.imagenesUrls) && prospectData.imagenesUrls.length > 0) {
                    fields['imagenes_urls'] = JSON.stringify(prospectData.imagenesUrls);
                } else {
                    fields['imagenes_urls'] = null; // Limpiar si está vacío
                }
            }
            
            // Actualizar documentos como JSON string si existen
            if (prospectData.documentosUrls !== undefined) {
                if (Array.isArray(prospectData.documentosUrls) && prospectData.documentosUrls.length > 0) {
                    fields['documentos_urls'] = JSON.stringify(prospectData.documentosUrls);
                } else {
                    fields['documentos_urls'] = null; // Limpiar si está vacío
                }
            }
            
            // Actualizar comentarios si existen
            if (prospectData.comentarios !== undefined) {
                fields['comentarios'] = prospectData.comentarios || '';
            }
            
            // Actualizar campos_solicitados si existen
            if (prospectData.campos_solicitados !== undefined) {
                if (typeof prospectData.campos_solicitados === 'string') {
                    fields['campos_solicitados'] = prospectData.campos_solicitados;
                } else if (typeof prospectData.campos_solicitados === 'object') {
                    fields['campos_solicitados'] = JSON.stringify(prospectData.campos_solicitados);
                }
            }

            const payload = { fields };

            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error actualizando prospecto');
            }

            const data = await response.json();
            console.log('✅ Prospecto actualizado:', data.id);
            
            return {
                success: true,
                prospect: this.transformAirtableProspect(data)
            };

        } catch (error) {
            console.error('❌ Error actualizando prospecto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    transformAirtableProspect(record) {
        if (!record || !record.fields) {
            console.error('❌ Record inválido:', record);
            return null;
        }

        const fields = record.fields;
        
        // Parsear URLs de imágenes y documentos
        let imagenesUrls = [];
        let documentosUrls = [];
        
        try {
            if (fields.imagenes_urls) {
                imagenesUrls = typeof fields.imagenes_urls === 'string' 
                    ? JSON.parse(fields.imagenes_urls) 
                    : fields.imagenes_urls;
            }
            if (fields.documentos_urls) {
                documentosUrls = typeof fields.documentos_urls === 'string' 
                    ? JSON.parse(fields.documentos_urls) 
                    : fields.documentos_urls;
            }
        } catch (e) {
            console.warn('⚠️ Error parseando URLs:', e);
        }
        
        // Parsear campos_solicitados
        let camposSolicitados = null;
        if (fields.campos_solicitados) {
            try {
                camposSolicitados = typeof fields.campos_solicitados === 'string'
                    ? JSON.parse(fields.campos_solicitados)
                    : fields.campos_solicitados;
            } catch (e) {
                console.warn('⚠️ Error parseando campos_solicitados:', e);
                camposSolicitados = fields.campos_solicitados; // Guardar como está si no es JSON válido
            }
        }

        return {
            id: record.id,
            nombre: fields.nombre || fields.A_nombre || fields['A nombre'] || '',
            chatId: fields.chat_id || fields.A_chat_id || fields['A chat_id'] || '',
            campos_solicitados: camposSolicitados,
            telefono: fields.telefono || '',
            canal: fields.canal || '',
            fechaExtraccion: fields.fecha_extraccion || fields.fecha_extraccion || '',
            fechaUltimoMensaje: fields.fecha_ultimo_mensaje || fields.fecha_ultimo_mensaje || '',
            estado: fields.estado || 'Nuevo',
            imagenesUrls: imagenesUrls,
            documentosUrls: documentosUrls,
            agenteId: fields.agente_id || '',
            notas: fields.notas || '',
            comentarios: fields.comentarios || '',
            createdTime: record.createdTime
        };
    }
}

// Crear instancia global
window.airtableService = new AirtableService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirtableService;
}

