// Función serverless de Vercel para obtener suscripciones del cliente de Stripe
// Ruta: /api/stripe/subscriptions/[customerId]

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Solo permitir método GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { customerId } = req.query;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        // Verificar autenticación (opcional pero recomendado)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log(`🔍 Obteniendo suscripciones para cliente: ${customerId}`);

        // Obtener suscripciones del cliente desde Stripe
        // Expandir el producto para obtener nombre y descripción reales
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'all', // Obtener todas las suscripciones (active, canceled, etc.)
            expand: [
                'data.default_payment_method',
                'data.items.data.price.product' // Expandir el producto para obtener nombre y descripción
            ]
        });

        console.log(`✅ ${subscriptions.data.length} suscripción(es) encontrada(s)`);

        // Devolver suscripciones
        return res.status(200).json(subscriptions.data);

    } catch (error) {
        console.error('❌ Error obteniendo suscripciones de Stripe:', error);
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

