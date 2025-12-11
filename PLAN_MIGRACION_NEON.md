# 🚀 Plan de Migración a Neon PostgreSQL

## 📋 Resumen

Migrar los prospectos de Airtable a Neon PostgreSQL para resolver problemas de rate limiting y mejorar rendimiento.

## 🎯 Objetivos

1. ✅ Eliminar rate limiting (429 errors)
2. ✅ Mejorar rendimiento de queries
3. ✅ Mantener compatibilidad con Airtable para usuarios
4. ✅ Migración gradual sin downtime

## 🏗️ Arquitectura Propuesta

### Opción 1: Híbrida (Recomendada para empezar)
- **Neon**: Prospectos (alta frecuencia, rate limiting problemático)
- **Airtable**: Usuarios (baja frecuencia, funciona bien)

### Opción 2: Migración Completa
- **Neon**: Todo (Prospectos + Usuarios)
- **Airtable**: Solo como backup/legacy

## 📊 Estructura de Base de Datos en Neon

### Tabla: `prospectos`

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

-- Índices para búsquedas rápidas
CREATE INDEX idx_prospectos_chat_id ON prospectos(chat_id);
CREATE INDEX idx_prospectos_user_email ON prospectos(user_email);
CREATE INDEX idx_prospectos_workspace_id ON prospectos(workspace_id);
CREATE INDEX idx_prospectos_fecha_extraccion ON prospectos(fecha_extraccion DESC);
CREATE INDEX idx_prospectos_nombre ON prospectos(nombre);
```

## 🔧 Implementación

### Paso 1: Configurar Neon

1. Crear cuenta en https://neon.tech
2. Crear proyecto
3. Obtener connection string
4. Configurar variables de entorno

### Paso 2: Instalar Dependencias

```bash
npm install @neondatabase/serverless pg
```

### Paso 3: Crear Servicio Neon

- `src/services/neonService.js` - Servicio para interactuar con Neon
- Similar a `airtableService.js` pero con SQL

### Paso 4: Migrar Datos

- Script para migrar prospectos existentes de Airtable a Neon
- Validación de datos
- Rollback si es necesario

### Paso 5: Actualizar Código

- Modificar `prospectsService.js` para usar Neon
- Mantener Airtable como fallback opcional
- Testing exhaustivo

## 📝 Ventajas Específicas

### Para Prospectos:
- ✅ Sin rate limiting
- ✅ Queries SQL complejas (JOINs, agregaciones)
- ✅ Transacciones ACID
- ✅ Mejor para búsquedas y filtros
- ✅ Escalable sin límites artificiales

### Para Usuarios (si migramos):
- ✅ Autenticación más robusta
- ✅ Relaciones entre tablas
- ✅ Mejor seguridad de datos

## ⚠️ Consideraciones

1. **Backend necesario**: Neon requiere un backend para queries seguras
   - Opción A: Serverless Functions (Vercel)
   - Opción B: API Express simple
   - Opción C: Usar Neon HTTP (experimental, menos seguro)

2. **Migración de datos**: 
   - Exportar de Airtable
   - Importar a Neon
   - Validar integridad

3. **Dual write (temporal)**:
   - Escribir en ambos durante transición
   - Leer de Neon
   - Validar que todo funciona

## 🚀 Próximos Pasos

1. ¿Quieres que implemente la integración con Neon?
2. ¿Prefieres híbrida o migración completa?
3. ¿Tienes ya una cuenta de Neon o necesitas crearla?
