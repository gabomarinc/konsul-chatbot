# 📧 Manejo de Correos en la Aplicación

## Resumen

Actualmente, la aplicación **NO tiene un servicio de envío automático de correos**. En su lugar, utiliza enlaces `mailto:` que abren el cliente de correo predeterminado del usuario.

## 🔍 Dónde se Usan los Correos

### 1. **Notificaciones al Equipo** (`src/team.js`)
- **Función**: `notifyTeamAboutQualifiedLead()`
- **Uso**: Cuando se califica un nuevo cliente, se envía una notificación a los miembros del equipo
- **Método**: Enlace `mailto:` que abre el cliente de correo del usuario
- **Destinatario**: Miembros del equipo configurados

```javascript
const mailtoLink = `mailto:${member.email}?subject=${subject}&body=${body}`;
window.location.href = mailtoLink;
```

### 2. **Sugerencias de Mejoras** (`src/improvements.js`)
- **Función**: `handleSuggestionSubmit()`
- **Uso**: Cuando un usuario envía una sugerencia de mejora
- **Método**: Enlace `mailto:` que abre el cliente de correo
- **Destinatario**: `somos@konsul.digital`

```javascript
const mailtoLink = `mailto:somos@konsul.digital?subject=${subject}&body=${body}`;
window.location.href = mailtoLink;
```

### 3. **Soporte Técnico** (`src/auth/userMenu.js`)
- **Función**: `handleSupportSubmit()`
- **Uso**: Cuando un usuario envía una solicitud de soporte
- **Método**: Simulado (no envía correo real, solo muestra mensaje de éxito)
- **Nota**: Actualmente solo simula el envío, no envía correos reales

### 4. **Recuperación de Contraseña** (`src/auth/authService.js`)
- **Función**: `forgotPassword()`
- **Uso**: Cuando un usuario solicita recuperar su contraseña
- **Método**: Intenta llamar a un endpoint `/api/auth/forgot-password`
- **Estado**: Requiere backend implementado para funcionar

## ⚠️ Limitaciones Actuales

1. **No hay servicio de envío automático**: Todos los correos requieren acción manual del usuario
2. **Dependencia del cliente de correo**: Requiere que el usuario tenga configurado un cliente de correo en su dispositivo
3. **No hay confirmación de envío**: No se puede verificar si el correo fue enviado exitosamente
4. **No hay historial**: No se guarda un registro de los correos enviados

## 💡 Opciones para Implementar Envío Real de Correos

### Opción 1: Servicio de Email Transaccional (Recomendado)

Usar un servicio como:
- **SendGrid** (https://sendgrid.com)
- **Mailgun** (https://mailgun.com)
- **AWS SES** (https://aws.amazon.com/ses/)
- **Resend** (https://resend.com)

**Ventajas**:
- Envío automático desde el backend
- Confirmación de entrega
- Historial de correos
- Plantillas personalizadas
- Analytics de apertura y clics

**Implementación**:
```javascript
// Backend (Node.js con Express)
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/api/send-email', async (req, res) => {
    const { to, subject, body } = req.body;
    
    const msg = {
        to: to,
        from: 'noreply@konsul.digital',
        subject: subject,
        html: body
    };
    
    await sgMail.send(msg);
    res.json({ success: true });
});
```

### Opción 2: Backend Propio con SMTP

Configurar un servidor SMTP propio o usar un servicio SMTP como:
- **Gmail SMTP**
- **Outlook SMTP**
- **Servidor SMTP propio**

**Implementación**:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/api/send-email', async (req, res) => {
    const { to, subject, body } = req.body;
    
    await transporter.sendMail({
        from: 'noreply@konsul.digital',
        to: to,
        subject: subject,
        html: body
    });
    
    res.json({ success: true });
});
```

### Opción 3: Integración con Airtable

Si ya usas Airtable, puedes usar webhooks o scripts de Airtable para enviar correos automáticamente cuando se crean registros.

## 📋 Recomendaciones

1. **Para Producción**: Implementar un servicio de email transaccional (SendGrid, Mailgun, etc.)
2. **Para Desarrollo**: Mantener los enlaces `mailto:` o usar un servicio de prueba
3. **Prioridad**: Implementar envío automático para:
   - Recuperación de contraseña
   - Confirmaciones de registro
   - Notificaciones importantes del sistema

## 🔧 Pasos para Implementar

1. Elegir un servicio de email
2. Configurar las credenciales en variables de entorno
3. Crear endpoints en el backend para envío de correos
4. Actualizar el frontend para usar los nuevos endpoints
5. Reemplazar los enlaces `mailto:` con llamadas a la API
6. Agregar manejo de errores y confirmaciones

## 📝 Notas Adicionales

- Los correos actuales funcionan bien para desarrollo y pruebas
- Para producción, es esencial tener un servicio de envío automático
- Considerar implementar plantillas de correo para mantener consistencia
- Agregar logs de correos enviados para auditoría

