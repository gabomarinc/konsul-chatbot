/**
 * API Endpoint para obtener prospecto por chat_id
 * Ruta: /api/neon/prospectos/chat/[chatId]
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
        // Obtener chatId de la URL
        const chatId = req.query.chatId || (req.url ? req.url.split('/').pop() : null);

        if (!chatId) {
            return res.status(400).json({
                success: false,
                error: 'chatId es requerido'
            });
        }

        if (req.method === 'GET') {
            // Obtener prospecto por chat_id
            const query = 'SELECT * FROM prospectos WHERE chat_id = $1 LIMIT 1';
            const result = await executeQuery(query, [chatId]);

            if (result && result.length > 0) {
                return res.status(200).json(result[0]);
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
        console.error('❌ Error en /api/neon/prospectos/chat/[chatId]:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Error interno del servidor'
        });
    }
};

