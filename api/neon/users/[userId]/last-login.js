/**
 * API Endpoint para actualizar última sesión de usuario
 * Ruta: /api/neon/users/[userId]/last-login
 */

const { executeQuery } = require('../../db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PATCH') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        // Obtener userId de la URL
        const userId = req.query.userId || (req.url ? req.url.split('/')[2] : null);

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId es requerido'
            });
        }

        const query = `
            UPDATE users 
            SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;

        const result = await executeQuery(query, [userId]);

        if (result && result.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Última sesión actualizada'
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/users/[userId]/last-login:', error);
        // No fallar si esto falla, solo loguear
        return res.status(200).json({
            success: true,
            message: 'Operación completada'
        });
    }
};

