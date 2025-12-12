/**
 * API Endpoint para actualizar contraseña de usuario
 * Ruta: /api/neon/users/[userId]/password
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
        const { password_hash } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'userId es requerido'
            });
        }

        if (!password_hash) {
            return res.status(400).json({
                success: false,
                error: 'password_hash es requerido'
            });
        }

        const query = `
            UPDATE users 
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING id
        `;

        const result = await executeQuery(query, [password_hash, userId]);

        if (result && result.length > 0) {
            return res.status(200).json({
                success: true,
                message: 'Contraseña actualizada correctamente'
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/users/[userId]/password:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

