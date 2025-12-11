# ⚡ Configuración Rápida: Prospectos en Airtable

## 🎯 Configuración Mínima (5 minutos)

### Paso 1: Crear la Tabla
1. Abre tu base de Airtable: `appoqCG814jMJbf4X`
2. Haz clic en **"+"** (agregar tabla)
3. Nombra la tabla: **`Prospectos`**

### Paso 2: Agregar Campos Mínimos (3 campos obligatorios)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `nombre` | **Single line text** | Nombre del prospecto |
| `chat_id` | **Single line text** | ID del chat (para vincular) |
| `fecha_extraccion` | **Date** | Fecha de extracción |

**¡Listo!** Con estos 3 campos ya puedes empezar.

---

## 📋 Configuración Completa (Opcional)

Si quieres más funcionalidades, agrega estos campos adicionales:

| Campo | Tipo | Opciones/Ejemplo |
|-------|------|------------------|
| `telefono` | Phone number | +52 1 234 567 8900 |
| `canal` | Single select | WhatsApp, Instagram, Facebook, Telegram |
| `estado` | Single select | Nuevo, Contactado, Interesado, Calificado |
| `imagenes_urls` | Long text | URLs en formato JSON |
| `agente_id` | Single line text | ID del agente |

---

## ⚡ Alternativa: Sin Airtable

Si prefieres no configurar Airtable ahora:
- ✅ Usaremos `localStorage` (solo navegador)
- ✅ Cero configuración
- ⚠️ Datos locales (no se sincronizan)

---

## ✅ Checklist Rápida

- [ ] Crear tabla "Prospectos"
- [ ] Agregar campo `nombre` (Single line text)
- [ ] Agregar campo `chat_id` (Single line text)  
- [ ] Agregar campo `fecha_extraccion` (Date)

**¡Con esto ya podemos empezar a codificar!** 🚀



