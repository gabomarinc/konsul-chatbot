/**
 * API Endpoint para CRUD de Workspaces
 * Ruta: /api/neon/workspaces
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
            // Obtener workspaces con filtros opcionales
            const { user_id, workspace_id, status, limit } = req.query;
            
            let query = 'SELECT * FROM workspaces WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (user_id) {
                query += ` AND user_id = $${paramIndex++}`;
                params.push(user_id);
            }

            if (workspace_id) {
                query += ` AND workspace_id = $${paramIndex++}`;
                params.push(workspace_id);
            }

            if (status) {
                query += ` AND status = $${paramIndex++}`;
                params.push(status);
            }

            query += ' ORDER BY created_at DESC';

            if (limit) {
                query += ` LIMIT $${paramIndex++}`;
                params.push(parseInt(limit));
            }

            const workspaces = await executeQuery(query, params);
            
            return res.status(200).json({
                success: true,
                workspaces: workspaces
            });

        } else if (req.method === 'POST') {
            // Crear nuevo workspace
            const {
                workspace_id,
                name,
                user_id,
                credits = 0,
                status = 'active'
            } = req.body;

            if (!workspace_id || !name) {
                return res.status(400).json({
                    success: false,
                    error: 'workspace_id y name son requeridos'
                });
            }

            const query = `
                INSERT INTO workspaces (
                    workspace_id, name, user_id, credits, status
                ) VALUES (
                    $1, $2, $3, $4, $5
                ) RETURNING *
            `;

            const params = [
                workspace_id,
                name,
                user_id || null,
                credits,
                status
            ];

            const result = await executeQuery(query, params);
            
            if (result && result.length > 0) {
                return res.status(201).json({
                    success: true,
                    ...result[0]
                });
            } else {
                throw new Error('No se pudo crear el workspace');
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/workspaces:', error);
        
        // Manejar errores de constraint (workspace_id duplicado, etc.)
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'El workspace_id ya existe'
            });
        }

        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                error: 'El user_id no existe'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

