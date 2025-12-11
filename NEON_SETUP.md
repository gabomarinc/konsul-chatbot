# 🚀 Configuración de Neon PostgreSQL

## 📋 Pasos para Configurar Neon

### 1. Crear Cuenta en Neon

1. Ve a https://neon.tech
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Elige la región más cercana (ej: US East)

### 2. Obtener Connection String

1. En el dashboard de Neon, ve a tu proyecto
2. Ve a "Connection Details"
3. Copia el **Connection String** (parece: `postgresql://user:pass@host/db?sslmode=require`)

### 3. Configurar Variables de Entorno

#### En Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `NEON_DATABASE_URL` = tu connection string de Neon

#### En Local (.env):

```env
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
AIRTABLE_API_KEY=tu_api_key_de_airtable
```

### 4. Instalar Dependencias

```bash
npm install @neondatabase/serverless pg
```

### 5. Crear Tabla en Neon

Ejecuta este SQL en el SQL Editor de Neon:

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

### 6. Migrar Datos Existentes (Opcional)

Si ya tienes prospectos en Airtable:

```bash
node scripts/migrate-to-neon.js
```

Este script:
- Obtiene todos los prospectos de Airtable
- Los migra a Neon
- Evita duplicados
- Muestra progreso

### 7. Actualizar Código para Usar Neon

El código ya está preparado. Solo necesitas:

1. Configurar `NEON_DATABASE_URL` en Vercel
2. El sistema automáticamente usará Neon si está configurado
3. Si no está configurado, usará Airtable como fallback

## 🔄 Modo Híbrido

El sistema puede funcionar en modo híbrido:

- **Neon**: Prospectos (si está configurado)
- **Airtable**: Usuarios (siempre)

Para activar modo híbrido, solo configura `NEON_DATABASE_URL`.

## ✅ Verificación

Después de configurar, verifica:

1. Abre la consola del navegador
2. Deberías ver: `🗄️ NeonService inicializado`
3. Al cargar prospectos: `🔍 Obteniendo prospectos de Neon...`
4. Sin errores 429 (rate limiting)

## 💰 Costos

**Plan Gratuito de Neon:**
- 0.5 GB storage
- 1 proyecto
- Sin límite de requests
- Perfecto para empezar

**Plan Pago:**
- Desde $19/mes
- Más storage
- Mejor rendimiento
- Soporte prioritario

## 🆘 Troubleshooting

### Error: "NEON_DATABASE_URL not configured"
- Verifica que la variable esté en Vercel
- Reinicia el deployment

### Error: "Connection refused"
- Verifica el connection string
- Asegúrate de que Neon esté activo

### Error: "Table does not exist"
- Ejecuta el SQL de creación de tabla
- Verifica que estés en la base correcta
