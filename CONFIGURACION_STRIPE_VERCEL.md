# 🔧 Configuración de Stripe con Vercel Serverless Functions

## 📋 Resumen

Se han creado funciones serverless de Vercel para obtener datos directamente de Stripe. Estas funciones se ejecutan en el servidor de Vercel y hacen las llamadas seguras a la API de Stripe.

## 🚀 Funciones Creadas

Se han creado las siguientes funciones serverless en `/api/stripe/`:

1. **`/api/stripe/customer/[customerId].js`** - Obtiene información del cliente
2. **`/api/stripe/subscriptions/[customerId].js`** - Obtiene suscripciones del cliente
3. **`/api/stripe/invoices/[customerId].js`** - Obtiene facturas del cliente
4. **`/api/stripe/payment-methods/[customerId].js`** - Obtiene métodos de pago del cliente

## ⚙️ Configuración Requerida

### 1. Instalar Dependencias

```bash
npm install stripe
```

### 2. Configurar Variable de Entorno en Vercel

Necesitas agregar la clave secreta de Stripe como variable de entorno en Vercel:

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Ve a **Settings** > **Environment Variables**
3. Agrega la variable:
   - **Name**: `STRIPE_SECRET_KEY`
   - **Value**: Tu clave secreta de Stripe (formato: `sk_live_...` o `sk_test_...`)
   - **Environment**: Production, Preview, Development (marca todas)

### 3. Verificar que el Usuario Tenga `stripe_customer_id` en Airtable

Asegúrate de que cada usuario en Airtable tenga el campo `stripe_customer_id` (o `stripeCustomerId`) con el ID del cliente de Stripe.

## 🔄 Cómo Funciona

1. **Frontend** (`StripeService`):
   - Obtiene el `stripe_customer_id` del usuario autenticado desde Airtable
   - Hace una petición a `/api/stripe/customer/[customerId]` con el token de autenticación

2. **Backend** (Función Serverless):
   - Recibe la petición con el `customerId`
   - Verifica la autenticación (token Bearer)
   - Hace la llamada a la API de Stripe usando la clave secreta
   - Devuelve los datos al frontend

3. **Frontend** (`BillingManager`):
   - Recibe los datos reales de Stripe
   - Los renderiza en la pantalla de facturación

## 🧪 Probar la Integración

### Opción 1: Desde la Consola del Navegador

1. Inicia sesión en la aplicación
2. Abre la consola del navegador (`F12`)
3. Ejecuta:
   ```javascript
   testBillingStripe()
   ```

### Opción 2: Desde la Interfaz

1. Inicia sesión
2. Ve a **Mi Perfil** > **Facturación**
3. Verifica que se muestren los datos reales de Stripe

### Opción 3: Probar Endpoint Directamente

Desde la consola del navegador:

```javascript
// Obtener el stripe_customer_id del usuario
const user = window.authService?.getCurrentUser();
const customerId = user?.stripeCustomerId;

if (customerId) {
    // Probar endpoint
    const token = window.authService?.getToken();
    const response = await fetch(`/api/stripe/customer/${customerId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    console.log('Datos del cliente:', data);
} else {
    console.log('⚠️ Usuario no tiene stripe_customer_id');
}
```

## 🔍 Verificar que Funciona

### ✅ Si Todo Está Bien

Deberías ver en la consola:
- `✅ Información del cliente obtenida desde backend`
- `✅ X suscripción(es) obtenida(s) desde backend`
- `✅ X factura(s) obtenida(s) desde backend`
- `✅ X método(s) de pago obtenido(s) desde backend`

Y en la pantalla de facturación:
- Datos reales del cliente (ID real, no `cus_demo123`)
- Suscripciones reales (si las hay)
- Facturas reales (si las hay)
- Métodos de pago reales (si los hay)

### ⚠️ Si Hay Problemas

#### Error: "Unauthorized" (401)

- Verifica que el token de autenticación se esté enviando
- Verifica que el usuario esté autenticado

#### Error: "Customer not found" (404)

- Verifica que el `stripe_customer_id` en Airtable sea correcto
- Verifica que el cliente exista en Stripe

#### Error: "Internal server error" (500)

- Verifica que `STRIPE_SECRET_KEY` esté configurada en Vercel
- Revisa los logs de Vercel para ver el error específico

#### Error: "Module not found: stripe"

- Ejecuta `npm install stripe` en tu proyecto
- Asegúrate de que el `package.json` incluya la dependencia

## 📝 Notas Importantes

1. **Seguridad**: La clave secreta de Stripe NUNCA debe estar en el frontend. Solo en variables de entorno de Vercel.

2. **Autenticación**: Las funciones serverless verifican el token de autenticación. Asegúrate de que el usuario esté autenticado.

3. **CORS**: Las funciones serverless de Vercel manejan CORS automáticamente.

4. **Límites**: Stripe tiene límites de rate limiting. Si haces muchas peticiones, podrías alcanzar el límite.

5. **Desarrollo Local**: Para probar localmente, necesitas configurar las variables de entorno. Puedes usar `.env.local` o configurar en Vercel CLI.

## 🚀 Deployment

1. **Commit y Push**:
   ```bash
   git add .
   git commit -m "Agregar funciones serverless de Stripe"
   git push
   ```

2. **Vercel Deployment**:
   - Vercel detectará automáticamente los cambios
   - Desplegará las funciones serverless
   - Configura las variables de entorno si no lo has hecho

3. **Verificar**:
   - Ve a tu proyecto en Vercel
   - Revisa los logs de las funciones serverless
   - Prueba los endpoints

## 🔗 Recursos

- [Documentación de Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Documentación de Stripe API](https://stripe.com/docs/api)
- [Guía de Prueba de Stripe](./GUIA_PRUEBA_STRIPE.md)

