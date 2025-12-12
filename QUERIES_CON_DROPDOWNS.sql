-- ============================================
-- QUERIES CON RESTRICCIONES DE DROPDOWN (ENUM)
-- ============================================
-- Estos queries crean las tablas con ENUMs que simulan los dropdowns de Airtable
-- ============================================

-- ============================================
-- TIPOS ENUM (Equivalente a dropdowns en Airtable)
-- ============================================

-- Roles de usuario (según lo que vi en tu interfaz)
CREATE TYPE user_role AS ENUM ('user', 'admin', 'member');

-- Estados de usuario (según lo que vi en tu interfaz)
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

-- Estados de workspace
CREATE TYPE workspace_status AS ENUM ('active', 'inactive', 'suspended');

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',              -- Solo permite: 'user', 'admin', 'member'
    status user_status DEFAULT 'active',         -- Solo permite: 'active', 'inactive', 'suspended', 'pending'
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
    status workspace_status DEFAULT 'active',   -- Solo permite: 'active', 'inactive', 'suspended'
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
ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS workspace_id VARCHAR(255);
ALTER TABLE prospectos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Índices para Prospectos
CREATE INDEX IF NOT EXISTS idx_prospectos_user_email ON prospectos(user_email);
CREATE INDEX IF NOT EXISTS idx_prospectos_workspace_id ON prospectos(workspace_id);
CREATE INDEX IF NOT EXISTS idx_prospectos_user_id ON prospectos(user_id);
CREATE INDEX IF NOT EXISTS idx_prospectos_chat_id ON prospectos(chat_id);

-- ============================================
-- EJEMPLO: Crear usuario con contraseña "admin123"
-- ============================================
-- INSERT INTO users (
--     email,
--     password_hash,
--     first_name,
--     last_name,
--     role,
--     status
-- ) VALUES (
--     'admin@ejemplo.com',
--     'admin123',
--     'Admin',
--     'Usuario',
--     'admin',        -- Debe ser: 'user', 'admin', o 'member'
--     'active'        -- Debe ser: 'active', 'inactive', 'suspended', o 'pending'
-- );

-- ============================================
-- VERIFICAR VALORES PERMITIDOS
-- ============================================
-- Ver todos los valores permitidos para role:
-- SELECT enum_range(NULL::user_role);

-- Ver todos los valores permitidos para status:
-- SELECT enum_range(NULL::user_status);

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Los ENUMs actúan como dropdowns: solo puedes insertar valores permitidos
-- 2. Si intentas insertar un valor no permitido, PostgreSQL dará error
-- 3. El frontend puede tener dropdowns visuales que muestren estas opciones
-- 4. Para agregar nuevos valores a un ENUM:
--    ALTER TYPE user_role ADD VALUE 'nuevo_valor';

