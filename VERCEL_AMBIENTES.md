# 🌍 Configuración de Ambientes en Vercel

Vercel permite tener **3 tipos de ambientes** con configuraciones independientes:

## 📋 Tipos de Ambientes

### 1. **Production** (Producción)
- **Rama**: La rama principal de tu repositorio (normalmente `main` o `master`)
- **URL**: `tu-proyecto.vercel.app` (dominio principal)
- **Cuándo se despliega**: Cada push a la rama principal
- **Uso**: Tu aplicación en vivo para usuarios reales

### 2. **Preview** (Previsualización)
- **Rama**: Cualquier otra rama que no sea la principal
- **URL**: `tu-proyecto-git-rama-tu-nombre.vercel.app` (URL única por rama)
- **Cuándo se despliega**: Cada push a una rama diferente o cada Pull Request
- **Uso**: Para probar cambios antes de mergear a producción

### 3. **Development** (Desarrollo)
- **Rama**: Ramas específicas marcadas como "Development Branch" en Vercel
- **URL**: Similar a Preview pero solo para ramas de desarrollo
- **Cuándo se despliega**: Cada push a la rama de desarrollo
- **Uso**: Ambiente de desarrollo/staging dedicado

## ⚙️ Configuración de Variables de Entorno

### Paso 1: Acceder a la Configuración

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Click en **Settings**
3. Click en **Environment Variables**

### Paso 2: Agregar Variables por Ambiente

Cuando agregas una variable, puedes elegir en qué ambientes aplica:

```
┌─────────────────────────────────────┐
│ Name: AIRTABLE_API_KEY              │
│ Value: patXXXXXXXXXXXXXX           │
│                                     │
│ ☑ Production                       │
│ ☑ Preview                          │
│ ☐ Development                      │
└─────────────────────────────────────┘
```

**Ejemplo de configuración típica:**

| Variable | Production | Preview | Development | Descripción |
|----------|-----------|---------|-------------|-------------|
| `AIRTABLE_API_KEY` | ✅ | ✅ | ✅ | Misma base de datos para todos |
| `API_BASE_URL` | `https://api.produccion.com` | `https://api.staging.com` | `https://api.dev.com` | URLs diferentes por ambiente |
| `DEBUG_MODE` | ❌ | ✅ | ✅ | Solo activo en dev/staging |

## 🚀 Flujo de Trabajo Recomendado

### Escenario 1: Desarrollo y Producción Separados

```
main (Production)
  └─ Variables: API de producción, base de datos real
  
develop (Development/Preview)
  └─ Variables: API de staging, base de datos de prueba
```

**Configuración:**
- **Production**: Variables de producción
- **Preview**: Variables de desarrollo/staging
- **Development**: (opcional) Variables de desarrollo local

### Escenario 2: Mismo Código, Diferentes Configuraciones

```
main (Production)
  └─ Variables: Configuración de producción
  
feature/nueva-funcionalidad (Preview)
  └─ Variables: Misma configuración que production (para probar)
```

## 📝 Pasos para Configurar

### 1. Crear una Rama de Desarrollo

```bash
# Crear y cambiar a rama de desarrollo
git checkout -b develop

# Hacer push
git push -u origin develop
```

### 2. Configurar en Vercel

1. Ve a **Settings** > **Git**
2. En "Development Branch", selecciona `develop` (o la rama que quieras)
3. Esto hará que esa rama use el ambiente "Development"

### 3. Configurar Variables por Ambiente

1. Ve a **Settings** > **Environment Variables**
2. Para cada variable, marca los ambientes donde debe aplicarse:

**Ejemplo:**
- `AIRTABLE_API_KEY`: ✅ Production, ✅ Preview, ✅ Development
- `API_BASE_URL`: 
  - Production: `https://api.produccion.com`
  - Preview: `https://api.staging.com`
  - Development: `https://api.dev.com`

### 4. Verificar los Deployments

Después de hacer push:

1. Ve a **Deployments** en Vercel
2. Verás diferentes deployments:
   - `main` → Production
   - `develop` → Development
   - `feature/xxx` → Preview

Cada uno tendrá su propia URL y sus propias variables de entorno.

## 🔍 Verificar Variables por Ambiente

### En el Dashboard de Vercel

1. Ve a un deployment específico
2. Click en **Settings** > **Environment Variables**
3. Verás qué variables están activas para ese ambiente

### Desde el Código

Las variables están disponibles como `process.env.VARIABLE_NAME`:

```javascript
// En funciones serverless o build scripts
const apiKey = process.env.AIRTABLE_API_KEY;
```

## 💡 Mejores Prácticas

1. **Nunca commitees variables de entorno** en el código
2. **Usa diferentes bases de datos** para desarrollo y producción
3. **Marca claramente** qué variables van en cada ambiente
4. **Documenta** qué variables necesita cada ambiente
5. **Usa Preview** para probar antes de mergear a producción

## 🛠️ Sincronizar Variables Localmente

Para desarrollo local, puedes descargar las variables de Vercel:

```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Autenticarse
vercel login

# Descargar variables de desarrollo
vercel env pull .env.local
```

Esto creará un archivo `.env.local` con las variables del ambiente "Development".

## 📚 Recursos

- [Documentación oficial de Vercel sobre ambientes](https://vercel.com/docs/deployments/pre-production)
- [Variables de entorno en Vercel](https://vercel.com/docs/projects/environment-variables)

