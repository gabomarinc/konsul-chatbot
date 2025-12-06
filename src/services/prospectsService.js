// Servicio de Gestión de Prospectos
class ProspectsService {
    constructor() {
        this.airtableService = window.airtableService;
        console.log('👥 ProspectsService inicializado');
    }

    // ===== EXTRACCIÓN DE NOMBRES =====

    /**
     * Extrae el nombre del prospecto de los mensajes del chat
     * Busca patrones como "mi nombre es", "me llamo", etc.
     */
    extractNameFromMessages(messages) {
        if (!messages || messages.length === 0) {
            return null;
        }

        console.log('🔍 Buscando nombre en mensajes...');
        
        // Patrones para detectar preguntas sobre el nombre
        const nameQuestionPatterns = [
            /nombre\s+completo/i,
            /me\s+podr[ií]a\s+dar\s+su\s+nombre/i,
            /cu[aá]l\s+es\s+tu\s+nombre/i,
            /cu[aá]l\s+es\s+su\s+nombre/i,
            /dame\s+tu\s+nombre/i,
            /dame\s+su\s+nombre/i,
            /c[oó]mo\s+te\s+llamas/i,
            /c[oó]mo\s+se\s+llama/i
        ];

        // Patrones para extraer el nombre de la respuesta
        const nameExtractionPatterns = [
            /(?:mi\s+nombre\s+es|me\s+llamo|es|soy)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/i,
            /^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)$/,
            /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/, // Nombre y apellido
            /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/ // Solo nombre
        ];

        // Buscar pregunta del bot y respuesta del usuario
        for (let i = 0; i < messages.length - 1; i++) {
            const botMessage = messages[i];
            const userMessage = messages[i + 1];

            // Verificar que el bot preguntó por el nombre
            if (botMessage.role === 'assistant' || botMessage.role === 'agent') {
                const botText = botMessage.text || '';
                const isNameQuestion = nameQuestionPatterns.some(pattern => pattern.test(botText));

                if (isNameQuestion && userMessage.role === 'user') {
                    const userText = (userMessage.text || '').trim();
                    
                    // Intentar extraer el nombre de la respuesta
                    for (const pattern of nameExtractionPatterns) {
                        const match = userText.match(pattern);
                        if (match && match[1]) {
                            const extractedName = match[1].trim();
                            // Validar que el nombre tenga sentido (2-50 caracteres, al menos 2 palabras o una palabra de 3+ letras)
                            if (extractedName.length >= 2 && extractedName.length <= 50) {
                                console.log('✅ Nombre extraído:', extractedName);
                                return extractedName;
                            }
                        }
                    }

                    // Si no coincide con patrones, intentar tomar las primeras palabras como nombre
                    const words = userText.split(/\s+/).filter(w => w.length > 0);
                    if (words.length >= 1 && words.length <= 4) {
                        const possibleName = words.join(' ');
                        // Validar que no sean solo números o símbolos
                        if (/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(possibleName)) {
                            console.log('✅ Nombre extraído (palabras):', possibleName);
                            return possibleName;
                        }
                    }
                }
            }
        }

        console.log('⚠️ No se pudo extraer nombre de los mensajes');
        return null;
    }

    // ===== EXTRACCIÓN DE IMÁGENES Y DOCUMENTOS =====

    /**
     * Extrae todas las imágenes enviadas por el usuario
     */
    extractImagesFromMessages(messages, userId = 'user') {
        if (!messages || messages.length === 0) {
            return [];
        }

        const images = [];
        
        messages.forEach(message => {
            if (message.role === userId && message.type === 'image' && message.imageUrl) {
                images.push({
                    url: message.imageUrl,
                    timestamp: message.time || message.timestamp,
                    messageId: message.id
                });
            }
        });

        console.log(`✅ ${images.length} imágenes extraídas`);
        return images;
    }

    /**
     * Extrae todos los documentos/PDFs enviados por el usuario
     */
    extractDocumentsFromMessages(messages, userId = 'user') {
        if (!messages || messages.length === 0) {
            return [];
        }

        const documents = [];
        
        messages.forEach(message => {
            if (message.role === userId && message.type === 'document' && message.documentUrl) {
                const fileName = message.fileName || 'documento';
                const isPDF = fileName.toLowerCase().endsWith('.pdf');
                
                documents.push({
                    url: message.documentUrl,
                    fileName: fileName,
                    type: isPDF ? 'pdf' : 'document',
                    timestamp: message.time || message.timestamp,
                    messageId: message.id
                });
            }
        });

        console.log(`✅ ${documents.length} documentos extraídos`);
        return documents;
    }

    // ===== ANÁLISIS COMPLETO DE CHAT =====

    /**
     * Analiza un chat completo y extrae información del prospecto
     */
    async analyzeChat(chat, messages) {
        try {
            console.log(`📊 Analizando chat ${chat.id} para extraer prospecto...`);

            if (!messages || messages.length === 0) {
                console.log('⚠️ No hay mensajes para analizar');
                return null;
            }

            // Extraer nombre
            const nombre = this.extractNameFromMessages(messages);
            
            if (!nombre) {
                console.log('⚠️ No se pudo extraer nombre, saltando chat');
                return null;
            }

            // Extraer imágenes
            const imagenes = this.extractImagesFromMessages(messages);
            const imagenesUrls = imagenes.map(img => img.url);

            // Extraer documentos
            const documentos = this.extractDocumentsFromMessages(messages);
            const documentosUrls = documentos.map(doc => ({
                url: doc.url,
                fileName: doc.fileName,
                type: doc.type
            }));

            // Obtener fecha del último mensaje
            const lastMessage = messages[messages.length - 1];
            const fechaUltimoMensaje = lastMessage?.time || lastMessage?.timestamp || new Date().toISOString();

            const prospectData = {
                nombre: nombre,
                chatId: chat.id,
                telefono: chat.whatsappPhone || '',
                canal: chat.type || 'whatsapp',
                fechaExtraccion: new Date().toISOString(),
                fechaUltimoMensaje: fechaUltimoMensaje,
                estado: 'Nuevo',
                imagenesUrls: imagenesUrls,
                documentosUrls: documentosUrls,
                agenteId: chat.agentId || '',
                notas: ''
            };

            console.log('✅ Prospecto analizado:', prospectData);
            return prospectData;

        } catch (error) {
            console.error('❌ Error analizando chat:', error);
            return null;
        }
    }

    // ===== GESTIÓN EN AIRTABLE =====

    /**
     * Guarda o actualiza un prospecto en Airtable
     */
    async saveProspect(prospectData) {
        try {
            if (!this.airtableService) {
                throw new Error('AirtableService no disponible');
            }

            // Verificar si el prospecto ya existe
            const existing = await this.airtableService.getProspectByChatId(prospectData.chatId);
            
            if (existing.success && existing.prospect) {
                // Actualizar prospecto existente
                console.log('📝 Actualizando prospecto existente:', existing.prospect.id);
                
                // Combinar datos existentes con nuevos
                const updateData = {
                    ...prospectData,
                    imagenesUrls: [...(existing.prospect.imagenesUrls || []), ...(prospectData.imagenesUrls || [])].filter((v, i, a) => a.indexOf(v) === i), // Eliminar duplicados
                    documentosUrls: [...(existing.prospect.documentosUrls || []), ...(prospectData.documentosUrls || [])].filter((v, i, a) => 
                        a.findIndex(d => d.url === v.url) === i
                    ) // Eliminar duplicados por URL
                };

                const result = await this.airtableService.updateProspect(existing.prospect.id, updateData);
                return result;
            } else {
                // Crear nuevo prospecto
                console.log('➕ Creando nuevo prospecto');
                const result = await this.airtableService.createProspect(prospectData);
                return result;
            }
        } catch (error) {
            console.error('❌ Error guardando prospecto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtiene todos los prospectos de Airtable
     */
    async getAllProspects() {
        try {
            if (!this.airtableService) {
                throw new Error('AirtableService no disponible');
            }

            const result = await this.airtableService.getAllProspects();
            return result;
        } catch (error) {
            console.error('❌ Error obteniendo prospectos:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Analiza todos los chats y extrae prospectos
     */
    async extractProspectsFromAllChats(chats, dataService) {
        try {
            console.log(`📊 Analizando ${chats.length} chats para extraer prospectos...`);
            
            const prospects = [];
            const errors = [];

            for (const chat of chats) {
                try {
                    // Obtener mensajes del chat
                    const messagesResult = await dataService.getAllChatMessages(chat.id);
                    
                    if (messagesResult.success && messagesResult.data) {
                        // Analizar chat
                        const prospectData = await this.analyzeChat(chat, messagesResult.data);
                        
                        if (prospectData) {
                            prospects.push(prospectData);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error analizando chat ${chat.id}:`, error);
                    errors.push({ chatId: chat.id, error: error.message });
                }
            }

            console.log(`✅ ${prospects.length} prospectos extraídos, ${errors.length} errores`);
            return {
                success: true,
                prospects: prospects,
                errors: errors
            };
        } catch (error) {
            console.error('❌ Error extrayendo prospectos:', error);
            return {
                success: false,
                error: error.message,
                prospects: [],
                errors: []
            };
        }
    }
}

// Crear instancia global
window.prospectsService = new ProspectsService();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProspectsService;
}
