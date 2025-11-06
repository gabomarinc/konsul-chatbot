// Función serverless de Vercel para obtener información del cliente de Stripe
// Ruta: /api/stripe/customer/[customerId]

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    // Log de la petición completa para debugging
    console.log('📥 Petición recibida:', {
        method: req.method,
        url: req.url,
        path: req.path || 'N/A',
        query: req.query,
        headers: {
            authorization: req.headers.authorization ? 'Presente' : 'Ausente',
            'content-type': req.headers['content-type']
        }
    });
    
    // Solo permitir método GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // En Vercel, el parámetro dinámico puede venir en req.query o en la URL
        // Intentar obtener de query primero, luego de la URL
        let customerId = req.query.customerId;
        
        // Si no está en query, intentar extraer de la URL
        if (!customerId && req.url) {
            const urlParts = req.url.split('/');
            const customerIndex = urlParts.indexOf('customer');
            if (customerIndex !== -1 && urlParts[customerIndex + 1]) {
                customerId = urlParts[customerIndex + 1];
            }
        }
        
        // También verificar si viene directamente como parámetro de ruta
        if (!customerId && req.query && Object.keys(req.query).length > 0) {
            // Si hay un solo parámetro en query, usarlo
            const queryKeys = Object.keys(req.query);
            if (queryKeys.length === 1) {
                customerId = req.query[queryKeys[0]];
            }
        }

        if (!customerId) {
            console.error('❌ Customer ID no encontrado en:', {
                query: req.query,
                url: req.url,
                method: req.method
            });
            return res.status(400).json({ 
                error: 'Customer ID is required',
                debug: {
                    query: req.query,
                    url: req.url
                }
            });
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

