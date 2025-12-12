/**
 * API Endpoint para crear múltiples prospectos en lote
 * Ruta: /api/neon/prospectos/batch
 */

const { executeQuery } = require('../db');

module.exports = async (req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            const { records } = req.body;

            if (!Array.isArray(records) || records.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'records debe ser un array no vacío'
                });
            }

            const created = [];
            const errors = [];

            // Procesar cada registro
            for (const record of records) {
                try {
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
                    } = record;

                    if (!nombre || !chat_id) {
                        errors.push({
                            record,
                            error: 'nombre y chat_id son requeridos'
                        });
                        continue;
                    }

                    // Verificar si ya existe
                    const existingQuery = 'SELECT id FROM prospectos WHERE chat_id = $1 LIMIT 1';
                    const existing = await executeQuery(existingQuery, [chat_id]);
                    
                    if (existing && existing.length > 0) {
                        // Ya existe, agregar a creados pero marcado como existente
                        created.push({
                            ...existing[0],
                            alreadyExists: true
                        });
                        continue;
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
                        created.push(result[0]);
                    } else {
                        errors.push({
                            record,
                            error: 'No se pudo crear el prospecto'
                        });
                    }

                } catch (error) {
                    console.error('❌ Error creando prospecto en batch:', error);
                    errors.push({
                        record,
                        error: error.message || 'Error desconocido'
                    });
                }
            }

            return res.status(200).json({
                success: true,
                prospects: created,
                created: created,
                errors: errors,
                createdCount: created.length,
                errorCount: errors.length,
                total: records.length
            });

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/prospectos/batch:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

