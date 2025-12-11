# 🔧 Solución: Error de Login - "Error buscando usuario en Airtable"

## 🔴 Problema

No puedes iniciar sesión y ves el error: **"Error buscando usuario en Airtable"**

## 🔍 Causas Posibles

1. **API Key de Airtable no configurada en Vercel** (más común)
2. API Key inválida o expirada
3. Usuario no existe en la tabla Users de Airtable
4. Nombre del campo email incorrecto en Airtable

## ✅ Solución Paso a Paso

### Paso 1: Verificar API Key en Vercel

1. Ve a https://vercel.com
2. Selecciona tu proyecto `konsul-chatbot`
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `AIRTABLE_API_KEY`
5. Si **NO existe**, agrégala:
   - **Name**: `AIRTABLE_API_KEY`
   - **Value**: Tu API key de Airtable (formato: `patXXXXXXXXXXXXXX`)
   - **Environment**: Selecciona todas (Production, Preview, Development)
   - Haz clic en **Save**

### Paso 2: Obtener API Key de Airtable

Si no tienes la API key:

1. Ve a https://airtable.com/account
2. En la sección **"Developer"** o **"API"**
3. Haz clic en **"Create new token"** o **"Generate API key"**
4. Copia el token (empieza con `pat`)
5. Agrégalo en Vercel como se indica en el Paso 1

### Paso 3: Verificar Usuario en Airtable

1. Ve a tu base de Airtable: `appoqCG814jMJbf4X`
2. Abre la tabla **"Users"**
3. Verifica que exista un usuario con el email: `mercadeo@inversiones3000.com`
4. Verifica que el campo se llame exactamente **"email"** (minúscula)

### Paso 4: Redesplegar

Después de agregar la variable en Vercel:

1. Ve a **Deployments**
2. Encuentra el último deployment
3. Haz clic en los **3 puntos** (⋯) → **"Redeploy"**
4. O simplemente haz un push nuevo:
   ```bash
   git push origin preview
   ```

## 🔍 Verificación

Después del deployment:

1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Deberías ver en la consola:
   ```
   🔑 API Key de Airtable configurada
   🔍 Buscando usuario por email: mercadeo@inversiones3000.com
   ✅ Usuario encontrado en Airtable
   ```

Si ves errores, compártelos y te ayudo a resolverlos.

## ⚠️ Errores Comunes

### "API Key de Airtable no configurada"
- **Solución**: Agrega `AIRTABLE_API_KEY` en Vercel

### "API Key inválida" (401)
- **Solución**: Verifica que el token sea correcto y no haya expirado

### "Usuario no encontrado"
- **Solución**: Verifica que el usuario exista en Airtable con ese email exacto

### "Tabla Users no encontrada" (404)
- **Solución**: Verifica que la tabla se llame exactamente "Users" en Airtable

## 📝 Nota Importante

La API key de Airtable es diferente a la de Neon:
- **Airtable**: `AIRTABLE_API_KEY` (para usuarios y autenticación)
- **Neon**: `NEON_DATABASE_URL` (para prospectos)

Ambas deben estar configuradas en Vercel.
