# Dashboard Chatbot AI - Marca Blanca

Un dashboard web moderno y personalizable para SaaS de chatbots AI, diseñado para facilitar la gestión de conversaciones, equipos e integraciones.

## 🚀 Características Principales

### 📊 Resumen General
- **Estadísticas en tiempo real**: Chats activos, tokens consumidos, usuarios únicos
- **Gráficas interactivas**: Consumo de tokens y distribución por canales
- **Métricas de rendimiento**: Tiempo de respuesta y tendencias

### 💬 Gestión de Chats
- **Historial completo**: Todos los chats organizados por fecha
- **Filtros avanzados**: Por agente, canal (WhatsApp/Instagram) y fecha
- **Identificación de usuarios**: Número de teléfono o nombre de usuario
- **Estados de chat**: Activo, Pendiente, Resuelto
- **Asignación de agentes**: Gestión de atención humana

### 👥 Gestión del Equipo
- **Usuarios de la empresa**: Solo personal autorizado
- **Niveles de acceso**: Administrador, Agente de Ventas, Agente de Soporte
- **Estados de disponibilidad**: En línea, Ocupado, Desconectado
- **Gestión de permisos**: Control granular de acceso

### 🔌 Integraciones
- **Google Calendar**: Agendamientos automáticos
- **Eleven Labs**: Síntesis de voz
- **WhatsApp Business**: Conexión directa
- **Próximos agendamientos**: Vista de citas programadas

## 🎨 Personalización de Marca

### Sistema de Marca Blanca
- **Logo personalizable**: Carga de logo de la empresa
- **Colores corporativos**: Personalización de paleta de colores
- **Nombre de marca**: Cambio del nombre de la empresa
- **Tema oscuro/claro**: Modo nocturno disponible

### Variables CSS Personalizables
```css
:root {
    --primary-color: #6366f1;    /* Color principal */
    --secondary-color: #8b5cf6;  /* Color secundario */
    --success-color: #10b981;    /* Color de éxito */
    --warning-color: #f59e0b;    /* Color de advertencia */
    --danger-color: #ef4444;     /* Color de peligro */
}
```

## 📱 Diseño Responsivo

### Desktop (Escritorio)
- Sidebar fijo de 280px (colapsable a 80px)
- Layout de dos columnas para gráficas
- Navegación lateral completa
- Grid responsivo para tarjetas

### Mobile (Móvil)
- Sidebar overlay deslizable
- Contenido apilado en una columna
- Filtros con scroll horizontal
- Optimizado para pantallas táctiles

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Variables CSS, Grid, Flexbox, Animaciones
- **JavaScript ES6+**: Clases, async/await, módulos
- **Chart.js**: Gráficas interactivas
- **Font Awesome**: Iconografía
- **Inter Font**: Tipografía moderna

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Servidor web local (opcional para desarrollo)

### Instalación
1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. Para desarrollo local, usa un servidor web:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

### Personalización
1. Abre el modal de personalización de marca
2. Sube tu logo
3. Selecciona los colores corporativos
4. Cambia el nombre de la empresa
5. Guarda la configuración

## 🔌 Integración con APIs

### Endpoints Sugeridos
```javascript
// Chats
GET /api/chats - Obtener lista de chats
POST /api/chats - Crear nuevo chat
PUT /api/chats/:id - Actualizar chat
DELETE /api/chats/:id - Eliminar chat

// Equipo
GET /api/team - Obtener miembros del equipo
POST /api/team - Agregar miembro
PUT /api/team/:id - Actualizar miembro
DELETE /api/team/:id - Eliminar miembro

// Estadísticas
GET /api/stats - Obtener estadísticas generales
GET /api/stats/tokens - Obtener consumo de tokens
GET /api/stats/channels - Obtener estadísticas por canal

// Integraciones
GET /api/integrations - Obtener integraciones
POST /api/integrations/connect - Conectar integración
DELETE /api/integrations/:id - Desconectar integración
```

### Ejemplo de Integración
```javascript
// En script.js ya están definidos los métodos:
const dashboard = new ChatbotDashboard();

// Obtener datos
const chats = await dashboard.fetchChats();
const team = await dashboard.fetchTeamMembers();
const stats = await dashboard.fetchStats();
```

## 📊 Estructura de Datos

### Chat Object
```javascript
{
  id: "chat_123",
  user: {
    phone: "+52 1 234 567 8900",
    username: "@usuario_instagram",
    channel: "whatsapp" // o "instagram"
  },
  agent: {
    id: "agent_1",
    name: "Agente Ventas"
  },
  status: "active", // "active", "pending", "resolved"
  lastMessage: "Hola, necesito información...",
  timestamp: "2024-01-15T14:30:00Z",
  unreadCount: 2
}
```

### Team Member Object
```javascript
{
  id: "user_123",
  name: "María González",
  role: "Administradora",
  status: "online", // "online", "busy", "offline"
  avatar: "https://example.com/avatar.jpg",
  permissions: ["read", "write", "admin"]
}
```

## 🎯 Funcionalidades Futuras

### Próximas Características
- [ ] Chat en tiempo real con WebSockets
- [ ] Notificaciones push
- [ ] Exportación de reportes
- [ ] Dashboard de analytics avanzado
- [ ] Integración con más plataformas
- [ ] Sistema de roles granular
- [ ] API de webhooks
- [ ] Modo offline

### Mejoras de UX
- [ ] Búsqueda global
- [ ] Atajos de teclado
- [ ] Drag & drop para archivos
- [ ] Temas personalizados
- [ ] Internacionalización (i18n)

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar ESLint para JavaScript
- Seguir convenciones de CSS BEM
- Comentar código complejo
- Mantener responsividad
- Probar en múltiples navegadores

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@chatbotai.com
- Documentación: docs.chatbotai.com
- Issues: GitHub Issues

---

**Desarrollado con ❤️ para la gestión eficiente de chatbots AI**

