# 🔧 Configuración para Desarrollo Local

Para que localhost funcione igual que producción, necesitas usar las mismas credenciales que tienes en Vercel.

## 📋 Pasos para Configurar

### 1. Obtener las credenciales de Vercel

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Ve a **Settings** > **Environment Variables**
3. Busca la variable `AIRTABLE_API_KEY`
4. Copia su valor (haz clic en el ojo para verla)

### 2. Crear archivo `.env.local`

En la raíz del proyecto, crea un archivo llamado `.env.local` con este contenido:

```env
VITE_AIRTABLE_API_KEY=pega_aqui_el_valor_de_vercel
```

**Ejemplo:**
```env
VITE_AIRTABLE_API_KEY=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXX
```

### 3. Reiniciar el servidor

1. Detén el servidor actual (Ctrl+C en la terminal)
2. Inicia de nuevo: `npm run dev`
3. Recarga la página en el navegador

## ✅ Verificación

Después de configurar, deberías ver en la consola del navegador:

```
✅ API Key de Airtable cargada desde variable de entorno (VITE_AIRTABLE_API_KEY)
✅ Token de Airtable configurado correctamente
```

## 🔍 Solución de Problemas

### No veo los mensajes de éxito

1. Verifica que el archivo se llame exactamente `.env.local` (con el punto al inicio)
2. Verifica que la variable empiece con `VITE_` (Vite solo expone variables que empiezan así)
3. Reinicia el servidor de desarrollo después de crear/modificar `.env.local`

### Sigue usando modo mock

1. Abre la consola del navegador (F12)
2. Ejecuta: `window.AIRTABLE_API_KEY`
3. Si muestra `undefined`, la variable no se cargó correctamente
4. Verifica el archivo `.env.local` y reinicia el servidor

## 📝 Notas

- El archivo `.env.local` NO se sube a Git (está en `.gitignore`)
- Usa el mismo valor que tienes en Vercel para `AIRTABLE_API_KEY`
- En Vite, las variables deben empezar con `VITE_` para estar disponibles en el frontend
- Si cambias el archivo `.env.local`, debes reiniciar el servidor
