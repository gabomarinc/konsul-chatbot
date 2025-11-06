# 🧪 Guía para Probar la Integración de Stripe

## 📋 Pasos para Probar

### Opción 1: Usar el Script de Prueba Automático (Recomendado)

1. **Abre la aplicación en tu navegador**
   - Inicia sesión con tu usuario
   - Ve al dashboard principal

2. **Abre la consola del navegador**
   - Presiona `F12` o `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Ve a la pestaña "Console"

3. **Ejecuta el script de prueba**
   ```javascript
   testBillingStripe()
   ```

4. **Revisa los resultados**
   - El script te mostrará paso a paso qué está funcionando
   - Te indicará si hay problemas y cómo solucionarlos

### Opción 2: Probar Manualmente desde la Interfaz

1. **Inicia sesión en la aplicación**

2. **Ve a la sección de Facturación**
   - Haz clic en tu perfil (arriba a la derecha)
   - Selecciona "Mi Perfil"
   - Haz clic en la pestaña "Facturación"

3. **Verifica qué datos se muestran**
   - **Información del Cliente**: Debe mostrar datos del usuario
   - **Suscripciones Activas**: Muestra suscripciones si las hay
   - **Historial de Facturas**: Muestra facturas si las hay
   - **Métodos de Pago**: Muestra métodos de pago si los hay

4. **Abre la consola del navegador** (`F12`)
   - Revisa los mensajes en la consola
   - Busca mensajes que indiquen si se están usando datos reales o simulados

### Opción 3: Verificar desde la Consola Manualmente

1. **Abre la consola del navegador** (`F12`)

2. **Verifica el usuario actual**
   ```javascript
   const user = window.authService?.getCurrentUser();
   console.log('Usuario:', user);
   console.log('Stripe Customer ID:', user?.stripeCustomerId);
   ```

3. **Verifica StripeService**
   ```javascript
   const stripeService = new StripeService();
   await stripeService.initialize();
   ```

4. **Obtén información del cliente**
   ```javascript
   const customerInfo = await stripeService.getCustomerInfo();
   console.log('Customer Info:', customerInfo);
   ```

5. **Obtén suscripciones**
   ```javascript
   const subscriptions = await stripeService.getSubscriptions();
   console.log('Subscriptions:', subscriptions);
   ```

6. **Obtén facturas**
   ```javascript
   const invoices = await stripeService.getInvoices();
   console.log('Invoices:', invoices);
   ```

7. **Obtén métodos de pago**
   ```javascript
   const paymentMethods = await stripeService.getPaymentMethods();
   console.log('Payment Methods:', paymentMethods);
   ```

## 🔍 Qué Buscar en los Resultados

### ✅ Si Todo Está Bien Configurado

Deberías ver:
- ✅ `stripe_customer_id` configurado en el usuario
- ✅ Backend disponible y respondiendo (si lo implementaste)
- ✅ Datos reales de Stripe (no datos simulados)
- ✅ Información del cliente con ID real (no `cus_demo123`)
- ✅ Suscripciones, facturas y métodos de pago reales (si existen)

### ⚠️ Si Hay Problemas

#### Problema: "Usuario no tiene stripe_customer_id configurado"

**Solución:**
1. Ve a Airtable
2. Agrega el campo `stripe_customer_id` (o `stripeCustomerId`) en tu tabla de usuarios
3. Para cada usuario, agrega el ID del cliente de Stripe (formato: `cus_xxxxx`)
4. Recarga la página y vuelve a probar

**Cómo obtener el Stripe Customer ID:**
- Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
- Navega a **Customers**
- Busca el cliente por email
- Copia el ID (formato: `cus_xxxxx`)

#### Problema: "Backend no disponible"

**Solución:**
- Esto es normal si no has implementado el backend
- Los datos se mostrarán como simulados
- Para obtener datos reales, implementa el backend usando `backend-example.js`

#### Problema: "Datos simulados"

**Solución:**
- Verifica que el usuario tenga `stripe_customer_id` en Airtable
- Si lo tiene, verifica que el backend esté funcionando
- Revisa la consola para ver mensajes de error específicos

## 📊 Interpretación de los Resultados

### Datos Reales vs Simulados

**Datos Reales:**
- Customer ID: `cus_1A2B3C4D5E6F7G8H` (formato real de Stripe)
- Email: El email real del usuario
- Fechas: Fechas reales de creación y períodos
- Montos: Montos reales de facturas y suscripciones

**Datos Simulados:**
- Customer ID: `cus_demo123` o similar
- Email: Puede ser el email del usuario pero con datos de prueba
- Fechas: Fechas calculadas (hace 15 días, etc.)
- Montos: Montos fijos de ejemplo ($29.99)

## 🎯 Pruebas Específicas

### Probar con Usuario SIN stripe_customer_id

1. Asegúrate de que el usuario NO tenga `stripe_customer_id` en Airtable
2. Inicia sesión
3. Ve a Facturación
4. Deberías ver datos simulados
5. En la consola verás: `⚠️ Usuario no tiene stripe_customer_id configurado`

### Probar con Usuario CON stripe_customer_id

1. Agrega `stripe_customer_id` en Airtable
2. Inicia sesión
3. Ve a Facturación
4. Si hay backend: deberías ver datos reales
5. Si NO hay backend: verás datos simulados pero con el ID real

### Probar Backend

1. Implementa el backend usando `backend-example.js`
2. Asegúrate de que esté corriendo
3. Inicia sesión
4. Ve a Facturación
5. En la consola deberías ver: `✅ Información del cliente obtenida desde backend`

## 🐛 Solución de Problemas

### La pantalla de facturación no carga

1. Abre la consola (`F12`)
2. Busca errores en rojo
3. Verifica que `BillingManager` esté inicializado:
   ```javascript
   console.log(window.billingManager);
   ```

### Los datos no se actualizan

1. Recarga la página
2. Verifica que el usuario tenga `stripe_customer_id` en Airtable
3. Limpia el caché del navegador
4. Vuelve a iniciar sesión

### Error de CORS o conexión

- Si intentas conectar directamente a la API de Stripe desde el frontend, verás errores de CORS
- Esto es normal y por eso necesitas un backend
- El backend debe hacer las llamadas a Stripe desde el servidor

## 📝 Notas Importantes

1. **Los datos simulados son normales** si no tienes backend implementado
2. **El `stripe_customer_id` es esencial** para obtener datos reales
3. **El backend es opcional** pero recomendado para producción
4. **Los datos se cargan automáticamente** cuando abres la pestaña de Facturación

## 💡 Próximos Pasos

Una vez que hayas probado:

1. Si todo funciona con datos simulados: ✅ Listo para desarrollo
2. Si quieres datos reales: Agrega `stripe_customer_id` en Airtable
3. Si quieres backend: Implementa usando `backend-example.js`
4. Si hay errores: Revisa la consola y los mensajes de error específicos

