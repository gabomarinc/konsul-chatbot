// Configuración de Stripe - ARCHIVO DE EJEMPLO
// Copia este archivo como stripe.config.js y reemplaza los valores con tus claves reales

const StripeConfig = {
    // Claves de Stripe - REEMPLAZAR CON TUS CLAVES REALES
    publishableKey: 'pk_live_tu_clave_publica_aqui',
    secretKey: 'sk_live_tu_clave_secreta_aqui',
    
    // Configuración de la API
    apiVersion: '2023-10-16',
    baseURL: 'https://api.stripe.com/v1',
    
    // Configuración del entorno
    environment: 'production', // 'development' o 'production'
    
    // URLs del backend (para llamadas seguras)
    backendURL: '/api/stripe', // URL base de tu backend
    
    // Configuración de webhooks
    webhookEndpoint: '/api/stripe/webhooks',
    
    // Configuración de productos y precios (IDs de Stripe)
    products: {
        premium: {
            id: 'prod_tu_id_de_producto_aqui', // Reemplazar con el ID real del producto
            name: 'Plan Premium',
            description: 'Plan premium con todas las funcionalidades'
        }
    },
    
    prices: {
        premiumMonthly: {
            id: 'price_tu_id_de_precio_aqui', // Reemplazar con el ID real del precio
            amount: 2999, // $29.99 en centavos
            currency: 'usd',
            interval: 'month'
        }
    }
};

// Función para obtener la configuración según el entorno
function getStripeConfig() {
    // En producción, las claves secretas nunca deben estar en el frontend
    // Solo devolvemos la configuración segura para el frontend
    if (StripeConfig.environment === 'production') {
        return {
            publishableKey: StripeConfig.publishableKey,
            apiVersion: StripeConfig.apiVersion,
            backendURL: StripeConfig.backendURL,
            webhookEndpoint: StripeConfig.webhookEndpoint,
            products: StripeConfig.products,
            prices: StripeConfig.prices
        };
    }
    
    // En desarrollo, devolvemos toda la configuración
    return StripeConfig;
}

// Función para obtener la clave secreta (solo para uso en backend)
function getSecretKey() {
    if (typeof window !== 'undefined') {
        console.warn('⚠️ ADVERTENCIA: La clave secreta no debe usarse en el frontend');
        return null;
    }
    return StripeConfig.secretKey;
}

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        StripeConfig,
        getStripeConfig,
        getSecretKey
    };
} else {
    // Navegador
    window.StripeConfig = {
        config: getStripeConfig(),
        getSecretKey: () => {
            console.warn('⚠️ ADVERTENCIA: La clave secreta no debe usarse en el frontend');
            return null;
        }
    };
}
