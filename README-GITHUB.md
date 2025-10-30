# Dashboard Chatbot AI - Configuración para GitHub

## 🚀 Configuración Inicial

### 1. **Clonar el Repositorio**
```bash
git clone <tu-repositorio>
cd Chatbot
```

### 2. **Instalar Dependencias**
```bash
npm install
```

### 3. **Configuración de Desarrollo Local**

Para desarrollo local, crea el archivo `src/config/dev.config.js` (NO se sube a GitHub):

```javascript
// src/config/dev.config.js
window.DEV_CONFIG = {
    apiConfig: {
        token: 'TU_TOKEN_AQUI',
        baseURL: 'https://api.gptmaker.ai'
    },
    authConfig: {
        useAirtable: true,
        mockUsers: [
            {
                email: 'admin@chatbot.com',
                password: 'admin123',
                name: 'Administrador'
            }
        ]
    }
};
```

### 4. **Iniciar Servidor de Desarrollo**
```bash
npm run dev
```

## 🔐 Sistema de Autenticación

### **Usuarios de Prueba (Modo Mock)**
- **Email**: `admin@chatbot.com` | **Password**: `admin123`
- **Email**: `user@chatbot.com` | **Password**: `user123`

### **Configuración de Airtable**
Si quieres usar Airtable en lugar de datos mock:

1. Crea el archivo `src/config/airtable.init.js`:
```javascript
window.authService.setAirtableApiKey('TU_API_KEY_AQUI');
```

2. Configura tu base de Airtable con los campos necesarios.

## 🌐 Configuración de Producción

### **Variables de Entorno**
Para producción, configura estas variables:

```env
GPTMAKER_API_TOKEN=tu_token_real
GPTMAKER_BASE_URL=https://api.gptmaker.ai
AIRTABLE_API_KEY=tu_api_key
AIRTABLE_BASE_ID=tu_base_id
```

### **Vercel Deployment**
El proyecto está configurado para Vercel con:
- Rewrites para `/api/*` → `https://api.gptmaker.ai/*`
- Configuración automática de CORS

## 🛠️ Scripts de Desarrollo

### **Scripts Disponibles**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
```

### **Scripts de Prueba (Consola del Navegador)**
```javascript
// Verificar estado de autenticación
checkAuthStatus()

// Probar login
testLogin()

// Probar logout
testLogout()

// Limpiar autenticación
resetAuth()

// Probar configuración de API
testGPTMakerConfiguration()
```

## 📁 Estructura de Archivos

```
src/
├── config/
│   ├── gptmaker.config.js     # Configuración de API (público)
│   ├── airtable.config.js     # Configuración de Airtable (público)
│   ├── stripe.config.js       # Configuración de Stripe (público)
│   ├── dev.config.js          # Configuración de desarrollo (PRIVADO)
│   └── airtable.init.js       # Inicialización de Airtable (PRIVADO)
├── auth/
│   ├── authService.js         # Servicio de autenticación
│   ├── login.js              # Lógica de login
│   └── mockData.js           # Datos mock para desarrollo
├── api/
│   └── gptmaker.js           # Cliente de API de GPTMaker
└── services/
    └── dataService.js        # Servicio de datos unificado
```

## 🔒 Seguridad

### **Archivos que NO se suben a GitHub**
- `src/config/dev.config.js` - Configuración de desarrollo
- `src/config/airtable.init.js` - API keys de Airtable
- `src/config/stripe.config.js` - API keys de Stripe
- `.env*` - Variables de entorno

### **Archivos Seguros para GitHub**
- `src/config/gptmaker.config.js` - Configuración pública de API
- `src/config/airtable.config.js` - Configuración pública de Airtable
- `vercel.json` - Configuración de deployment

## 🐛 Solución de Problemas

### **Login no funciona**
1. Ejecuta en consola: `checkAuthStatus()`
2. Si no está autenticado: `testLogin()`
3. Si sigue fallando: `resetAuth()`

### **API no responde**
1. Ejecuta en consola: `testGPTMakerConfiguration()`
2. Verifica que el token sea válido
3. Revisa la consola para errores de CORS

### **Datos de fallback**
1. Verifica la configuración de la API
2. Revisa que el token no esté expirado
3. Usa `enableMockMode()` para usar solo datos mock

## 📝 Notas Importantes

- **Desarrollo**: Usa configuración local con datos mock o API real
- **Producción**: Usa variables de entorno y configuración de Vercel
- **GitHub**: Solo se suben archivos de configuración pública
- **Seguridad**: Los tokens y API keys se mantienen privados

## 🚀 Deployment

### **Vercel**
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### **Otras Plataformas**
1. Configura las variables de entorno
2. Asegúrate de que los rewrites de `/api/*` funcionen
3. Verifica la configuración de CORS

