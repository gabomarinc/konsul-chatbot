# 🧪 Instrucciones para Probar Campos Personalizados

## 📋 Campos Personalizados Necesarios

1. **Zona de Interes**
2. **Perfil Laboral**
3. **DUI**
4. **Constancia de salario**
5. **Comprobante de AFP**
6. **Declaración de renta**
7. **Comprobante de domicilio**
8. **Declaraciones de impuestos (1-2 años)**
9. **Estados de cuenta bancarios personales o del domicilio**
10. **Constancias de ingreso o contratos con clientes**

---

## 🚀 Cómo Ejecutar las Pruebas

### Paso 1: Abrir el Dashboard

1. Abre el dashboard en tu navegador
2. Inicia sesión si es necesario
3. Abre la consola del navegador (F12 o Cmd+Option+I en Mac)

### Paso 2: Ejecutar las Pruebas

En la consola del navegador, escribe:

```javascript
testCustomFields()
```

Y presiona Enter.

### Paso 3: Revisar los Resultados

El script te mostrará:

1. ✅ **Campos personalizados encontrados** en tu workspace
2. 📊 **Estructura de un chat** de ejemplo
3. 📨 **Mensajes del chat** para análisis
4. 📋 **Comparación** entre campos necesarios y encontrados

---

## 📊 Qué Buscar en los Resultados

### 1. Campos Personalizados

El script verificará si los siguientes campos ya existen:
- Zona de Interes
- Perfil Laboral
- DUI
- Constancia de salario
- Comprobante de AFP
- Declaración de renta
- Comprobante de domicilio
- Declaraciones de impuestos (1-2 años)
- Estados de cuenta bancarios personales o del domicilio
- Constancias de ingreso o contratos con clientes

**Si un campo muestra ❌**, significa que necesita crearse en GPTMaker.

### 2. Estructura del Chat

El script mostrará todas las propiedades del chat, incluyendo:
- ID del chat
- Nombre del contacto
- Teléfono
- Propiedades relacionadas con contactos o custom fields

### 3. Información de Contacto

Buscaremos propiedades como:
- `contactId`
- `userId`
- `customerId`
- `customFields`
- O cualquier propiedad que pueda relacionar el chat con un contacto

---

## 🔍 Funciones Auxiliares Disponibles

Después de ejecutar las pruebas, también puedes usar:

### Buscar un Campo Personalizado

```javascript
buscarCampoPersonalizado("DUI")
```

Esto buscará un campo personalizado que contenga "DUI" en su nombre.

---

## 📝 Próximos Pasos

Después de las pruebas:

1. **Anotar qué campos faltan** y crearlos en GPTMaker
2. **Verificar la estructura del contacto** para ver cómo asociar campos personalizados
3. **Investigar endpoints** para obtener/actualizar valores de campos personalizados
4. **Implementar la integración** completa

---

## ⚠️ Notas Importantes

- Las pruebas necesitan que el dashboard esté completamente cargado
- Asegúrate de tener un token de GPTMaker válido configurado
- Si no hay chats disponibles, algunas pruebas pueden fallar (es normal)

---

## 🆘 Si Algo Sale Mal

1. **"GPTMakerAPI no está disponible"**
   - Asegúrate de que el dashboard esté completamente cargado
   - Recarga la página y espera a que cargue todo

2. **"No se pudieron obtener chats"**
   - Verifica que tengas chats en tu cuenta de GPTMaker
   - Verifica que el token de API esté configurado correctamente

3. **"Error obteniendo campos personalizados"**
   - Verifica que tengas permisos en el workspace
   - Verifica que el token tenga acceso al workspace

---

## 📸 Capturar Resultados

Cuando ejecutes las pruebas, puedes:

1. **Hacer screenshot** de la consola con los resultados
2. **Copiar los logs** importantes
3. **Compartir los resultados** para continuar con la implementación

¡Listo para probar! 🚀



