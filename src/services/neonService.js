/**
 * Servicio para interactuar con Neon PostgreSQL
 * Reemplaza o complementa AirtableService para prospectos
 */

class NeonService {
    constructor() {
        // Connection string de Neon (debe estar en variables de entorno)
        this.connectionString = process.env.NEON_DATABASE_URL || window.NEON_DATABASE_URL;
        
        // Para usar desde el frontend, necesitamos un backend proxy
        // O usar Neon HTTP (menos seguro, solo para desarrollo)
        this.apiEndpoint = process.env.NEON_API_ENDPOINT || '/api/neon';
        
        // Verificar si Neon está configurado
        if (!this.connectionString) {
            console.warn('⚠️ Neon no está configurado. Usa Airtable como fallback.');
        } else {
            console.log('🗄️ NeonService inicializado');
            console.log('💡 Los prospectos se filtrarán por user_email y workspace_id del usuario de Airtable');
        }
    }

    /**
     * Obtener todos los prospectos con filtros opcionales
     */
    async getAllProspects(options = {}) {
        try {
            console.log('🔍 Obteniendo prospectos de Neon...');
            
            // Obtener información del usuario/workspace para filtrar
            let userEmail = null;
            let workspaceId = null;
            
            try {
                if (window.authService && window.authService.getCurrentUser) {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser) {
                        userEmail = currentUser.email;
                    }
                }
                
                if (window.dashboard && window.dashboard.dataService) {
                    const workspaces = await window.dashboard.dataService.getWorkspaces();
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener información de usuario/workspace:', error);
            }

            // Construir query SQL
            let query = 'SELECT * FROM prospectos WHERE 1=1';
            const params = [];
            let paramIndex = 1;

            // Filtrar por user_email
            if (userEmail && !options.includeAll) {
                query += ` AND user_email = $${paramIndex}`;
                params.push(userEmail);
                paramIndex++;
            }

            // Filtrar por workspace_id
            if (workspaceId && !options.includeAll) {
                query += ` AND workspace_id = $${paramIndex}`;
                params.push(workspaceId);
                paramIndex++;
            }

            // Ordenar por fecha de extracción (más reciente primero)
            query += ' ORDER BY fecha_extraccion DESC';

            // Límite de registros
            if (options.maxRecords) {
                query += ` LIMIT $${paramIndex}`;
                params.push(options.maxRecords);
            }

            // Llamar al backend API
            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    params
                })
            });

            if (!response.ok) {
                throw new Error(`Error obteniendo prospectos: ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ ${data.rows.length} prospectos obtenidos de Neon`);
            
            return {
                success: true,
                data: data.rows.map(row => this.transformNeonProspect(row)),
                total: data.rows.length,
                source: 'neon'
            };

        } catch (error) {
            console.error('❌ Error obteniendo prospectos de Neon:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                source: 'neon'
            };
        }
    }

    /**
     * Obtener prospecto por chat_id
     */
    async getProspectByChatId(chatId) {
        try {
            console.log('🔍 Buscando prospecto por chat_id en Neon:', chatId);
            
            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: 'SELECT * FROM prospectos WHERE chat_id = $1 LIMIT 1',
                    params: [chatId]
                })
            });

            if (!response.ok) {
                throw new Error(`Error buscando prospecto: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.rows.length === 0) {
                return {
                    success: true,
                    prospect: null,
                    exists: false
                };
            }

            return {
                success: true,
                prospect: this.transformNeonProspect(data.rows[0]),
                exists: true
            };

        } catch (error) {
            console.error('❌ Error buscando prospecto en Neon:', error);
            return {
                success: false,
                error: error.message,
                prospect: null,
                exists: false
            };
        }
    }

    /**
     * Crear nuevo prospecto
     */
    async createProspect(prospectData) {
        try {
            console.log('📝 Creando prospecto en Neon:', prospectData.nombre);
            
            // Obtener información del usuario/workspace
            let userEmail = null;
            let workspaceId = null;
            
            try {
                if (window.authService && window.authService.getCurrentUser) {
                    const currentUser = window.authService.getCurrentUser();
                    if (currentUser) {
                        userEmail = currentUser.email;
                    }
                }
                
                if (window.dashboard && window.dashboard.dataService) {
                    const workspaces = await window.dashboard.dataService.getWorkspaces();
                    if (workspaces.success && workspaces.data && workspaces.data.length > 0) {
                        workspaceId = workspaces.data[0].id;
                    }
                }
            } catch (error) {
                console.warn('⚠️ No se pudo obtener información de usuario/workspace:', error);
            }

            const query = `
                INSERT INTO prospectos (
                    nombre, chat_id, telefono, canal, fecha_extraccion,
                    fecha_ultimo_mensaje, estado, imagenes_urls, documentos_urls,
                    agente_id, user_email, workspace_id, notas, comentarios, campos_solicitados
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                RETURNING *
            `;

            const params = [
                prospectData.nombre || '',
                prospectData.chatId || '',
                prospectData.telefono || null,
                prospectData.canal || null,
                prospectData.fechaExtraccion || new Date().toISOString(),
                prospectData.fechaUltimoMensaje || null,
                prospectData.estado || 'Nuevo',
                prospectData.imagenesUrls ? JSON.stringify(prospectData.imagenesUrls) : null,
                prospectData.documentosUrls ? JSON.stringify(prospectData.documentosUrls) : null,
                prospectData.agenteId || null,
                userEmail,
                workspaceId,
                prospectData.notas || null,
                prospectData.comentarios || null,
                prospectData.camposSolicitados ? JSON.stringify(prospectData.camposSolicitados) : null
            ];

            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params })
            });

            if (!response.ok) {
                throw new Error(`Error creando prospecto: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Prospecto creado en Neon:', data.rows[0].id);
            
            return {
                success: true,
                prospect: this.transformNeonProspect(data.rows[0])
            };

        } catch (error) {
            console.error('❌ Error creando prospecto en Neon:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Actualizar prospecto existente
     */
    async updateProspect(prospectId, updates) {
        try {
            const setClause = [];
            const params = [];
            let paramIndex = 1;

            Object.keys(updates).forEach(key => {
                setClause.push(`${key} = $${paramIndex}`);
                params.push(updates[key]);
                paramIndex++;
            });

            params.push(prospectId); // Para el WHERE

            const query = `
                UPDATE prospectos 
                SET ${setClause.join(', ')}, updated_at = NOW()
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params })
            });

            if (!response.ok) {
                throw new Error(`Error actualizando prospecto: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                prospect: this.transformNeonProspect(data.rows[0])
            };

        } catch (error) {
            console.error('❌ Error actualizando prospecto en Neon:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Transformar prospecto de Neon a formato estándar
     */
    transformNeonProspect(row) {
        return {
            id: row.id,
            nombre: row.nombre,
            chatId: row.chat_id,
            telefono: row.telefono,
            canal: row.canal,
            fechaExtraccion: row.fecha_extraccion,
            fechaUltimoMensaje: row.fecha_ultimo_mensaje,
            estado: row.estado,
            imagenesUrls: typeof row.imagenes_urls === 'string' 
                ? JSON.parse(row.imagenes_urls || '[]') 
                : (row.imagenes_urls || []),
            documentosUrls: typeof row.documentos_urls === 'string'
                ? JSON.parse(row.documentos_urls || '[]')
                : (row.documentos_urls || []),
            agenteId: row.agente_id,
            userEmail: row.user_email,
            workspaceId: row.workspace_id,
            notas: row.notas,
            comentarios: row.comentarios,
            camposSolicitados: typeof row.campos_solicitados === 'string'
                ? JSON.parse(row.campos_solicitados || '{}')
                : (row.campos_solicitados || {}),
            createdTime: row.created_at,
            updatedTime: row.updated_at
        };
    }
}

// Exportar
if (typeof window !== 'undefined') {
    window.NeonService = NeonService;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NeonService;
}
