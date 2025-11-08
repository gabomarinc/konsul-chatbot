const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { customerId, returnUrl } = req.body || {};

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || `${req.headers.origin || ''}/profile.html`
        });

        return res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('❌ Error creando sesión del portal de facturación:', error);

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

