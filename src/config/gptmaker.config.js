/**
 * Configuración de GPTMaker API
 * Este archivo maneja la configuración de la API de forma segura
 */

class GPTMakerConfig {
    constructor() {
        // Determinar baseURL según el ambiente
        // En producción/preview (Vercel), usar proxy para evitar CORS
        // En localhost, usar directamente (Vite tiene proxy configurado)
        let baseURL = 'https://api.gptmaker.ai';
        if (typeof window !== 'undefined') {
            const hostname = window.location.hostname;
            if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                // Producción/Preview: usar proxy de Vercel
                baseURL = '/api';
            }
        }
        
        this.config = {
            token: null,
            baseURL: baseURL,
            timeout: 30000, // 30 segundos
            retryAttempts: 3
        };
        
        this.loadConfig();
    }

    loadConfig() {
        try {
            // 1. Intentar cargar desde localStorage con clave gptmaker_token
            const savedToken = localStorage.getItem('gptmaker_token');
            if (savedToken) {
                this.config.token = savedToken;
                console.log('✅ Token cargado desde localStorage (gptmaker_token)');
                // También actualizar la configuración global
                if (window.GPTMAKER_CONFIG) {
                    window.GPTMAKER_CONFIG.token = savedToken;
                }
                return;
            }

            // 2. Intentar cargar desde localStorage con clave apiToken (compatibilidad)
            const apiToken = localStorage.getItem('apiToken');
            if (apiToken) {
                this.config.token = apiToken;
                // Migrar a gptmaker_token para consistencia
                localStorage.setItem('gptmaker_token', apiToken);
                console.log('✅ Token cargado desde localStorage (apiToken) y migrado a gptmaker_token');
                // También actualizar la configuración global
                if (window.GPTMAKER_CONFIG) {
                    window.GPTMAKER_CONFIG.token = apiToken;
                }
                return;
            }

            // 3. Intentar cargar desde configuración global
            if (window.GPTMAKER_CONFIG && window.GPTMAKER_CONFIG.token) {
                this.config.token = window.GPTMAKER_CONFIG.token;
                this.config.baseURL = window.GPTMAKER_CONFIG.baseURL || this.config.baseURL;
                // Guardar en localStorage para persistencia
                localStorage.setItem('gptmaker_token', window.GPTMAKER_CONFIG.token);
                console.log('✅ Configuración cargada desde window.GPTMAKER_CONFIG');
                return;
            }

            // 4. No hay token configurado - el usuario debe configurarlo desde el perfil
            console.log('ℹ️ No se encontró token configurado. Por favor, configura tu token desde la página de perfil.');
            this.config.token = null;
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            this.config.token = null;
        }
    }

    getToken() {
        return this.config.token;
    }

    getBaseURL() {
        return this.config.baseURL;
    }

    getTimeout() {
        return this.config.timeout;
    }

    getRetryAttempts() {
        return this.config.retryAttempts;
    }

    setToken(token) {
        this.config.token = token;
        if (token) {
            localStorage.setItem('gptmaker_token', token);
        } else {
            localStorage.removeItem('gptmaker_token');
        }
    }

    setBaseURL(baseURL) {
        this.config.baseURL = baseURL;
    }

    validateToken() {
        if (!this.config.token) {
            return { valid: false, error: 'No hay token configurado' };
        }

        try {
            // Decodificar JWT para verificar formato
            const parts = this.config.token.split('.');
            if (parts.length !== 3) {
                return { valid: false, error: 'Formato de token inválido' };
            }

            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < now) {
                return { valid: false, error: 'Token expirado' };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: 'Error validando token: ' + error.message };
        }
    }

    // Método para obtener configuración completa
    getConfig() {
        return { ...this.config };
    }

    // Método para actualizar configuración completa
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig.token) {
            this.setToken(newConfig.token);
        }
    }
    
    // Método para recargar la configuración (útil después de cambios)
    reloadConfig() {
        console.log('🔄 Recargando configuración de GPTMaker...');
        this.loadConfig();
        console.log('✅ Configuración recargada');
    }
}

// Crear instancia global
window.gptmakerConfig = new GPTMakerConfig();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPTMakerConfig;
}