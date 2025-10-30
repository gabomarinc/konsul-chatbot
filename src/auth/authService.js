class AuthService {
    constructor() {
        this.apiBase = '/api/auth';
        this.currentUser = null;
        this.token = null;
        this.useAirtable = true; // Flag para usar Airtable o datos mock
        this.init();
    }

    init() {
        console.log('🔧 Inicializando AuthService...');
        
        // Determinar modo de operación (Airtable vs Mock) ANTES de validar
        // Verificar si AirtableService está disponible
        if (this.useAirtable && !window.airtableService) {
            console.warn('⚠️ AirtableService no está disponible, usando datos mock');
            this.useAirtable = false;
        }
        
        // Forzar uso de datos mock para desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🏠 Modo desarrollo detectado, usando datos mock');
            this.useAirtable = false;
        }

        // Cargar datos de autenticación desde localStorage
        this.loadAuthData();
        
        console.log('📊 Estado después de cargar datos:', {
            hasUser: !!this.currentUser,
            userId: this.currentUser?.id,
            hasToken: !!this.token
        });
        
        // Verificar si el token es válido al cargar (solo en modo Airtable/API)
        if (this.token && this.useAirtable) {
            this.validateToken();
        }
        
        console.log('✅ AuthService inicializado');
    }

    setAirtableApiKey(apiKey) {
        if (window.airtableService) {
            window.airtableService.setApiKey(apiKey);
            this.useAirtable = true;
            console.log('✅ Airtable configurado para autenticación');
        }
    }

    // ===== MÉTODOS DE AUTENTICACIÓN =====

    async login(email, password, rememberMe = false) {
        try {
            console.log('🔐 Iniciando proceso de login...');
            
            let user, token;
            
            if (this.useAirtable && window.airtableService) {
                // === AUTENTICACIÓN CON AIRTABLE ===
                console.log('🗄️ Autenticando con Airtable...');
                console.log('📧 Email:', email);
                console.log('🔐 Password length:', password ? password.length : 0);
                console.log('🔑 API Key configurada:', !!window.airtableService.apiKey);
                
                // Verificar que Airtable esté configurado
                if (!window.airtableService.apiKey) {
                    console.error('❌ API Key de Airtable no configurada');
                    throw new Error('Servicio de autenticación no configurado');
                }
                
                // Buscar usuario en Airtable
                const result = await window.airtableService.getUserByEmail(email);
                
                console.log('📊 Resultado de búsqueda:', result);
                
                if (!result.success) {
                    console.error('❌ Error en búsqueda de usuario:', result.error);
                    throw new Error(result.error || 'Error de conexión con el servidor');
                }
                
                if (!result.user) {
                    console.error('❌ Usuario no encontrado en Airtable');
                    throw new Error('Usuario no encontrado');
                }
                
                user = result.user;
                console.log('👤 Usuario encontrado:', {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    hasPassword: !!user.password,
                    passwordLength: user.password ? user.password.length : 0
                });
                
                // Verificar contraseña
                const passwordMatch = window.airtableService.verifyPassword(user.password, password);
                console.log('🔐 Verificación de contraseña:', passwordMatch ? 'CORRECTA ✓' : 'INCORRECTA ✗');
                
                if (!passwordMatch) {
                    console.error('❌ Contraseña incorrecta');
                    throw new Error('Contraseña incorrecta');
                }
                
                // Actualizar última sesión en Airtable
                await window.airtableService.updateLastLogin(user.id);
                
                // Generar token (usar el ID de Airtable)
                token = this.generateToken(user);
                
            } else {
                // === AUTENTICACIÓN CON DATOS MOCK ===
                console.log('🧪 Autenticando con datos mock...');
                
                // Simular delay de API
                await window.mockAuthData.simulateApiDelay(1000);
                
                // Buscar usuario en datos mock
                user = window.mockAuthData.findUserByEmail(email);
                
                if (!user) {
                    throw new Error('Credenciales inválidas');
                }
                
                if (!window.mockAuthData.verifyPassword(user, password)) {
                    throw new Error('Credenciales inválidas');
                }
                
                // Generar token mock
                token = window.mockAuthData.generateMockToken(user);
            }
            
            // Preparar datos del usuario (sin contraseña)
            const userData = { ...user };
            delete userData.password;

            // Guardar datos de autenticación
            this.currentUser = userData;
            this.token = token;
            
            // Guardar en localStorage
            this.saveAuthData(rememberMe);
            
            console.log('✅ Login exitoso:', this.currentUser.email);
            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('❌ Error en login:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    generateToken(user) {
        // Generar un token simple basado en el ID del usuario y timestamp
        const payload = {
            userId: user.id,
            email: user.email,
            timestamp: Date.now()
        };
        // En producción, usar JWT
        return btoa(JSON.stringify(payload));
    }

    async logout() {
        try {
            console.log('🔐 Cerrando sesión...');
            
            // Notificar al servidor sobre el logout
            if (this.token) {
                await fetch(`${this.apiBase}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Limpiar datos locales
            this.clearAuthData();
            
            console.log('✅ Logout exitoso');
            return { success: true };

        } catch (error) {
            console.error('❌ Error en logout:', error);
            // Limpiar datos locales aunque falle el logout en el servidor
            this.clearAuthData();
            return { success: true };
        }
    }

    async register(userData) {
        try {
            console.log('📝 Registrando nuevo usuario...');
            
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userData,
                    email: userData.email.toLowerCase().trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }

            console.log('✅ Registro exitoso');
            return { success: true, user: data.user };

        } catch (error) {
            console.error('❌ Error en registro:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            console.log('🔐 Cambiando contraseña...');
            
            if (this.useAirtable && window.airtableService && this.currentUser.email) {
                // === CAMBIAR CONTRASEÑA EN AIRTABLE ===
                console.log('🗄️ Cambiando contraseña en Airtable...');
                console.log('📧 Email del usuario:', this.currentUser.email);
                
                // Buscar usuario por email
                const userResult = await window.airtableService.getUserByEmail(this.currentUser.email);
                
                if (!userResult.success || !userResult.user) {
                    throw new Error('No se pudo encontrar el usuario en Airtable');
                }
                
                const userId = userResult.user.id;
                console.log('🆔 ID encontrado:', userId);
                
                // Verificar contraseña actual
                if (!window.airtableService.verifyPassword(userResult.user.password, currentPassword)) {
                    throw new Error('Contraseña actual incorrecta');
                }
                
                // Actualizar la contraseña
                const result = await window.airtableService.updatePassword(userId, newPassword);
                
                if (!result.success) {
                    throw new Error(result.error || 'Error al cambiar contraseña');
                }
                
                console.log('✅ Contraseña cambiada en Airtable');
                return { success: true };
                
            } else {
                // === CAMBIAR CONTRASEÑA CON API TRADICIONAL ===
                const response = await fetch(`${this.apiBase}/change-password`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al cambiar contraseña');
                }

                console.log('✅ Contraseña cambiada exitosamente');
                return { success: true };
            }

        } catch (error) {
            console.error('❌ Error al cambiar contraseña:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async updateProfile(profileData) {
        try {
            console.log('👤 Actualizando perfil...');
            console.log('📊 Datos del perfil a actualizar:', profileData);
            
            if (this.useAirtable && window.airtableService) {
                // === ACTUALIZAR EN AIRTABLE ===
                console.log('🗄️ Actualizando perfil en Airtable...');
                
                // Obtener email del profileData (que viene del formulario)
                const userEmail = profileData.email;
                
                if (!userEmail) {
                    throw new Error('Email no disponible');
                }
                
                console.log('📧 Email del usuario:', userEmail);
                
                // Buscar usuario por email
                const userResult = await window.airtableService.getUserByEmail(userEmail);
                
                if (!userResult.success || !userResult.user) {
                    throw new Error('No se pudo encontrar el usuario en Airtable');
                }
                
                const userId = userResult.user.id;
                console.log('🆔 ID encontrado:', userId);
                
                // Actualizar usuario con el ID encontrado
                const result = await window.airtableService.updateUser(userId, profileData);
                
                if (!result.success) {
                    throw new Error(result.error || 'Error al actualizar perfil');
                }
                
                // Actualizar datos locales con los datos de Airtable
                const updatedUser = { ...result.user };
                delete updatedUser.password;
                
                this.currentUser = updatedUser;
                this.saveAuthData();
                
                console.log('✅ Perfil actualizado en Airtable');
                console.log('👤 Usuario actualizado en authService:', this.currentUser);
                return { success: true, user: this.currentUser };
                
            } else {
                // === ACTUALIZAR CON API TRADICIONAL ===
                const response = await fetch(`${this.apiBase}/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Error al actualizar perfil');
                }

                // Actualizar datos locales
                this.currentUser = { ...this.currentUser, ...data.user };
                this.saveAuthData();
                
                console.log('✅ Perfil actualizado exitosamente');
                return { success: true, user: this.currentUser };
            }

        } catch (error) {
            console.error('❌ Error al actualizar perfil:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async forgotPassword(email) {
        try {
            console.log('🔐 Enviando email de recuperación...');
            
            const response = await fetch(`${this.apiBase}/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email.toLowerCase().trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al enviar email');
            }

            console.log('✅ Email de recuperación enviado');
            return { success: true };

        } catch (error) {
            console.error('❌ Error al enviar email:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async validateToken() {
        try {
            if (!this.token) return false;
            // En modo mock no validamos contra la API, asumimos válido si no ha expirado
            if (!this.useAirtable) {
                return true;
            }

            const response = await fetch(`${this.apiBase}/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                return true;
            } else {
                this.clearAuthData();
                return false;
            }

        } catch (error) {
            console.error('❌ Error validando token:', error);
            this.clearAuthData();
            return false;
        }
    }

    // ===== MÉTODOS DE GESTIÓN DE DATOS =====

    saveAuthData(rememberMe = false) {
        const authData = {
            user: this.currentUser,
            token: this.token,
            timestamp: Date.now()
        };

        console.log('💾 Guardando datos de autenticación:', {
            hasUser: !!authData.user,
            userId: authData.user?.id,
            userEmail: authData.user?.email,
            rememberMe: rememberMe
        });

        if (rememberMe) {
            // Guardar por 30 días
            localStorage.setItem('authData', JSON.stringify(authData));
        } else {
            // Guardar solo para la sesión actual
            sessionStorage.setItem('authData', JSON.stringify(authData));
        }
    }

    loadAuthData() {
        // Intentar cargar desde localStorage primero
        let authData = localStorage.getItem('authData');
        
        if (!authData) {
            // Si no hay en localStorage, intentar desde sessionStorage
            authData = sessionStorage.getItem('authData');
        }

        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                this.currentUser = parsed.user;
                this.token = parsed.token;

                console.log('📂 Datos cargados desde storage:', {
                    user: this.currentUser,
                    hasId: !!this.currentUser?.id,
                    userId: this.currentUser?.id
                });

                // Verificar si el token no ha expirado (24 horas)
                const tokenAge = Date.now() - parsed.timestamp;
                const maxAge = 24 * 60 * 60 * 1000; // 24 horas

                if (tokenAge > maxAge) {
                    console.log('⚠️ Token expirado, limpiando datos');
                    this.clearAuthData();
                }
            } catch (error) {
                console.error('❌ Error cargando datos de auth:', error);
                this.clearAuthData();
            }
        } else {
            console.log('⚠️ No hay datos de autenticación en storage');
        }
    }

    clearAuthData() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('authData');
        sessionStorage.removeItem('authData');
    }

    // ===== MÉTODOS DE UTILIDAD =====

    isAuthenticated() {
        return !!(this.currentUser && this.token);
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // ===== MÉTODOS DE FACTURACIÓN =====

    async getBillingInfo() {
        try {
            console.log('💳 Obteniendo información de facturación...');
            
            // Simular delay de API
            await window.mockAuthData.simulateApiDelay(500);
            
            // Retornar datos mock
            return { success: true, billing: window.mockAuthData.MOCK_BILLING };

        } catch (error) {
            console.error('❌ Error obteniendo facturación:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async getInvoices(page = 1, limit = 10) {
        try {
            console.log('📄 Obteniendo facturas...');
            
            // Simular delay de API
            await window.mockAuthData.simulateApiDelay(500);
            
            // Calcular paginación
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const invoices = window.mockAuthData.MOCK_INVOICES.slice(startIndex, endIndex);
            
            const pagination = {
                page,
                limit,
                total: window.mockAuthData.MOCK_INVOICES.length,
                totalPages: Math.ceil(window.mockAuthData.MOCK_INVOICES.length / limit)
            };

            return { success: true, invoices, pagination };

        } catch (error) {
            console.error('❌ Error obteniendo facturas:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }

    async updatePaymentMethod(paymentMethod) {
        try {
            console.log('💳 Actualizando método de pago...');
            
            const response = await fetch(`${this.apiBase}/payment-method`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(paymentMethod)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar método de pago');
            }

            return { success: true };

        } catch (error) {
            console.error('❌ Error actualizando método de pago:', error);
            return { 
                success: false, 
                error: error.message || 'Error de conexión'
            };
        }
    }
}

// Crear instancia global
window.authService = new AuthService();
