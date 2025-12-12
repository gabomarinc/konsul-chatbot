/**
 * API Endpoint para operaciones específicas de prospecto por ID
 * Ruta: /api/neon/prospectos/[id]
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
        // Obtener id de la URL
        const id = req.query.id || (req.url ? req.url.split('/').pop() : null);

        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'id es requerido'
            });
        }

        if (req.method === 'GET') {
            // Obtener prospecto por ID
            const query = 'SELECT * FROM prospectos WHERE id = $1 LIMIT 1';
            const result = await executeQuery(query, [id]);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Prospecto no encontrado'
                });
            }

        } else if (req.method === 'PATCH') {
            // Actualizar prospecto
            const updateFields = req.body;
            const allowedFields = [
                'nombre', 'chat_id', 'fecha_extraccion', 'user_email', 'workspace_id', 'user_id',
                'telefono', 'canal', 'fecha_ultimo_mensaje', 'estado',
                'imagenes_urls', 'documentos_urls', 'agente_id', 'notas', 'comentarios', 'campos_solicitados'
            ];

            const fieldsToUpdate = [];
            const values = [];
            let paramIndex = 1;

            for (const [key, value] of Object.entries(updateFields)) {
                if (allowedFields.includes(key)) {
                    // Manejar campos JSON
                    if (key === 'campos_solicitados' && typeof value !== 'string') {
                        fieldsToUpdate.push(`${key} = $${paramIndex++}`);
                        values.push(JSON.stringify(value));
                    } else if ((key === 'imagenes_urls' || key === 'documentos_urls') && Array.isArray(value)) {
                        fieldsToUpdate.push(`${key} = $${paramIndex++}`);
                        values.push(JSON.stringify(value));
                    } else {
                        fieldsToUpdate.push(`${key} = $${paramIndex++}`);
                        values.push(value);
                    }
                }
            }

            if (fieldsToUpdate.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No hay campos válidos para actualizar'
                });
            }

            values.push(id); // Para el WHERE

            const query = `
                UPDATE prospectos 
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
                    error: 'Prospecto no encontrado'
                });
            }

        } else if (req.method === 'DELETE') {
            // Eliminar prospecto
            const query = 'DELETE FROM prospectos WHERE id = $1 RETURNING id';
            const result = await executeQuery(query, [id]);

            if (result && result.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Prospecto eliminado correctamente'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Prospecto no encontrado'
                });
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/prospectos/[id]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

