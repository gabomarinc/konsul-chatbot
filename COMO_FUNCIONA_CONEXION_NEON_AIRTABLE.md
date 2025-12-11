# 🔗 Cómo Funciona la Conexión entre Neon y Airtable

## 📊 Arquitectura

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Airtable      │         │   Frontend       │         │   Neon          │
│   (Usuarios)    │◄────────┤  (Dashboard)     ├─────────►│  (Prospectos)   │
└─────────────────┘         └──────────────────┘         └─────────────────┘
      │                              │                            │
      │  1. Login                    │                            │
      │  2. Obtener usuario          │                            │
      │  3. Email + Workspace ID     │                            │
      └──────────────────────────────┼────────────────────────────┘
                                      │
                                      │ Usa email/workspace_id
                                      │ para filtrar en Neon
                                      ▼
```

## 🔄 Flujo de Conexión

### 1. **Usuario se Autentica (Airtable)**
```javascript
// Usuario hace login
authService.login(email, password)
  ↓
// Se obtiene el usuario de Airtable
currentUser = {
  email: "usuario@ejemplo.com",
  id: "user123",
  workspaceId: "workspace456"
}
```

### 2. **Crear Prospecto (Neon)**
```javascript
// Cuando se crea un prospecto
prospectsService.saveProspect(prospectData)
  ↓
// 1. Obtiene usuario actual de Airtable
getCurrentUserInfo() 
  → userEmail: "usuario@ejemplo.com"
  → workspaceId: "workspace456"
  ↓
// 2. Agrega estos datos al prospecto
prospectData.userEmail = "usuario@ejemplo.com"
prospectData.workspaceId = "workspace456"
  ↓
// 3. Guarda en Neon con estos campos
INSERT INTO prospectos (..., user_email, workspace_id)
VALUES (..., 'usuario@ejemplo.com', 'workspace456')
```

### 3. **Obtener Prospectos (Neon)**
```javascript
// Cuando se cargan prospectos
prospectsService.getAllProspects()
  ↓
// 1. Obtiene usuario actual de Airtable
getCurrentUserInfo()
  → userEmail: "usuario@ejemplo.com"
  → workspaceId: "workspace456"
  ↓
// 2. Filtra en Neon usando estos datos
SELECT * FROM prospectos 
WHERE user_email = 'usuario@ejemplo.com' 
  AND workspace_id = 'workspace456'
```

## 🔑 Puntos Clave

### ✅ **El Usuario SIEMPRE viene de Airtable**
- Login → Airtable
- Autenticación → Airtable
- Información del usuario → Airtable

### ✅ **Los Prospectos se guardan en Neon con referencia al usuario**
- Cada prospecto tiene `user_email` y `workspace_id`
- Estos campos conectan el prospecto con el usuario de Airtable

### ✅ **Filtrado automático por usuario**
- Al consultar prospectos, se filtra por `user_email` y `workspace_id`
- Solo se muestran los prospectos del usuario actual

## 📝 Ejemplo Práctico

### Escenario: Usuario "Juan" crea un prospecto

1. **Juan hace login**
   ```
   Airtable → Usuario: juan@empresa.com, Workspace: ws_123
   ```

2. **Juan extrae prospectos de chats**
   ```
   Frontend → Obtiene: juan@empresa.com, ws_123
   Frontend → Crea prospecto en Neon:
     {
       nombre: "María",
       chat_id: "chat_abc",
       user_email: "juan@empresa.com",  ← De Airtable
       workspace_id: "ws_123"            ← De Airtable
     }
   ```

3. **Juan ve sus prospectos**
   ```
   Frontend → Obtiene: juan@empresa.com, ws_123
   Neon → SELECT * FROM prospectos 
          WHERE user_email = 'juan@empresa.com'
            AND workspace_id = 'ws_123'
   Resultado: Solo prospectos de Juan
   ```

4. **Otro usuario "Pedro" hace login**
   ```
   Airtable → Usuario: pedro@empresa.com, Workspace: ws_456
   Neon → SELECT * FROM prospectos 
          WHERE user_email = 'pedro@empresa.com'
            AND workspace_id = 'ws_456'
   Resultado: Solo prospectos de Pedro (no ve los de Juan)
   ```

## 🛡️ Seguridad

- ✅ Cada usuario solo ve sus propios prospectos
- ✅ Filtrado automático por `user_email` y `workspace_id`
- ✅ No se pueden ver prospectos de otros usuarios
- ✅ El `user_email` se obtiene del token de autenticación (Airtable)

## 🔄 Fallback

Si Neon no está disponible:
- ✅ Automáticamente usa Airtable
- ✅ Mismo comportamiento, solo más lento
- ✅ Sin cambios para el usuario

## 💡 Ventajas de esta Arquitectura

1. **Separación de responsabilidades**
   - Airtable: Usuarios y autenticación (baja frecuencia)
   - Neon: Prospectos (alta frecuencia, sin rate limiting)

2. **Escalabilidad**
   - Neon puede manejar millones de prospectos
   - Airtable maneja usuarios (mucho menos datos)

3. **Rendimiento**
   - Queries SQL rápidas en Neon
   - Sin rate limiting
   - Índices optimizados

4. **Flexibilidad**
   - Puedes migrar usuarios a Neon después si quieres
   - O mantener Airtable solo para usuarios
