// Función serverless de Vercel para obtener información del cliente de Stripe
// Ruta: /api/stripe/customer/[customerId]

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

        console.log(`🔍 Obteniendo información del cliente: ${customerId}`);

        // Obtener información del cliente desde Stripe
        const customer = await stripe.customers.retrieve(customerId);

        console.log(`✅ Cliente obtenido: ${customer.id}`);

        // Devolver información del cliente
        return res.status(200).json(customer);

    } catch (error) {
        console.error('❌ Error obteniendo cliente de Stripe:', error);
        
        // Manejar errores específicos de Stripe
        if (error.type === 'StripeInvalidRequestError') {
            return res.status(404).json({ 
                error: 'Customer not found',
                message: error.message 
            });
        }

        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

