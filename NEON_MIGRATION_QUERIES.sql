-- ============================================
-- QUERIES PARA MIGRACIÓN DE AIRTABLE A NEON
-- ============================================
-- Ejecuta estos queries en tu base de datos Neon
-- Asegúrate de tener la tabla Prospectos ya creada

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(50) DEFAULT 'active',
    empresa VARCHAR(255),
    phone VARCHAR(50),
    profile_image TEXT,
    has_paid BOOLEAN DEFAULT false,
    token_api TEXT,
    stripe_customer_id VARCHAR(255),
    is_team_member BOOLEAN DEFAULT false,
    team_owner_email VARCHAR(255),
    member_role VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_owner ON users(team_owner_email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: workspaces
-- ============================================
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id VARCHAR(255) UNIQUE NOT NULL, -- ID del workspace desde GPTMaker API
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credits DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_workspace_id ON workspaces(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_status ON workspaces(status);

-- Trigger para actualizar updated_at en workspaces
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ACTUALIZAR TABLA PROSPECTOS (si es necesario)
-- ============================================
-- Si la tabla Prospectos ya existe, asegúrate de que tenga estos campos:
-- (Ajusta según tu estructura actual)

-- Verificar si existen los campos necesarios en Prospectos
-- Si no existen, ejecuta estos ALTER TABLE:

-- ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
-- ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS workspace_id VARCHAR(255);
-- ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Índices para Prospectos (si no existen)
-- CREATE INDEX IF NOT EXISTS idx_prospectos_user_email ON prospectos(user_email);
-- CREATE INDEX IF NOT EXISTS idx_prospectos_workspace_id ON prospectos(workspace_id);
-- CREATE INDEX IF NOT EXISTS idx_prospectos_user_id ON prospectos(user_id);

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE users IS 'Tabla de usuarios del sistema';
COMMENT ON TABLE workspaces IS 'Tabla de workspaces asociados a usuarios';
COMMENT ON COLUMN users.email IS 'Email único del usuario';
COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña (considerar usar bcrypt)';
COMMENT ON COLUMN users.team_owner_email IS 'Email del dueño del equipo (si es miembro)';
COMMENT ON COLUMN workspaces.workspace_id IS 'ID del workspace desde GPTMaker API';
COMMENT ON COLUMN workspaces.user_id IS 'Usuario propietario del workspace';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta estos queries para verificar que las tablas se crearon correctamente:

-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name IN ('users', 'workspaces', 'prospectos')
-- ORDER BY table_name, ordinal_position;

