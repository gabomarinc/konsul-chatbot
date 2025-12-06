# 📋 Plan: Mostrar Campos Personalizados en Modal "Ver Prospecto"

## 🎯 Objetivo

**Solo mostrar** los campos personalizados de GPTMaker en el modal "Ver Prospecto", sin cambiar nada de Airtable.

---

## ✅ Lo que Ya Tenemos

1. ✅ **11 campos personalizados disponibles** en GPTMaker
2. ✅ **Método `getCustomFields()`** para obtener campos disponibles
3. ✅ **Método `getContactCustomFields(contactId)`** para obtener valores
4. ✅ **Modal "Ver Prospecto"** funcional

---

## 🔧 Lo que Necesitamos Hacer

### 1. Obtener el ContactId desde el Chat

- Usar `prospect.chatId` para encontrar el chat
- Obtener `chat.recipient` como `contactId`
- Si no hay `recipient`, usar `chat.id` como fallback

### 2. Cargar Campos Personalizados en el Modal

- Obtener lista de campos disponibles con `getCustomFields()`
- Obtener valores del contacto con `getContactCustomFields(contactId)`
- Mostrar solo los campos que tengan valores

### 3. Agregar Sección en el Modal

- Nueva sección "Campos Personalizados" antes de comentarios
- Mostrar cada campo con su nombre y valor
- Formato bonito y organizado

---

## 📊 Campos a Mostrar

Los 11 campos personalizados que ya existen:

1. Zona de interes
2. Perfil laboral
3. DUI
4. Constancia de salario
5. Comprobante de AFP
6. Declaración de renta
7. Comprobante de domicilio
8. Declaraciones de impuestos (1–2 años)
9. Estados de cuenta bancarios personales o del negocio
10. Constancias de ingreso o contratos con clientes
11. Modelo de casa de interes

---

## 🚀 Implementación

### Paso 1: Modificar `showProspectModal()`

- Agregar sección HTML para campos personalizados
- Cargar campos personalizados de forma asíncrona
- Mostrar loading mientras carga

### Paso 2: Crear método para obtener campos personalizados

- `loadProspectCustomFields(chatId)` - Nuevo método
- Obtener chat → obtener recipient → obtener campos personalizados

### Paso 3: Renderizar campos personalizados

- Mostrar solo campos con valores
- Formato bonito con iconos
- Soporte para URLs (mostrar como enlaces)

---

## 📝 Estructura del Código

```javascript
// En showProspectModal():
async loadProspectCustomFields(chatId) {
    // 1. Buscar chat
    // 2. Obtener recipient
    // 3. Obtener campos personalizados disponibles
    // 4. Obtener valores del contacto
    // 5. Renderizar en el modal
}
```

---

## ⚠️ Consideraciones

1. **Si no hay contactId:** Mostrar mensaje "No se encontraron campos personalizados"
2. **Si hay error:** Mostrar mensaje de error pero no romper el modal
3. **Loading state:** Mostrar spinner mientras carga
4. **Valores vacíos:** No mostrar campos sin valores

---

## ✅ Resultado Esperado

En el modal "Ver Prospecto" se mostrará:
- Información del Prospecto (Airtable)
- Imágenes
- Documentos
- **Campos Personalizados (GPTMaker)** ← NUEVO
- Comentarios (Airtable)

