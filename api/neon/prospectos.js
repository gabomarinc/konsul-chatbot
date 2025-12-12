/**
 * API Endpoint para CRUD de Prospectos
 * Ruta: /api/neon/prospectos
 */

const { executeQuery } = require('./db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Obtener prospectos con filtros opcionales
            const { user_email, workspace_id, user_id, limit, page_size } = req.query;
            
            let query = 'SELECT * FROM prospectos WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (user_email) {
                query += ` AND user_email = $${paramIndex++}`;
                params.push(user_email);
            }

            if (workspace_id) {
                query += ` AND workspace_id = $${paramIndex++}`;
                params.push(workspace_id);
            }

            if (user_id) {
                query += ` AND user_id = $${paramIndex++}`;
                params.push(user_id);
            }

            query += ' ORDER BY fecha_extraccion DESC, created_at DESC';

            if (limit) {
                query += ` LIMIT $${paramIndex++}`;
                params.push(parseInt(limit));
            } else if (page_size) {
                query += ` LIMIT $${paramIndex++}`;
                params.push(parseInt(page_size));
            }

            const prospectos = await executeQuery(query, params);
            
            return res.status(200).json({
                success: true,
                prospectos: prospectos || [],
                total: prospectos?.length || 0
            });

        } else if (req.method === 'POST') {
            // Crear nuevo prospecto
            const {
                nombre,
                chat_id,
                fecha_extraccion,
                user_email,
                workspace_id,
                user_id,
                telefono,
                canal,
                fecha_ultimo_mensaje,
                estado,
                imagenes_urls,
                documentos_urls,
                agente_id,
                notas,
                comentarios,
                campos_solicitados
            } = req.body;

            if (!nombre || !chat_id) {
                return res.status(400).json({
                    success: false,
                    error: 'nombre y chat_id son requeridos'
                });
            }

            // Verificar si ya existe un prospecto con este chat_id
            const existingQuery = 'SELECT id FROM prospectos WHERE chat_id = $1 LIMIT 1';
            const existing = await executeQuery(existingQuery, [chat_id]);
            
            if (existing && existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Ya existe un prospecto con este chat_id',
                    id: existing[0].id
                });
            }

            const query = `
                INSERT INTO prospectos (
                    nombre, chat_id, fecha_extraccion, user_email, workspace_id, user_id,
                    telefono, canal, fecha_ultimo_mensaje, estado,
                    imagenes_urls, documentos_urls, agente_id, notas, comentarios, campos_solicitados
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
                ) RETURNING *
            `;

            const params = [
                nombre,
                chat_id,
                fecha_extraccion || new Date().toISOString(),
                user_email || null,
                workspace_id || null,
                user_id || null,
                telefono || null,
                canal || null,
                fecha_ultimo_mensaje || null,
                estado || 'Nuevo',
                imagenes_urls || null,
                documentos_urls || null,
                agente_id || null,
                notas || null,
                comentarios || null,
                campos_solicitados ? (typeof campos_solicitados === 'string' ? campos_solicitados : JSON.stringify(campos_solicitados)) : null
            ];

            const result = await executeQuery(query, params);
            
            if (result && result.length > 0) {
                return res.status(201).json({
                    success: true,
                    ...result[0]
                });
            } else {
                throw new Error('No se pudo crear el prospecto');
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/prospectos:', error);
        
        // Manejar errores de constraint
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'Ya existe un prospecto con este chat_id'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

