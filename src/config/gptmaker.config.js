/**
 * Configuración de GPTMaker API
 * Este archivo maneja la configuración de la API de forma segura
 */

class GPTMakerConfig {
    constructor() {
        this.config = {
            token: null,
            baseURL: 'https://api.gptmaker.ai',
            timeout: 30000, // 30 segundos
            retryAttempts: 3
        };
        
        this.loadConfig();
    }

    loadConfig() {
        try {
            // Intentar cargar desde localStorage primero
            const savedToken = localStorage.getItem('gptmaker_token');
            if (savedToken) {
                this.config.token = savedToken;
                console.log('✅ Token cargado desde localStorage');
                return;
            }

            // Intentar cargar desde configuración global
            if (window.GPTMAKER_CONFIG && window.GPTMAKER_CONFIG.token) {
                this.config.token = window.GPTMAKER_CONFIG.token;
                this.config.baseURL = window.GPTMAKER_CONFIG.baseURL || this.config.baseURL;
                console.log('✅ Configuración cargada desde window.GPTMAKER_CONFIG');
                return;
            }

            // Token por defecto para desarrollo
            this.config.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJncHRtYWtlciIsImlkIjoiM0U2MTZFMDQ2RDI3RTFDQjYyM0JGRTVFOUE2RTlCREUiLCJ0ZW5hbnQiOiIzRTYxNkUwNDZEMjdFMUNCNjIzQkZFNUU5QTZFOUJERSIsInV1aWQiOiJjMDU1NGM1Yy1mYjhiLTQ5YjUtOGRhMy1mZGEzMTc1MGZlZDgifQ.el1Rog4MU6G0UJ8tBzsWhhnecYoZ6n7nUFC-6l1VpJE';
            console.log('⚠️ Usando token por defecto para desarrollo');
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
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
}

// Crear instancia global
window.gptmakerConfig = new GPTMakerConfig();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GPTMakerConfig;
}