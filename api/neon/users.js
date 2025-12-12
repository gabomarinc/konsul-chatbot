/**
 * API Endpoint para CRUD de Usuarios
 * Ruta: /api/neon/users
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
            // Obtener todos los usuarios con filtros opcionales
            const { limit, role, status } = req.query;
            
            let query = 'SELECT * FROM users WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            if (role) {
                query += ` AND role = $${paramIndex++}`;
                params.push(role);
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

            const users = await executeQuery(query, params);
            
            return res.status(200).json({
                success: true,
                users: users
            });

        } else if (req.method === 'POST') {
            // Crear nuevo usuario
            const {
                email,
                first_name,
                last_name,
                password_hash,
                role = 'user',
                status = 'active',
                empresa,
                phone,
                profile_image,
                has_paid = false,
                token_api,
                stripe_customer_id,
                is_team_member = false,
                team_owner_email,
                member_role
            } = req.body;

            if (!email || !password_hash) {
                return res.status(400).json({
                    success: false,
                    error: 'Email y password_hash son requeridos'
                });
            }

            const query = `
                INSERT INTO users (
                    email, first_name, last_name, password_hash, role, status,
                    empresa, phone, profile_image, has_paid, token_api,
                    stripe_customer_id, is_team_member, team_owner_email, member_role
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING *
            `;

            const params = [
                email, first_name || '', last_name || '', password_hash, role, status,
                empresa || null, phone || null, profile_image || null, has_paid,
                token_api || null, stripe_customer_id || null, is_team_member,
                team_owner_email || null, member_role || null
            ];

            const result = await executeQuery(query, params);
            
            if (result && result.length > 0) {
                return res.status(201).json({
                    success: true,
                    id: result[0].id,
                    ...result[0]
                });
            } else {
                throw new Error('No se pudo crear el usuario');
            }

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }

    } catch (error) {
        console.error('❌ Error en /api/neon/users:', error);
        
        // Manejar errores de constraint (email duplicado, etc.)
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

