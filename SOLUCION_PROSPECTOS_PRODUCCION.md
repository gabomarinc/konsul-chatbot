# 🔧 Solución: Prospectos no aparecen en Producción

## Problema Identificado

1. **No hay filtrado por usuario/workspace**: El sistema está obteniendo TODOS los prospectos de Airtable sin filtrar por el usuario o workspace actual.
2. **Rate Limiting (429)**: Airtable está bloqueando peticiones por exceso de requests.
3. **Falta campo de asociación**: No existe un campo `user_email` o `workspace_id` en la tabla Prospectos para conectar con el usuario/cuenta.

## Solución Implementada

### 1. Filtrado por Usuario/Workspace

El código ahora:
- Obtiene el email del usuario actual desde `authService`
- Obtiene el workspace ID actual desde `dataService`
- Filtra los prospectos usando estos valores antes de mostrarlos

### 2. Manejo de Rate Limiting

Se implementó:
- **Retry automático** con exponential backoff
- **Respeto del header `Retry-After`** de Airtable
- **Hasta 3 reintentos** antes de fallar
- **Mensajes informativos** en consola

### 3. Campos de Asociación

Al crear nuevos prospectos, ahora se guardan:
- `user_email`: Email del usuario que creó el prospecto
- `workspace_id`: ID del workspace al que pertenece

## Pasos para Aplicar la Solución

### Paso 1: Agregar Campos en Airtable

1. Ve a tu base de Airtable: `appoqCG814jMJbf4X`
2. Abre la tabla **"Prospectos"**
3. Agrega estos campos:

   **Campo: `user_email`**
   - Tipo: **Single line text**
   - Nombre: `user_email`
   - Descripción: Email del usuario que creó el prospecto

   **Campo: `workspace_id`**
   - Tipo: **Single line text**
   - Nombre: `workspace_id`
   - Descripción: ID del workspace al que pertenece el prospecto

### Paso 2: Actualizar Prospectos Existentes (Opcional)

Si ya tienes prospectos en la base de datos y quieres asociarlos con usuarios:

1. En Airtable, abre la tabla "Prospectos"
2. Agrega manualmente el `user_email` y `workspace_id` a los prospectos existentes
3. O deja que se actualicen automáticamente cuando se vuelvan a procesar

### Paso 3: Desplegar Código Actualizado

El código ya está actualizado en la rama `preview`. Para desplegar:

```bash
git add .
git commit -m "fix: agregar filtrado por usuario/workspace y manejo de rate limiting"
git push origin preview
```

## Cómo Funciona Ahora

### Al Obtener Prospectos

1. El sistema obtiene el usuario actual (`user_email`)
2. Obtiene el workspace actual (`workspace_id`)
3. Construye un filtro en Airtable: `AND({user_email} = 'email@ejemplo.com', {workspace_id} = 'workspace123')`
4. Solo muestra los prospectos que coinciden con estos filtros

### Al Crear Prospectos

1. Cuando se extrae un nuevo prospecto de un chat
2. Se guarda automáticamente:
   - El `user_email` del usuario actual
   - El `workspace_id` del workspace actual
3. Esto permite filtrar correctamente en el futuro

### Manejo de Rate Limiting

1. Si Airtable responde con 429 (Too Many Requests)
2. El sistema espera el tiempo indicado en `Retry-After`
3. Reintenta automáticamente (hasta 3 veces)
4. Si falla después de 3 intentos, muestra un error claro

## Verificación

Después de desplegar, verifica:

1. **En la consola del navegador** deberías ver:
   ```
   👤 Filtrando por usuario: tu-email@ejemplo.com
   🏢 Filtrando por workspace: workspace-id
   ✅ X prospectos obtenidos de Airtable (filtrados)
   ```

2. **Si no hay campos en Airtable**, verás:
   ```
   ⚠️ No se pudo filtrar por usuario/workspace. Mostrando todos los prospectos.
   💡 Considera agregar campos user_email o workspace_id en Airtable
   ```

3. **Si hay rate limiting**, verás:
   ```
   ⏳ Rate limit alcanzado. Esperando Xs antes de reintentar...
   ```

## Notas Importantes

- **Los campos son opcionales**: Si no existen en Airtable, el sistema mostrará todos los prospectos (comportamiento actual)
- **Filtrado automático**: Una vez agregados los campos, el filtrado es automático
- **Rate limiting**: El sistema maneja automáticamente los límites de Airtable
- **Retrocompatibilidad**: Los prospectos sin estos campos seguirán funcionando

## Próximos Pasos

1. ✅ Agregar campos `user_email` y `workspace_id` en Airtable
2. ✅ Desplegar código actualizado
3. ✅ Verificar que los prospectos se filtren correctamente
4. ⏳ (Opcional) Actualizar prospectos existentes con estos campos
