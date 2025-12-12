/**
 * API Endpoint para operaciones específicas de workspace por workspace_id
 * Ruta: /api/neon/workspaces/workspace/[workspaceId]
 */

const { executeQuery } = require('../../db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Obtener workspaceId de la URL
        const workspaceId = req.query.workspaceId || (req.url ? req.url.split('/').pop() : null);

        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                error: 'workspaceId es requerido'
            });
        }

        if (req.method === 'GET') {
            // Obtener workspace por workspace_id
            const query = 'SELECT * FROM workspaces WHERE workspace_id = $1 LIMIT 1';
            const result = await executeQuery(query, [workspaceId]);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Workspace no encontrado'
                });
            }

        } else if (req.method === 'PATCH') {
            // Actualizar workspace
            const updateFields = req.body;
            const allowedFields = [
                'name', 'user_id', 'credits', 'status'
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

            values.push(workspaceId); // Para el WHERE

            const query = `
                UPDATE workspaces 
                SET ${fieldsToUpdate.join(', ')}, updated_at = CURRENT_TIMESTAMP
                WHERE workspace_id = $${paramIndex}
                RETURNING *
            `;

            const result = await executeQuery(query, values);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Workspace no encontrado'
                });
            }

        } else if (req.method === 'DELETE') {
            // Eliminar workspace
            const query = 'DELETE FROM workspaces WHERE workspace_id = $1 RETURNING id';
            const result = await executeQuery(query, [workspaceId]);

            if (result && result.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Workspace eliminado correctamente'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Workspace no encontrado'
                });
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/workspaces/workspace/[workspaceId]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

