/**
 * API Endpoint para buscar usuario por email
 * Ruta: /api/neon/users/email/[email]
 */

const { executeQuery } = require('../../db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Obtener email de la URL
        let email = req.query.email;
        
        if (!email && req.url) {
            const urlParts = req.url.split('/');
            const emailIndex = urlParts.indexOf('email');
            if (emailIndex !== -1 && urlParts[emailIndex + 1]) {
                email = decodeURIComponent(urlParts[emailIndex + 1]);
            }
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email es requerido'
            });
        }

        const query = 'SELECT * FROM users WHERE email = $1 LIMIT 1';
        const result = await executeQuery(query, [email]);

        if (result && result.length > 0) {
            return res.status(200).json(result[0]);
        } else {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/users/email/[email]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

