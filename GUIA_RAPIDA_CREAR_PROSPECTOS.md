# ⚡ Guía Rápida: Crear Tabla "Prospectos" en Airtable

## 🎯 Pasos Rápidos (5 minutos)

### Paso 1: Abrir Airtable
1. Ve a: https://airtable.com
2. Entra a tu base: `appoqCG814jMJbf4X`

### Paso 2: Crear Tabla
- Haz clic en el botón **"+"** (arriba, al lado de las pestañas)
- Nombre: **`Prospectos`**

### Paso 3: Agregar Campos

#### ✅ Campo 1: `nombre`
```
Tipo: Single line text
Nombre: nombre
```

#### ✅ Campo 2: `chat_id`
```
Tipo: Single line text
Nombre: chat_id
```

#### ✅ Campo 3: `fecha_extraccion`
```
Tipo: Date
Nombre: fecha_extraccion
✅ Marcar "Include time"
```

---

## 📋 Campos Opcionales (Agregar si quieres)

### Campo 4: `telefono`
```
Tipo: Phone number
Nombre: telefono
```

### Campo 5: `canal`
```
Tipo: Single select
Nombre: canal
Opciones:
  - WhatsApp
  - Instagram
  - Facebook
  - Telegram
  - Otro
```

### Campo 6: `estado`
```
Tipo: Single select
Nombre: estado
Opciones:
  - Nuevo
  - Contactado
  - Interesado
  - Calificado
  - Descartado
Valor por defecto: Nuevo
```

### Campo 7: `imagenes_urls`
```
Tipo: Long text
Nombre: imagenes_urls
```

---

## ✅ Lista de Verificación

- [ ] Tabla "Prospectos" creada
- [ ] Campo `nombre` (Single line text)
- [ ] Campo `chat_id` (Single line text)
- [ ] Campo `fecha_extraccion` (Date con hora)

**¡Con estos 3 campos mínimos ya puedes empezar!** 🚀

---

## 📸 Referencia Visual

```
┌─────────────────────────────────────────────┐
│  Prospectos                                 │
├─────────────────────────────────────────────┤
│  nombre      │  chat_id     │  fecha_ext...│
├──────────────┼──────────────┼──────────────┤
│  Juan...     │  chat_123    │  2024-01-15  │
│  María...    │  chat_456    │  2024-01-16  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Resumen

**Mínimo necesario:**
1. Tabla: `Prospectos`
2. Campo: `nombre` (texto)
3. Campo: `chat_id` (texto)
4. Campo: `fecha_extraccion` (fecha)

**¡Listo para codificar!** ✅



