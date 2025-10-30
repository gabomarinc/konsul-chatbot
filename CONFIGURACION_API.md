# Configuración de Variables de Entorno

## Problema Identificado

La aplicación estaba mostrando datos de fallback en lugar de datos reales de la API de GPTMaker debido a problemas de configuración:

1. **BaseURL incorrecta**: Estaba usando `/api` en lugar de `https://api.gptmaker.com`
2. **Token hardcodeado**: El token estaba expuesto en el código del cliente
3. **Falta de manejo de errores**: No había validación adecuada de la configuración

## Solución Implementada

### 1. Configuración Mejorada

Se creó un sistema de configuración más robusto:

- **Archivo de configuración**: `src/config/gptmaker.config.js`
- **Manejo de tokens**: Soporte para localStorage y configuración global
- **Validación de tokens**: Verificación automática de tokens JWT
- **Manejo de errores**: Mejor logging y detección de problemas

### 2. Variables de Entorno

Para configurar correctamente la aplicación:

1. **Copia el archivo de ejemplo**:
   ```bash
   cp config.example.env .env.local
   ```

2. **Configura tus variables**:
   ```env
   GPTMAKER_API_TOKEN=tu_token_real_aqui
   GPTMAKER_BASE_URL=https://api.gptmaker.com
   ```

3. **Para desarrollo local**, puedes usar el token por defecto que ya está configurado.

### 3. Configuración en el Navegador

La aplicación ahora soporta múltiples formas de configuración:

1. **localStorage**: `localStorage.setItem('gptmaker_token', 'tu_token')`
2. **Configuración global**: `window.GPTMAKER_CONFIG = { token: 'tu_token' }`
3. **Token por defecto**: Para desarrollo (ya configurado)

### 4. Verificación de Configuración

Para verificar que la configuración es correcta:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la consola
3. Busca los mensajes:
   - `✅ Token válido`
   - `✅ Configuración cargada desde window.GPTMAKER_CONFIG`
   - `🌐 Realizando petición a: https://api.gptmaker.com/...`

### 5. Solución de Problemas

Si sigues viendo datos de fallback:

1. **Verifica el token**: Asegúrate de que el token sea válido y no esté expirado
2. **Revisa la consola**: Busca errores de CORS o conexión
3. **Verifica la URL**: Debe ser `https://api.gptmaker.com`
4. **Limpia el cache**: `localStorage.clear()` y recarga la página

### 6. Cambios Realizados

- ✅ Corregida la BaseURL de `/api` a `https://api.gptmaker.com`
- ✅ Implementado sistema de configuración robusto
- ✅ Mejorado el manejo de errores y logging
- ✅ Agregada validación de tokens JWT
- ✅ Creado archivo de configuración de ejemplo
- ✅ Actualizado el index.html para incluir la nueva configuración

## Próximos Pasos

1. **Probar la conexión**: Verifica que la API responda correctamente
2. **Configurar variables de entorno**: Para producción, usa variables de entorno reales
3. **Monitorear logs**: Revisa la consola para asegurar que no hay errores
4. **Actualizar token**: Si el token expira, actualízalo en la configuración

La aplicación ahora debería conectarse correctamente a la API de GPTMaker y mostrar datos reales en lugar de datos de fallback.

