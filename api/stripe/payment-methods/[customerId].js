// Función serverless de Vercel para obtener métodos de pago del cliente de Stripe
// Ruta: /api/stripe/payment-methods/[customerId]

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Solo permitir método GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // En Vercel, el parámetro dinámico puede venir en req.query o en la URL
        let customerId = req.query.customerId;
        
        if (!customerId && req.url) {
            const urlParts = req.url.split('/');
            const customerIndex = urlParts.indexOf('payment-methods');
            if (customerIndex !== -1 && urlParts[customerIndex + 1]) {
                customerId = urlParts[customerIndex + 1];
            }
        }
        
        if (!customerId && req.query && Object.keys(req.query).length > 0) {
            const queryKeys = Object.keys(req.query);
            if (queryKeys.length === 1) {
                customerId = req.query[queryKeys[0]];
            }
        }

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        // Verificar autenticación (opcional pero recomendado)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log(`🔍 Obteniendo métodos de pago para cliente: ${customerId}`);

        // Obtener métodos de pago del cliente desde Stripe
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
            type: 'card'
        });

        console.log(`✅ ${paymentMethods.data.length} método(s) de pago encontrado(s)`);

        // Devolver métodos de pago
        return res.status(200).json(paymentMethods.data);

    } catch (error) {
        console.error('❌ Error obteniendo métodos de pago de Stripe:', error);
        
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

