# 📋 Plan de Implementación: Sección Prospectos

## ✅ Confirmación de Capacidades

### Archivos que podemos captar y visualizar:
- ✅ **Imágenes**: JPG, PNG, GIF, etc. (via `message.imageUrl`)
- ✅ **PDFs**: Documentos PDF (via `message.documentUrl`)
- ✅ **Documentos**: Cualquier archivo documento (via `message.documentUrl`)
- ✅ **Audio**: Mensajes de voz (via `message.audioUrl`)

---

## 🎯 Funcionalidades a Implementar

### 1. Extracción de Nombres
- Analizar mensajes del chatbot que preguntan por nombre
- Extraer la respuesta del usuario con patrones:
  - "mi nombre es [X]"
  - "me llamo [X]"
  - "es [X]"
  - Respuestas directas después de pregunta

### 2. Sección "Prospectos" en el Dashboard
- Agregar al menú lateral
- Crear HTML de la sección (similar a "Atendimientos")
- Tabla con lista de prospectos

### 3. Extracción Automática
- Analizar todos los chats al cargar
- Extraer nombres e imágenes automáticamente
- Guardar en Airtable

### 4. Modal "Ver Prospecto"
- Botón "Ver Prospecto" en cada fila
- Modal con:
  - Información del prospecto
  - Galería de imágenes (vista previa)
  - Lista de documentos/PDFs (descargables)
  - Botón para ir al chat

### 5. Vinculación con Chats
- Click en chat_id → Abrir chat directamente
- Usar función existente `selectChat(chat)`

---

## 📁 Archivos a Modificar/Crear

1. `index.html` - Agregar sección HTML
2. `src/dashboard.js` - Lógica principal
3. `src/services/airtableService.js` - Métodos para Prospectos
4. `styles.css` - Estilos para nueva sección y modal
5. `src/services/prospectsService.js` - [NUEVO] Servicio de extracción

---

## 🚀 Fases de Implementación

### Fase 1: Configuración Base
- [ ] Agregar configuración de tabla Prospectos en airtableService
- [ ] Crear métodos CRUD para prospectos

### Fase 2: Sección UI
- [ ] Agregar "Prospectos" al menú
- [ ] Crear HTML de la sección
- [ ] Crear tabla de prospectos

### Fase 3: Extracción de Datos
- [ ] Función para extraer nombres de mensajes
- [ ] Función para extraer imágenes/documentos
- [ ] Guardar en Airtable

### Fase 4: Modal de Visualización
- [ ] Crear modal "Ver Prospecto"
- [ ] Galería de imágenes (lightbox)
- [ ] Lista de documentos/PDFs

### Fase 5: Integración
- [ ] Vincular con chats
- [ ] Actualización automática
- [ ] Pruebas finales

---

## 🎨 Estructura del Modal "Ver Prospecto"

```
┌─────────────────────────────────────────┐
│  Ver Prospecto: Juan Ignacio        [X]│
├─────────────────────────────────────────┤
│                                         │
│  📋 Información:                        │
│  • Nombre: Juan Ignacio                 │
│  • Teléfono: +52 1 234 567 8900         │
│  • Canal: WhatsApp                      │
│  • Fecha: 2024-01-15                    │
│                                         │
│  🖼️ Imágenes (3):                       │
│  [img] [img] [img]                      │
│                                         │
│  📄 Documentos (2):                     │
│  • documento1.pdf [Descargar]           │
│  • documento2.pdf [Descargar]           │
│                                         │
│  [Ir al Chat] [Cerrar]                  │
└─────────────────────────────────────────┘
```

---

## ✅ Listo para Empezar

¡Vamos a implementarlo! 🚀

