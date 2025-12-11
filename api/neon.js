/**
 * API Endpoint para Neon PostgreSQL
 * Serverless Function para Vercel
 * 
 * Este endpoint actúa como proxy seguro entre el frontend y Neon
 */

const { neon } = require('@neondatabase/serverless');

// Configurar conexión a Neon desde variable de entorno
const sql = neon(process.env.NEON_DATABASE_URL);

export default async function handler(req, res) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Verificar que Neon esté configurado
    if (!process.env.NEON_DATABASE_URL) {
        console.error('❌ NEON_DATABASE_URL no configurada');
        return res.status(500).json({
            success: false,
            error: 'Neon database not configured'
        });
    }

    try {
        const { query, params } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log('📊 Ejecutando query en Neon:', query.substring(0, 100) + '...');

        // Ejecutar query
        const rows = await sql(query, params || []);

        console.log(`✅ Query ejecutada exitosamente, ${rows.length} filas retornadas`);

        return res.status(200).json({
            success: true,
            rows
        });

    } catch (error) {
        console.error('❌ Error en API Neon:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
