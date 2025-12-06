# 🎯 Implementación: Mostrar Campos Personalizados en Modal

## Objetivo

Agregar una sección en el modal "Ver Prospecto" para mostrar los **campos personalizados de GPTMaker** de cada chat, sin modificar Airtable.

---

## 📋 Pasos de Implementación

### 1. Agregar sección HTML en el modal

Agregar después de "Información del Prospecto" y antes de "Comentarios":

```html
<div class="prospect-custom-fields-section">
    <h3><i class="fas fa-tags"></i> Campos Personalizados</h3>
    <div id="customFieldsContainer">
        <div class="loading-custom-fields">
            <i class="fas fa-spinner fa-spin"></i>
            Cargando campos personalizados...
        </div>
    </div>
</div>
```

### 2. Crear método para cargar campos personalizados

```javascript
async loadProspectCustomFields(chatId, containerId) {
    // 1. Buscar el chat para obtener recipient
    // 2. Obtener campos personalizados disponibles
    // 3. Obtener valores del contacto
    // 4. Renderizar en el contenedor
}
```

### 3. Llamar al método cuando se abre el modal

En `showProspectModal()`, después de crear el modal:
```javascript
// Cargar campos personalizados de forma asíncrona
this.loadProspectCustomFields(prospect.chatId, 'customFieldsContainer');
```

---

## 📊 Campos a Mostrar

Los 11 campos personalizados disponibles:

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

## ✅ Estado Actual

- ✅ Campos personalizados disponibles confirmados
- ✅ Métodos de API creados
- ⏳ Pendiente: Mostrar en el modal

