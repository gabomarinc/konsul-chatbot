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
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    fields: {
                        'email': userData.email,
                        'first_name': userData.firstName || userData.name?.split(' ')[0] || '',
                        'last_name': userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
                        'password_hash': userData.password, // Nota: Considerar hashear la contraseña
                        'role': userData.role || 'user',
                        'status': 'active',
                        'has_paid': userData.hasPaid || false,
                        // Campos para gestión de equipo (se crean si no existen)
                        'is_team_member': userData.isTeamMember || false,
                        'team_owner_email': userData.teamOwnerEmail || userData.email || '',
                        'member_role': userData.memberRole || ''
                    }
                })
            });

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
            teamOwnerEmail: fields.team_owner_email || fields.email || '',
            memberRole: fields.member_role || ''
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

            const payload = {
                email: memberData.email,
                name: memberData.name,
                firstName: memberData.firstName,
                lastName: memberData.lastName,
                role: 'user',
                status: 'active',
                isTeamMember: true,
                teamOwnerEmail: ownerEmail,
                memberRole: memberData.role || 'agent'
            };

            const result = await this.createUser(payload);
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
}

// Crear instancia global
window.airtableService = new AirtableService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AirtableService;
}

