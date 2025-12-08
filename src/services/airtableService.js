class AirtableService {
    constructor() {
        // Configuración de Airtable
        this.baseId = 'appoqCG814jMJbf4X';
        this.apiKey = null; // Se cargará desde variables de entorno o configuración
        this.apiBase = 'https://api.airtable.com/v0';
        this.tableName = 'Users'; // Nombre de la tabla en Airtable
        
        console.log('🗄️ AirtableService inicializado');
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

            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (userData.ownerRecordId) {
                body.fields['team_owner_email'] = [userData.ownerRecordId];
            } else if (userData.teamOwnerEmail || userData.email) {
                body.fields['team_owner_email'] = userData.teamOwnerEmail || userData.email;
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error creando usuario en Airtable');
            }

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
            const formula = encodeURIComponent(`{email} = '${email}'`);
            const url = `${this.apiBase}/${this.baseId}/${this.tableName}?filterByFormula=${formula}`;
            
            console.log('📡 URL de Airtable:', url);
            console.log('🔑 Headers:', this.getHeaders());
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Error de Airtable:', error);
                throw new Error(error.error?.message || 'Error buscando usuario en Airtable');
            }

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
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
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
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({ fields })
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
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: {
                        'password_hash': newPassword // Nota: Considerar hashear la contraseña
                    }
                })
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
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: {
                        'last_login': new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.warn('⚠️ No se pudo actualizar last_login (puede que el campo no exista):', error);
                // No fallar si este campo no existe
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

    async createProspect(prospectData) {
        try {
            console.log('📝 Creando prospecto en Airtable:', prospectData.nombre);
            
            const url = `${this.apiBase}/${this.baseId}/Prospectos`;
            
            // Campos obligatorios
            const fields = {
                'nombre': prospectData.nombre || '',
                'chat_id': prospectData.chatId || '',
                'fecha_extraccion': prospectData.fechaExtraccion || new Date().toISOString()
            };

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

            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error creando prospecto en Airtable');
            }

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

    async getAllProspects(options = {}) {
        try {
            console.log('🔍 Obteniendo todos los prospectos de Airtable...');
            
            let url = `${this.apiBase}/${this.baseId}/Prospectos`;
            const params = [];
            
            if (options.maxRecords) params.push(`maxRecords=${options.maxRecords}`);
            if (options.pageSize) params.push(`pageSize=${options.pageSize}`);
            if (options.view) params.push(`view=${encodeURIComponent(options.view)}`);
            
            if (params.length > 0) {
                url += '?' + params.join('&');
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'Error obteniendo prospectos');
            }

            const data = await response.json();
            console.log(`✅ ${data.records.length} prospectos obtenidos de Airtable`);
            
            const prospects = data.records
                .map(record => this.transformAirtableProspect(record))
                .filter(prospect => prospect !== null);

            return {
                success: true,
                data: prospects,
                total: prospects.length,
                source: 'airtable'
            };

        } catch (error) {
            console.error('❌ Error obteniendo prospectos de Airtable:', error);
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
                    const url = `${this.apiBase}/${this.baseId}/Prospectos?filterByFormula=${formula}`;
                    
                    response = await fetch(url, {
                        method: 'GET',
                        headers: this.getHeaders()
                    });

                    if (response.ok) {
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
        
        return {
            id: record.id,
            nombre: fields.nombre || fields.A_nombre || fields['A nombre'] || '',
            chatId: fields.chat_id || fields.A_chat_id || fields['A chat_id'] || '',
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

