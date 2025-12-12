/**
 * API Endpoint para obtener workspaces por user_id
 * Ruta: /api/neon/workspaces/user/[userId]
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

    try {
        // Obtener userId de la URL
        const userId = req.query.userId || (req.url ? req.url.split('/').pop() : null);

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId es requerido'
            });
        }

        if (req.method === 'GET') {
            // Obtener todos los workspaces del usuario
            const query = 'SELECT * FROM workspaces WHERE user_id = $1 ORDER BY created_at DESC';
            const result = await executeQuery(query, [userId]);

            return res.status(200).json({
                success: true,
                workspaces: result || []
            });

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/workspaces/user/[userId]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

