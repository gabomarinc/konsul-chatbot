# 🔍 Debug de Airtable - Guía de Solución de Problemas

## ❌ Error: "Credenciales inválidas"

Si recibes este error al intentar hacer login, sigue estos pasos para diagnosticar el problema:

---

## 📋 Checklist de Verificación

### 1. ✅ Verificar que el Token está Configurado

Abre la consola del navegador (F12) y ejecuta:

```javascript
window.airtableService.apiKey
```

**Debería mostrar:**
```
"TU_TOKEN_AIRTABLE_AQUI"
```

**Si muestra `null`:**
- El archivo `airtable.init.js` no se está cargando
- Verifica que el archivo existe en `src/config/airtable.init.js`
- Verifica que el HTML incluye el script

---

### 2. ✅ Verificar Modo de Autenticación

En la consola, ejecuta:

```javascript
window.authService.useAirtable
```

**Debería mostrar:** `true`

**Si muestra `false`:**
- Airtable no está configurado correctamente
- Ejecuta manualmente: `window.authService.setAirtableApiKey('TU_TOKEN')`

---

### 3. ✅ Verificar Estructura de la Tabla en Airtable

Ve a tu tabla de Airtable y verifica que tiene estos campos EXACTOS:

| Campo Requerido | Tipo | Ejemplo |
|-----------------|------|---------|
| `Email` | Single line text | test@example.com |
| `Password` | Single line text | test123 |
| `Name` | Single line text | Test User |
| `Role` | Single select | user |
| `Status` | Single select | active |

**⚠️ IMPORTANTE:** Los nombres de los campos distinguen mayúsculas/minúsculas:
- ✅ Correcto: `Email`
- ❌ Incorrecto: `email`, `EMAIL`, `E-mail`

---

### 4. ✅ Probar Conexión con Airtable

En la consola del navegador, ejecuta este código para probar la conexión:

```javascript
// Probar búsqueda de usuario
const result = await window.airtableService.getUserByEmail('test@example.com');
console.log('Resultado:', result);
```

**Si funciona correctamente, verás:**
```
📡 URL de Airtable: https://api.airtable.com/v0/...
📡 Response status: 200
📊 Datos recibidos de Airtable: {...}
✅ Usuario encontrado en Airtable
👤 Datos del usuario: {...}
```

**Si hay error, verás uno de estos:**

#### Error 401 - Token Inválido
```
❌ Error de Airtable: {error: {type: 'AUTHENTICATION_REQUIRED'}}
```
**Solución:** Verifica que el token es correcto y tiene permisos

#### Error 404 - Tabla no Encontrada
```
❌ Error de Airtable: {error: {type: 'TABLE_NOT_FOUND'}}
```
**Solución:** Verifica que la tabla se llama exactamente `Users`

#### Usuario no encontrado
```
⚠️ Usuario no encontrado en Airtable
📊 Registros recibidos: 0
```
**Solución:** El email no existe en Airtable o tiene espacios/mayúsculas diferentes

---

### 5. ✅ Verificar Datos del Usuario en Airtable

1. Ve a tu base de Airtable
2. Abre la tabla `Users`
3. Encuentra el usuario con el que intentas hacer login
4. Verifica que tenga datos en estos campos:
   - **Email:** debe coincidir exactamente (sin espacios extras)
   - **Password:** debe coincidir exactamente
   - **Status:** debe ser `active` (no `inactive` o `suspended`)

---

## 🔍 Logs Detallados para Debug

Con el código actualizado, al intentar login verás estos logs en la consola:

```javascript
// 1. Inicio del proceso
🔐 Iniciando proceso de login...
🗄️ Autenticando con Airtable...
📧 Email: test@example.com
🔐 Password length: 7

// 2. Búsqueda en Airtable
🔍 Buscando usuario por email: test@example.com
📡 URL de Airtable: https://api.airtable.com/v0/appoqCG814jMJbf4X/Users?filterByFormula=...
🔑 Headers: {Authorization: "Bearer TU_TOKEN_AQUI", Content-Type: "application/json"}
📡 Response status: 200
📊 Datos recibidos de Airtable: {records: [...]}

// 3. Usuario encontrado
✅ Usuario encontrado en Airtable
👤 Datos del usuario: {id: "rec...", fields: {...}}
📊 Resultado de búsqueda: {success: true, user: {...}}

// 4. Usuario transformado
👤 Usuario encontrado: {
    id: "recXXXXXXXXXXXXXX",
    email: "test@example.com",
    name: "Test User",
    hasPassword: true
}

// 5. Verificación de contraseña
🔐 Verificación de contraseña: CORRECTA ✓
🔐 Password almacenada: test123
🔐 Password ingresada: test123

// 6. Login exitoso
✅ Login exitoso: test@example.com
```

---

## ❌ Errores Comunes y Soluciones

### Error: "Usuario no encontrado"

**Causa:** El email no existe en Airtable o tiene diferencias mínimas

**Solución:**
1. Copia el email EXACTAMENTE de Airtable
2. Pégalo en el formulario de login
3. Verifica que no haya espacios al inicio o final

---

### Error: "Response status: 401"

**Causa:** Token inválido o sin permisos

**Solución:**
1. Ve a https://airtable.com/create/tokens
2. Verifica que tu token existe y no expiró
3. Verifica que tiene permisos:
   - `data.records:read` ✓
   - `data.records:write` ✓
4. Verifica que tiene acceso a la base `appoqCG814jMJbf4X` ✓

---

### Error: "Password almacenada: undefined"

**Causa:** El campo Password no existe o está vacío en Airtable

**Solución:**
1. Ve a tu tabla Users en Airtable
2. Verifica que la columna se llama exactamente `Password`
3. Verifica que el usuario tiene un valor en ese campo
4. Agrega una contraseña si está vacío

---

### Error: "Verificación de contraseña: INCORRECTA ✗"

**Causa:** La contraseña no coincide

**Verifica en el log:**
```
🔐 Password almacenada: test123
🔐 Password ingresada: test1234  ← No coincide
```

**Solución:**
1. Copia la contraseña EXACTAMENTE de Airtable
2. Pégala en el formulario de login
3. Las contraseñas distinguen mayúsculas/minúsculas

---

## 🧪 Crear Usuario de Prueba

Si no tienes un usuario, créalo así:

1. Ve a tu tabla Users en Airtable
2. Click en "+" para agregar un registro
3. Llena estos campos OBLIGATORIOS:

```
Email: test@example.com
Password: test123
Name: Test User
Role: user
Status: active
```

4. Guarda el registro
5. Intenta login con:
   - Email: `test@example.com`
   - Password: `test123`

---

## 📞 Soporte Adicional

Si sigues teniendo problemas:

1. Abre la consola del navegador (F12)
2. Intenta hacer login
3. Copia TODOS los logs que aparecen
4. Revisa qué paso específico está fallando
5. Compara con los logs esperados arriba

---

## ✅ Checklist Final

- [ ] Token configurado correctamente
- [ ] `useAirtable` es `true`
- [ ] Tabla se llama exactamente `Users`
- [ ] Campos tienen nombres correctos (mayúsculas/minúsculas)
- [ ] Usuario existe en Airtable
- [ ] Email coincide exactamente
- [ ] Password coincide exactamente
- [ ] Status es `active`
- [ ] Los logs muestran "Response status: 200"
- [ ] Los logs muestran "Usuario encontrado"



