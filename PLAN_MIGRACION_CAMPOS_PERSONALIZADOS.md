# 📋 Plan de Migración: Prospectos de Airtable a Campos Personalizados de GPTMaker

## 🎯 Objetivo

Eliminar completamente la dependencia de Airtable para los prospectos y usar solo los campos personalizados de GPTMaker.

---

## 📊 Mapeo de Campos

### Campos Personalizados Disponibles en GPTMaker:

1. **zonaDeInteres** (Zona de interes) - STRING
2. **perfilLaboral** (Perfil laboral) - STRING
3. **dui** (DUI) - STRING
4. **constanciaDeSalario** (Constancia de salario) - STRING
5. **comprobanteDeAfp** (Comprobante de AFP) - STRING
6. **declaracionDeRenta** (Declaración de renta) - STRING
7. **comprobanteDeDomicilio** (Comprobante de domicilio) - STRING
8. **declaracionesDeImpuestos(1–2Años)** (Declaraciones de impuestos) - STRING
9. **estadosDeCuentaBancariosPersonalesODelNegocio** (Estados de cuenta) - STRING
10. **constanciasDeIngresoOContratosConClientes** (Constancias de ingreso) - STRING
11. **modeloDeCasaDeInteres** (Modelo de casa de interes) - STRING

### Campos de Prospecto que Necesitamos Guardar:

| Campo Prospecto | Campo Personalizado GPTMaker | Notas |
|----------------|------------------------------|-------|
| nombre | (usar `chat.name` directamente) | No necesitamos campo personalizado |
| chatId | (usar `chat.id` directamente) | No necesitamos campo personalizado |
| imagenesUrls | **constanciaDeSalario** o crear campo nuevo | Usar JSON string con URLs |
| documentosUrls | **comprobanteDeAfp** o crear campo nuevo | Usar JSON string con URLs |
| telefono | (usar `chat.whatsappPhone` directamente) | No necesitamos campo personalizado |
| fechaExtraccion | (timestamp del sistema) | No necesitamos campo personalizado |
| comentarios | Crear campo nuevo o usar campo existente | Usar JSON string para historial |

---

## 🔧 Estrategia de Implementación

### Opción 1: Usar Campos Personalizados Existentes para Datos de Prospecto

**Problema**: Los campos personalizados existentes son para documentos específicos (DUI, constancia de salario, etc.), no para datos generales del prospecto.

**Solución**: Necesitamos crear nuevos campos personalizados o usar los existentes de manera creativa.

### Opción 2: Usar el `recipient` del Chat como Contacto

**Estrategia**:
1. El `chat.recipient` es el ID del contacto en GPTMaker
2. Obtener/actualizar valores de campos personalizados usando ese `contactId`
3. Guardar datos del prospecto en campos personalizados del contacto

**Campos a crear/usar**:
- `nombreProspecto` - Nombre del prospecto
- `chatIdProspecto` - ID del chat vinculado
- `imagenesProspecto` - URLs de imágenes (JSON string)
- `documentosProspecto` - URLs de documentos (JSON string)
- `comentariosProspecto` - Historial de comentarios (JSON string)
- `telefonoProspecto` - Teléfono del prospecto
- `fechaExtraccionProspecto` - Fecha de extracción

### Opción 3: Usar Chats Directamente (Sin Contactos)

**Estrategia**:
1. Los chats ya tienen `name`, `recipient`, etc.
2. Guardar datos adicionales en campos personalizados del chat (si GPTMaker lo permite)
3. O usar el `recipient` como contacto y guardar datos ahí

---

## 🚀 Plan de Implementación

### Fase 1: Métodos en GPTMakerAPI ✅

- [x] `getContactCustomFields(contactId)` - Obtener valores de campos personalizados
- [x] `updateContactCustomFields(contactId, values)` - Actualizar valores
- [x] `getAllContacts()` - Obtener todos los contactos

### Fase 2: Modificar ProspectsService

- [ ] Cambiar `saveProspect()` para usar campos personalizados
- [ ] Cambiar `getAllProspects()` para obtener desde chats + campos personalizados
- [ ] Cambiar `getProspectByChatId()` para buscar por chat y obtener campos personalizados

### Fase 3: Actualizar Dashboard

- [ ] Modificar `loadProspects()` para usar nuevo método
- [ ] Asegurar que el modal funcione con datos de campos personalizados

### Fase 4: Eliminar Dependencia de Airtable

- [ ] Remover referencias a `airtableService` en `ProspectsService`
- [ ] Actualizar código que usa `airtableService` para prospectos

---

## ⚠️ Consideraciones Importantes

1. **Identificación de Contacto**: Necesitamos confirmar que `chat.recipient` es el ID del contacto
2. **Campos Personalizados**: Necesitamos crear campos nuevos o usar los existentes de manera creativa
3. **Compatibilidad**: Mantener compatibilidad con datos existentes en Airtable durante la transición
4. **Testing**: Probar exhaustivamente antes de eliminar Airtable completamente

---

## 📝 Próximos Pasos

1. **Probar endpoints de contactos** para confirmar que funcionan
2. **Crear campos personalizados nuevos** si es necesario (o usar los existentes)
3. **Implementar migración gradual** (soporte para ambos sistemas temporalmente)
4. **Eliminar Airtable** una vez confirmado que todo funciona




