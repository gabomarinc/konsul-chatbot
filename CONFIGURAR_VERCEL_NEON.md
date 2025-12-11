# ⚙️ Configurar Neon en Vercel

## Connection String de Neon

```
postgresql://neondb_owner:npg_B2EHOY0vXzfw@ep-bold-queen-a4gf318f-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Pasos para Configurar en Vercel

### 1. Ir a Vercel
1. Ve a https://vercel.com
2. Inicia sesión
3. Selecciona tu proyecto `konsul-chatbot`

### 2. Agregar Variable de Entorno
1. Ve a **Settings** (Configuración)
2. En el menú lateral, haz clic en **Environment Variables**
3. Haz clic en **"Add New"** o **"Add"**

### 3. Configurar la Variable
Completa estos campos:

- **Name (Nombre)**: `NEON_DATABASE_URL`
- **Value (Valor)**: 
  ```
  postgresql://neondb_owner:npg_B2EHOY0vXzfw@ep-bold-queen-a4gf318f-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  ```
- **Environment (Ambiente)**: 
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

4. Haz clic en **"Save"**

### 4. Redesplegar
Después de agregar la variable, necesitas redesplegar:

**Opción A - Automático:**
- Haz un push a la rama `preview`:
  ```bash
  git push origin preview
  ```

**Opción B - Manual:**
1. Ve a la pestaña **"Deployments"**
2. Encuentra el último deployment de `preview`
3. Haz clic en los **3 puntos** (⋯)
4. Selecciona **"Redeploy"**
5. Confirma

## ✅ Verificación

Después del deployment, verifica:

1. Abre tu aplicación en preview
2. Abre la consola del navegador (F12)
3. Deberías ver:
   ```
   🗄️ NeonService inicializado
   💡 Los prospectos se filtrarán por user_email y workspace_id del usuario de Airtable
   ```

4. Intenta extraer prospectos
5. En la consola deberías ver:
   ```
   🗄️ Guardando prospecto en Neon (asociado con usuario de Airtable)
   ✅ Prospecto creado en Neon: uuid-xxx
   ```

## 🎯 Estado Actual

- ✅ Connection String: Listo
- ✅ Tabla creada: Listo
- ⏳ Variable en Vercel: Pendiente (sigue los pasos arriba)
- ⏳ Deployment: Pendiente (después de agregar variable)

## 📝 Nota Importante

El connection string incluye credenciales sensibles. **NUNCA** lo compartas públicamente o lo subas a GitHub. Solo debe estar en:
- ✅ Variables de entorno de Vercel
- ✅ Archivo `.env` local (que está en .gitignore)
