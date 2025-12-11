# 🚀 Pasos para Configurar Neon - Guía Rápida

## ✅ Checklist de Configuración

### Paso 1: Crear Cuenta en Neon (5 minutos)

1. Ve a https://neon.tech
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Crea cuenta con email o GitHub
4. Verifica tu email si es necesario

### Paso 2: Crear Proyecto (2 minutos)

1. Una vez dentro del dashboard, haz clic en **"Create Project"**
2. **Nombre del proyecto**: `konsul-chatbot` (o el que prefieras)
3. **Región**: Elige la más cercana (ej: `US East` o `EU West`)
4. **PostgreSQL version**: Deja la última (15 o 16)
5. Haz clic en **"Create Project"**

### Paso 3: Obtener Connection String (1 minuto)

1. En el dashboard de tu proyecto, busca la sección **"Connection Details"** o **"Connect"**
2. Verás algo como:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Copia este string completo** (lo necesitarás en el siguiente paso)

### Paso 4: Crear Tabla en Neon (2 minutos)

1. En el dashboard de Neon, ve a la pestaña **"SQL Editor"** o **"Query"**
2. Pega este SQL y ejecútalo:

```sql
CREATE TABLE prospectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    chat_id VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    canal VARCHAR(50),
    fecha_extraccion TIMESTAMP NOT NULL DEFAULT NOW(),
    fecha_ultimo_mensaje TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Nuevo',
    imagenes_urls JSONB,
    documentos_urls JSONB,
    agente_id VARCHAR(255),
    user_email VARCHAR(255),
    workspace_id VARCHAR(255),
    notas TEXT,
    comentarios TEXT,
    campos_solicitados JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_prospectos_chat_id ON prospectos(chat_id);
CREATE INDEX idx_prospectos_user_email ON prospectos(user_email);
CREATE INDEX idx_prospectos_workspace_id ON prospectos(workspace_id);
CREATE INDEX idx_prospectos_fecha_extraccion ON prospectos(fecha_extraccion DESC);
CREATE INDEX idx_prospectos_nombre ON prospectos(nombre);
```

3. Deberías ver un mensaje de éxito ✅

### Paso 5: Configurar en Vercel (3 minutos)

1. Ve a tu proyecto en Vercel: https://vercel.com
2. Selecciona tu proyecto `konsul-chatbot`
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **"Add New"**
5. Agrega esta variable:
   - **Name**: `NEON_DATABASE_URL`
   - **Value**: Pega el connection string que copiaste en el Paso 3
   - **Environment**: Selecciona todas (Production, Preview, Development)
6. Haz clic en **"Save"**

### Paso 6: Redesplegar en Vercel (2 minutos)

1. En Vercel, ve a la pestaña **"Deployments"**
2. Encuentra el último deployment de la rama `preview`
3. Haz clic en los **3 puntos** (⋯) → **"Redeploy"**
4. O simplemente haz un push nuevo a la rama `preview`:
   ```bash
   git push origin preview
   ```

### Paso 7: Verificar que Funciona (2 minutos)

1. Espera a que Vercel termine el deployment (2-3 minutos)
2. Abre tu aplicación en preview
3. Abre la consola del navegador (F12)
4. Deberías ver:
   ```
   🗄️ NeonService inicializado
   💡 Los prospectos se filtrarán por user_email y workspace_id del usuario de Airtable
   ```
5. Intenta extraer prospectos
6. Deberías ver en la consola:
   ```
   🗄️ Guardando prospecto en Neon (asociado con usuario de Airtable)
   ✅ Prospecto creado en Neon: uuid-xxx
   ```

## 🎯 Resumen de lo que Necesitas

1. ✅ **Connection String de Neon** (del Paso 3)
2. ✅ **Agregar variable `NEON_DATABASE_URL` en Vercel** (Paso 5)
3. ✅ **Redesplegar** (Paso 6)

## ⚠️ Si Algo Sale Mal

### Error: "NEON_DATABASE_URL not configured"
- Verifica que la variable esté en Vercel
- Asegúrate de que esté en todos los ambientes (Production, Preview, Development)
- Redesplega después de agregar la variable

### Error: "Table does not exist"
- Verifica que ejecutaste el SQL del Paso 4
- Revisa que estés en la base de datos correcta en Neon

### Error: "Connection refused"
- Verifica que el connection string sea correcto
- Asegúrate de que Neon esté activo (no suspendido)

### Los prospectos no aparecen
- Verifica en la consola qué servicio está usando
- Si dice "usando Airtable", Neon no está configurado correctamente
- Revisa que `NEON_DATABASE_URL` esté en Vercel

## 📞 ¿Necesitas Ayuda?

Si tienes problemas en algún paso, dímelo y te ayudo a resolverlo.
