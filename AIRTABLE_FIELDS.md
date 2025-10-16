# 📋 Estructura Real de tu Tabla de Airtable

## ✅ Campos Actuales en tu Base de Datos

Según el análisis de tu Airtable, estos son los campos que ya tienes:

| # | Nombre del Campo | Tipo | Descripción |
|---|------------------|------|-------------|
| 1 | `email` | Single line text | Email del usuario (login) |
| 2 | `first_name` | Single line text | Primer nombre |
| 3 | `last_name` | Single line text | Apellido(s) |
| 4 | `password_hash` | Single line text | Contraseña del usuario |
| 5 | `role` | Single select | Rol del usuario |
| 6 | `status` | Single select | Estado de la cuenta |
| 7 | `has_paid` | Checkbox | Si el usuario ha pagado |
| 8 | `created_at` | Date | Fecha de creación |

---

## ✅ NO Necesitas Cambiar Nada en Airtable

La aplicación ya está configurada para trabajar con tus campos actuales. Los cambios realizados fueron en el código, no en Airtable.

---

## 📊 Mapeo de Campos

La aplicación mapea automáticamente:

| Campo en la App | Campo en Airtable | Transformación |
|-----------------|-------------------|----------------|
| `email` | `email` | Directo |
| `name` | `first_name + last_name` | Se combinan |
| `password` | `password_hash` | Directo |
| `role` | `role` | Directo |
| `status` | `status` | Directo |
| `hasPaid` | `has_paid` | Directo |
| `createdAt` | `created_at` | Directo |
| `lastLogin` | `last_login` | Se crea al hacer login |

---

## 🆕 Campos Opcionales que Puedes Agregar

Si quieres agregar más información de usuario, puedes crear estos campos:

| Nombre del Campo | Tipo | Uso |
|------------------|------|-----|
| `company` | Single line text | Empresa del usuario |
| `profile_image` | URL | Foto de perfil |
| `last_login` | Date | Última sesión (se actualiza automáticamente) |

---

## ✅ Valores para Single Select

### Campo: `role`

Opciones recomendadas:
- `user` (por defecto)
- `admin`
- `manager`
- `support`

### Campo: `status`

Opciones recomendadas:
- `active` (por defecto)
- `inactive`
- `suspended`
- `pending`

---

## 🔐 Nota sobre Contraseñas

El campo `password_hash` actualmente almacena contraseñas en texto plano.

**Para producción, considera:**
1. Implementar hashing de contraseñas en un backend
2. Usar bcrypt o similar
3. No exponer las contraseñas en el frontend

---

## 📝 Ejemplo de Usuario en Airtable

Así debería verse un registro completo:

```
email: admin@example.com
first_name: Admin
last_name: User
password_hash: admin123
role: admin (seleccionar del dropdown)
status: active (seleccionar del dropdown)
has_paid: ✓ (marcado)
created_at: 2025-10-09 (fecha actual)
```

---

## ✅ Todo Está Listo

No necesitas modificar nada en Airtable. La aplicación ya está adaptada para trabajar con tu estructura actual de campos.

**¡Ahora intenta hacer login nuevamente!** 🎉


