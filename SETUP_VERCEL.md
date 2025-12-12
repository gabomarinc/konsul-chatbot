# 🚀 Guía de Setup en Vercel

## Pasos para Deploy

### 1. Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Add New Project"
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio del proyecto

### 2. Configurar Variables de Entorno

En la configuración del proyecto en Vercel, agrega estas variables:

#### Obligatorias:
```
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### Opcionales:
```
GPTMAKER_API_TOKEN=tu_token_aqui
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Configuración del Proyecto

Vercel detectará automáticamente:
- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Deploy

1. Click en "Deploy"
2. Espera a que termine el build
3. Tu aplicación estará disponible en `tu-proyecto.vercel.app`

## 🔍 Verificar Deployment

### Probar Login

1. Abre `https://tu-proyecto.vercel.app/login.html`
2. Usa las credenciales que creaste en Neon:
   - Email: el que usaste al crear el usuario
   - Contraseña: `admin123` (o la que configuraste)

### Verificar Logs

Si hay errores, revisa los logs en Vercel:
- Ve a tu proyecto en Vercel
- Click en "Deployments"
- Click en el deployment más reciente
- Revisa los logs de build y runtime

## ⚠️ Troubleshooting

### Error: "NEON_DATABASE_URL not found"
- Verifica que la variable esté configurada en Vercel
- Asegúrate de que el nombre sea exactamente `NEON_DATABASE_URL`

### Error: "Cannot connect to database"
- Verifica que la URL de Neon sea correcta
- Asegúrate de que Neon permita conexiones desde Vercel
- Verifica que el formato de la URL sea: `postgresql://user:password@host/database?sslmode=require`

### Error 404 en rutas `/api/neon/*`
- Verifica que `vercel.json` esté en el repositorio
- Asegúrate de que las rutas estén correctamente configuradas

## 📝 Notas

- Los endpoints de API se ejecutan como funciones serverless en Vercel
- Las rutas `/api/neon/*` se manejan automáticamente por Vercel
- No necesitas configurar un servidor adicional

