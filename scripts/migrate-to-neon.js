/**
 * Script para migrar prospectos de Airtable a Neon PostgreSQL
 * 
 * Uso:
 *   node scripts/migrate-to-neon.js
 * 
 * Requiere:
 *   - AIRTABLE_API_KEY en .env
 *   - NEON_DATABASE_URL en .env
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = 'appoqCG814jMJbf4X';
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!AIRTABLE_API_KEY) {
    console.error('❌ AIRTABLE_API_KEY no configurada en .env');
    process.exit(1);
}

if (!NEON_DATABASE_URL) {
    console.error('❌ NEON_DATABASE_URL no configurada en .env');
    process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

async function migrateProspects() {
    try {
        console.log('🚀 Iniciando migración de prospectos de Airtable a Neon...\n');

        // 1. Obtener todos los prospectos de Airtable
        console.log('📥 Obteniendo prospectos de Airtable...');
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Prospectos`;
        
        let allProspects = [];
        let offset = null;
        
        do {
            const url = offset 
                ? `${airtableUrl}?offset=${offset}`
                : airtableUrl;
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error obteniendo prospectos: ${response.status}`);
            }

            const data = await response.json();
            allProspects = allProspects.concat(data.records);
            offset = data.offset;
            
            console.log(`  ✅ Obtenidos ${allProspects.length} prospectos hasta ahora...`);
        } while (offset);

        console.log(`\n✅ Total de prospectos obtenidos: ${allProspects.length}\n`);

        // 2. Crear tabla si no existe
        console.log('📊 Verificando tabla en Neon...');
        await sql`
            CREATE TABLE IF NOT EXISTS prospectos (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                nombre VARCHAR(255) NOT NULL,
                chat_id VARCHAR(255) NOT NULL UNIQUE,
                telefono VARCHAR(50),
                canal VARCHAR(50),
                fecha_extraccion TIMESTAMP NOT NULL DEFAULT NOW(),
                fecha_ultimo_mensaje TIMESTAMP,
                estado VARCHAR(50) DEFAULT 'Nuevo',
                imagenes_urls JSONB,
                documentos_urls JSONB,
                agente_id VARCHAR(255),
                user_email VARCHAR(255),
                workspace_id VARCHAR(255),
                notas TEXT,
                comentarios TEXT,
                campos_solicitados JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Crear índices
        await sql`CREATE INDEX IF NOT EXISTS idx_prospectos_chat_id ON prospectos(chat_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_prospectos_user_email ON prospectos(user_email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_prospectos_workspace_id ON prospectos(workspace_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_prospectos_fecha_extraccion ON prospectos(fecha_extraccion DESC)`;
        
        console.log('✅ Tabla y índices creados/verificados\n');

        // 3. Migrar cada prospecto
        console.log('📤 Migrando prospectos a Neon...');
        let migrated = 0;
        let skipped = 0;
        let errors = 0;

        for (const record of allProspects) {
            try {
                const fields = record.fields;
                
                // Parsear JSON strings si existen
                let imagenesUrls = null;
                if (fields.imagenes_urls) {
                    try {
                        imagenesUrls = typeof fields.imagenes_urls === 'string' 
                            ? JSON.parse(fields.imagenes_urls) 
                            : fields.imagenes_urls;
                    } catch (e) {
                        imagenesUrls = [];
                    }
                }

                let documentosUrls = null;
                if (fields.documentos_urls) {
                    try {
                        documentosUrls = typeof fields.documentos_urls === 'string'
                            ? JSON.parse(fields.documentos_urls)
                            : fields.documentos_urls;
                    } catch (e) {
                        documentosUrls = [];
                    }
                }

                let camposSolicitados = null;
                if (fields.campos_solicitados) {
                    try {
                        camposSolicitados = typeof fields.campos_solicitados === 'string'
                            ? JSON.parse(fields.campos_solicitados)
                            : fields.campos_solicitados;
                    } catch (e) {
                        camposSolicitados = {};
                    }
                }

                // Insertar en Neon (usar ON CONFLICT para evitar duplicados)
                await sql`
                    INSERT INTO prospectos (
                        nombre, chat_id, telefono, canal, fecha_extraccion,
                        fecha_ultimo_mensaje, estado, imagenes_urls, documentos_urls,
                        agente_id, user_email, workspace_id, notas, comentarios, campos_solicitados,
                        created_at
                    ) VALUES (
                        ${fields.nombre || ''},
                        ${fields['A chat_id'] || fields.chat_id || ''},
                        ${fields.telefono || null},
                        ${fields.canal || null},
                        ${fields.fecha_extraccion ? new Date(fields.fecha_extraccion) : new Date()},
                        ${fields.fecha_ultimo_mensaje ? new Date(fields.fecha_ultimo_mensaje) : null},
                        ${fields.estado || 'Nuevo'},
                        ${imagenesUrls ? JSON.stringify(imagenesUrls) : null},
                        ${documentosUrls ? JSON.stringify(documentosUrls) : null},
                        ${fields.agente_id || null},
                        ${fields.user_email || null},
                        ${fields.workspace_id || null},
                        ${fields.notas || null},
                        ${fields.comentarios || null},
                        ${camposSolicitados ? JSON.stringify(camposSolicitados) : null},
                        ${new Date(record.createdTime)}
                    )
                    ON CONFLICT (chat_id) DO UPDATE SET
                        nombre = EXCLUDED.nombre,
                        updated_at = NOW()
                `;

                migrated++;
                if (migrated % 10 === 0) {
                    console.log(`  ✅ ${migrated} prospectos migrados...`);
                }

            } catch (error) {
                if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
                    skipped++;
                    console.log(`  ⏭️  Prospecto duplicado, omitido: ${fields.nombre || fields['A chat_id']}`);
                } else {
                    errors++;
                    console.error(`  ❌ Error migrando prospecto ${record.id}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Migración completada:`);
        console.log(`   - Migrados: ${migrated}`);
        console.log(`   - Omitidos (duplicados): ${skipped}`);
        console.log(`   - Errores: ${errors}`);
        console.log(`\n🎉 ¡Listo! Los prospectos ahora están en Neon.`);

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
migrateProspects();
