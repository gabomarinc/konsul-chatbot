# 📋 Plan de Migración de Airtable a Neon

## 🎯 Objetivo
Migrar completamente de Airtable a Neon (PostgreSQL) para todas las operaciones de base de datos.

## 📊 Estado Actual
- ✅ **Prospectos**: Ya conectado a Neon
- ❌ **Users**: Actualmente en Airtable
- ❌ **Workspace**: Actualmente en Airtable (aunque se obtiene de GPTMaker API)

## 🔧 Pasos a Seguir

### 1. Ejecutar Queries SQL en Neon
Ejecuta el archivo `NEON_MIGRATION_QUERIES.sql` en tu base de datos Neon para crear las tablas `users` y `workspaces`.

### 2. Configurar Variables de Entorno
Agrega estas variables en Vercel y en tu `.env.local`:

```env
# Neon Database Connection
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### 3. Instalar Dependencias
```bash
npm install @neondatabase/serverless pg
```

### 4. Crear Utilidad de Conexión a Neon
Crear `api/neon/db.js` para manejar la conexión a Neon.

### 5. Crear Endpoints de API
Crear los siguientes endpoints en `api/neon/`:
- `users.js` - CRUD de usuarios
- `users/[userId].js` - Operaciones específicas de usuario
- `users/email/[email].js` - Buscar por email
- `prospectos.js` - CRUD de prospectos (si no existe)
- `workspaces.js` - CRUD de workspaces

### 6. Actualizar Servicios Frontend
- ✅ `neonService.js` - Ya creado
- Actualizar `authService.js` para usar `neonService` en lugar de `airtableService`
- Actualizar `prospectsService.js` para usar `neonService`
- Actualizar `dashboard.js` para usar `neonService`

### 7. Actualizar Configuración
- Actualizar `vercel.json` para incluir rutas de Neon
- Actualizar `config.example.env` con variables de Neon

### 8. Migrar Datos (Opcional)
Si tienes datos en Airtable que quieres migrar:
- Exportar datos de Airtable
- Importar a Neon usando scripts de migración

### 9. Pruebas
- Probar login/registro
- Probar CRUD de usuarios
- Probar CRUD de prospectos
- Probar CRUD de workspaces

### 10. Limpieza
- Eliminar referencias a Airtable
- Eliminar `airtableService.js` (o mantenerlo como backup)
- Actualizar documentación

## 📝 Archivos a Modificar

### Nuevos Archivos
- ✅ `NEON_MIGRATION_QUERIES.sql`
- ✅ `src/services/neonService.js`
- ⏳ `api/neon/db.js`
- ⏳ `api/neon/users.js`
- ⏳ `api/neon/users/[userId].js`
- ⏳ `api/neon/users/email/[email].js`
- ⏳ `api/neon/workspaces.js`
- ⏳ `PLAN_MIGRACION_NEON.md` (este archivo)

### Archivos a Modificar
- ⏳ `src/auth/authService.js` - Cambiar de `airtableService` a `neonService`
- ⏳ `src/services/prospectsService.js` - Cambiar de `airtableService` a `neonService`
- ⏳ `src/dashboard.js` - Cambiar referencias a Airtable
- ⏳ `vercel.json` - Agregar rutas de Neon
- ⏳ `package.json` - Agregar dependencias de Neon
- ⏳ `config.example.env` - Agregar variables de Neon

### Archivos a Eliminar (Opcional)
- `src/services/airtableService.js` (mantener como backup inicialmente)
- `src/config/airtable.config.js`
- `src/config/airtable.init.js`

## 🔐 Seguridad

### Variables de Entorno
- **NUNCA** commitees la URL de conexión a Neon
- Usa variables de entorno en Vercel
- Usa `.env.local` para desarrollo local (está en `.gitignore`)

### Validación
- Validar todos los inputs en los endpoints
- Usar prepared statements para prevenir SQL injection
- Validar autenticación en endpoints sensibles

## 📊 Estructura de Tablas

### Tabla: users
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `first_name`, `last_name`
- `password_hash`
- `role`, `status`
- `empresa`, `phone`, `profile_image`
- `has_paid`, `token_api`, `stripe_customer_id`
- `is_team_member`, `team_owner_email`, `member_role`
- `created_at`, `last_login`, `updated_at`

### Tabla: workspaces
- `id` (UUID, PK)
- `workspace_id` (VARCHAR, UNIQUE) - ID desde GPTMaker API
- `name` (VARCHAR)
- `user_id` (UUID, FK -> users.id)
- `credits` (DECIMAL)
- `status` (VARCHAR)
- `created_at`, `updated_at`

### Tabla: prospectos (ya existe)
- Verificar que tenga campos:
  - `user_email`
  - `workspace_id`
  - `user_id` (FK opcional)

## ✅ Checklist de Migración

- [ ] Ejecutar queries SQL en Neon
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias
- [ ] Crear utilidad de conexión a Neon
- [ ] Crear endpoints de API
- [ ] Actualizar authService.js
- [ ] Actualizar prospectsService.js
- [ ] Actualizar dashboard.js
- [ ] Actualizar vercel.json
- [ ] Probar login/registro
- [ ] Probar CRUD de usuarios
- [ ] Probar CRUD de prospectos
- [ ] Probar CRUD de workspaces
- [ ] Migrar datos (si es necesario)
- [ ] Limpiar código obsoleto
- [ ] Actualizar documentación

## 🚨 Notas Importantes

1. **Backup**: Antes de eliminar código de Airtable, asegúrate de tener un backup
2. **Testing**: Prueba exhaustivamente antes de desplegar a producción
3. **Rollback**: Ten un plan de rollback en caso de problemas
4. **Monitoreo**: Monitorea los logs después del despliegue

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisa los logs de Vercel
2. Verifica las variables de entorno
3. Verifica la conexión a Neon
4. Revisa los queries SQL

