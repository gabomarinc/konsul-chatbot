# Configuración de Airtable para Autenticación de Usuarios

## 📋 Información de la Base de Datos

- **Base ID**: `appoqCG814jMJbf4X`
- **Tabla**: `Users`

## 🔧 Estructura de la Tabla en Airtable

Asegúrate de que tu tabla `Users` en Airtable tenga los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Email` | Single line text | Email del usuario (único) |
| `Name` | Single line text | Nombre completo del usuario |
| `Company` | Single line text | Nombre de la empresa |
| `Phone` | Phone number | Teléfono del usuario |
| `Password` | Single line text | Contraseña (considerar hashear) |
| `Role` | Single select | Rol del usuario (user, admin, etc.) |
| `Status` | Single select | Estado (active, inactive) |
| `ProfileImage` | URL | URL de la imagen de perfil |
| `CreatedAt` | Date | Fecha de creación |
| `LastLogin` | Date | Última sesión |

## 🔑 Configuración de la API Key

### Opción 1: Configuración Manual (Desarrollo)

1. Obtén tu API Key de Airtable:
   - Ve a https://airtable.com/account
   - En la sección "API", genera un token personal
   - Copia el token

2. Abre la consola del navegador en tu aplicación

3. Ejecuta:
   ```javascript
   window.authService.setAirtableApiKey('TU_API_KEY_AQUI');
   ```

### Opción 2: Script de Inicialización (Desarrollo)

Crea un archivo `src/config/airtable.init.js`:

```javascript
// Este archivo NO debe subirse a git (.gitignore)
window.authService.setAirtableApiKey('patXXXXXXXXXXXXXX');
```

Luego cárgalo en `index.html`:

```html
<!-- Cargar ANTES de iniciar la app -->
<script src="src/config/airtable.init.js"></script>
```

### Opción 3: Backend Proxy (Producción) ⭐ RECOMENDADO

Para producción, NUNCA expongas tu API Key en el frontend.

Crea un backend que:

1. Maneje las credenciales de Airtable de forma segura
2. Exponga endpoints para login, registro, actualización
3. Valide y gestione las sesiones

Ejemplo de arquitectura:

```
Frontend → Backend API → Airtable
          (auth proxy)
```

## 📝 Uso en la Aplicación

### Login

Los usuarios pueden iniciar sesión con:
- Email registrado en Airtable
- Contraseña almacenada en Airtable

```javascript
await window.authService.login('user@example.com', 'password');
```

### Actualizar Perfil

```javascript
await window.authService.updateProfile({
    name: 'Nuevo Nombre',
    company: 'Nueva Empresa',
    phone: '+1234567890'
});
```

### Cambiar Contraseña

```javascript
await window.authService.changePassword('oldPassword', 'newPassword');
```

## ⚠️ Consideraciones de Seguridad

### 🔒 Contraseñas

**IMPORTANTE**: Las contraseñas actualmente se almacenan en texto plano en Airtable.

Para producción, implementa:

1. **Hash de contraseñas** antes de almacenar:
   ```javascript
   // Usar bcrypt o similar en el backend
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Backend de autenticación**:
   - El backend valida las credenciales
   - El backend hashea/verifica contraseñas
   - El frontend nunca ve las contraseñas

### 🔑 API Key

**NUNCA** pongas tu API Key de Airtable en:
- ❌ Código del frontend
- ❌ Repositorio de Git
- ❌ Archivos públicos

**SIEMPRE** usa:
- ✅ Variables de entorno en el servidor
- ✅ Backend proxy
- ✅ Secrets management (AWS Secrets, etc.)

### 🛡️ CORS

Si usas un backend proxy, configura CORS apropiadamente:

```javascript
// Ejemplo en Node.js/Express
app.use(cors({
    origin: 'https://tu-dominio.com',
    credentials: true
}));
```

## 🧪 Modo de Desarrollo

La aplicación funciona en dos modos:

### Modo Airtable
```javascript
// Con API Key configurada
window.authService.setAirtableApiKey('patXXXXXXXXXXXXXX');
// Usa Airtable para autenticación
```

### Modo Mock
```javascript
// Sin API Key o si Airtable falla
// Usa datos mock del archivo src/auth/mockData.js
```

## 📊 Estructura de Datos en Airtable

### Ejemplo de Usuario

```json
{
    "Email": "admin@example.com",
    "Name": "Admin User",
    "Company": "Mi Empresa",
    "Phone": "+1234567890",
    "Password": "admin123",
    "Role": "admin",
    "Status": "active",
    "ProfileImage": "https://...",
    "CreatedAt": "2024-01-15T10:00:00.000Z",
    "LastLogin": "2024-01-15T10:00:00.000Z"
}
```

## 🚀 Siguiente Paso

Para probar la integración:

1. Crea al menos un usuario en tu tabla de Airtable
2. Configura la API Key usando una de las opciones anteriores
3. Intenta hacer login con las credenciales del usuario creado

## 📞 Soporte

Para más información sobre la API de Airtable:
- Documentación: https://airtable.com/developers/web/api/introduction
- Referencia de API: https://airtable.com/appoqCG814jMJbf4X/api/docs

## 🔄 Migración Futura

Si decides usar otra base de datos (PostgreSQL, MongoDB, etc.):

1. Los métodos de `authService.js` son los mismos
2. Solo necesitas cambiar `airtableService.js` por tu nuevo servicio
3. La interfaz de usuario no requiere cambios


