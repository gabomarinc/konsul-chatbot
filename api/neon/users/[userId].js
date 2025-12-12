/**
 * API Endpoint para operaciones específicas de usuario
 * Ruta: /api/neon/users/[userId]
 */

const { executeQuery } = require('../db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
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
            // Obtener usuario por ID
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await executeQuery(query, [userId]);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

        } else if (req.method === 'PATCH') {
            // Actualizar usuario
            const updateFields = req.body;
            const allowedFields = [
                'email', 'first_name', 'last_name', 'empresa', 'phone',
                'profile_image', 'role', 'status', 'has_paid', 'token_api',
                'stripe_customer_id', 'is_team_member', 'team_owner_email', 'member_role'
            ];

            const fieldsToUpdate = [];
            const values = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(updateFields)) {
                if (allowedFields.includes(key)) {
                    fieldsToUpdate.push(`${key} = $${paramIndex++}`);
                    values.push(value);
                }
            }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No hay campos válidos para actualizar'
                });
            }

            values.push(userId); // Para el WHERE

            const query = `
                UPDATE users 
                SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await executeQuery(query, values);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

        } else if (req.method === 'DELETE') {
            // Eliminar usuario
            const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
            const result = await executeQuery(query, [userId]);

            if (result && result.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Usuario eliminado correctamente'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Usuario no encontrado'
                });
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/users/[userId]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

