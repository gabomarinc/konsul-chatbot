# Integración de Stripe - Guía de Configuración

## 📋 Descripción

Esta guía explica cómo configurar y usar la integración de Stripe en el proyecto Chatbot. La integración permite gestionar clientes, suscripciones, facturas y métodos de pago de forma segura.

## 🔧 Configuración Inicial

### 1. Configurar las Claves de Stripe

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp src/config/stripe.config.example.js src/config/stripe.config.js
   ```

2. **Editar el archivo de configuración:**
   Abre `src/config/stripe.config.js` y reemplaza los valores con tus claves reales de Stripe:

   ```javascript
   const StripeConfig = {
       // Reemplazar con tus claves reales
       publishableKey: 'pk_live_tu_clave_publica_aqui',
       secretKey: 'sk_live_tu_clave_secreta_aqui',
       
       // Configuración de productos y precios
       products: {
           premium: {
               id: 'prod_tu_id_de_producto_aqui',
               name: 'Plan Premium',
               description: 'Plan premium con todas las funcionalidades'
           }
       },
       
       prices: {
           premiumMonthly: {
               id: 'price_tu_id_de_precio_aqui',
               amount: 2999, // $29.99 en centavos
               currency: 'usd',
               interval: 'month'
           }
       }
   };
   ```

### 2. Configurar el Backend

Para que la integración funcione completamente, necesitas un backend que maneje las llamadas seguras a la API de Stripe. El backend debe exponer los siguientes endpoints:

#### Endpoints Requeridos:

- `GET /api/stripe/customer/:customerId` - Obtener información del cliente
- `POST /api/stripe/customer` - Crear un nuevo cliente
- `GET /api/stripe/subscriptions/:customerId` - Obtener suscripciones del cliente
- `POST /api/stripe/subscription` - Crear una nueva suscripción
- `POST /api/stripe/subscription/:id/cancel` - Cancelar suscripción
- `GET /api/stripe/invoices/:customerId` - Obtener facturas del cliente
- `GET /api/stripe/payment-methods/:customerId` - Obtener métodos de pago
- `POST /api/stripe/payment-intent` - Crear intent de pago
- `POST /api/stripe/setup-intent` - Crear setup intent

#### Ejemplo de Endpoint Backend (Node.js/Express):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Obtener información del cliente
app.get('/api/stripe/customer/:customerId', async (req, res) => {
    try {
        const customer = await stripe.customers.retrieve(req.params.customerId);
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear cliente
app.post('/api/stripe/customer', async (req, res) => {
    try {
        const customer = await stripe.customers.create({
            email: req.body.email,
            name: req.body.name,
            metadata: req.body.metadata
        });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## 🚀 Uso de la Integración

### Inicialización

El servicio de Stripe se inicializa automáticamente cuando se carga la página. Puedes acceder a él globalmente:

```javascript
// El servicio está disponible como window.StripeService
const stripeService = new StripeService();
await stripeService.initialize();
```

### Métodos Principales

#### Obtener Información del Cliente
```javascript
const customerInfo = await stripeService.getCustomerInfo();
console.log('Cliente:', customerInfo);
```

#### Obtener Suscripciones
```javascript
const subscriptions = await stripeService.getSubscriptions();
console.log('Suscripciones:', subscriptions);
```

#### Crear Cliente
```javascript
const newCustomer = await stripeService.createCustomer({
    email: 'usuario@ejemplo.com',
    name: 'Usuario Ejemplo',
    metadata: {
        company: 'Mi Empresa'
    }
});
```

#### Crear Suscripción
```javascript
const subscription = await stripeService.createSubscription({
    customer: 'cus_cliente_id',
    items: [{
        price: 'price_precio_id'
    }]
});
```

#### Cancelar Suscripción
```javascript
const canceledSubscription = await stripeService.cancelSubscription(
    'sub_suscripcion_id',
    true // cancelar al final del período
);
```

## 🔒 Seguridad

### Importante: Protección de Claves Secretas

- **NUNCA** expongas la clave secreta (`sk_live_...`) en el frontend
- La clave secreta debe usarse **SOLO** en el backend
- El archivo `stripe.config.js` está en `.gitignore` para proteger las claves
- Usa variables de entorno en el backend para las claves secretas

### Autenticación

El servicio incluye autenticación automática usando tokens de sesión:

```javascript
// El token se agrega automáticamente a las peticiones
const authToken = window.authService?.getAuthToken();
if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
}
```

## 🔄 Modo de Fallback

Si el backend no está disponible, el servicio automáticamente usa datos simulados para mantener la funcionalidad del frontend. Esto permite que la aplicación funcione incluso durante el desarrollo.

## 📊 Gestión de Facturación

La integración incluye un `BillingManager` que maneja toda la interfaz de facturación:

```javascript
// El BillingManager se inicializa automáticamente
const billingManager = new BillingManager();
await billingManager.init();
```

### Funcionalidades del BillingManager:

- Visualización de información del cliente
- Listado de suscripciones activas
- Historial de facturas
- Gestión de métodos de pago
- Acciones de gestión (cancelar, pagar, etc.)

## 🛠️ Desarrollo

### Estructura de Archivos:

```
src/
├── config/
│   ├── stripe.config.js          # Configuración real (no versionado)
│   └── stripe.config.example.js  # Plantilla de configuración
├── services/
│   ├── stripeService.js          # Servicio principal de Stripe
│   └── billing.js                # Gestor de interfaz de facturación
```

### Logs y Debugging:

El servicio incluye logs detallados para facilitar el debugging:

```javascript
console.log('🔄 Inicializando Stripe Service...');
console.log('✅ Stripe Service inicializado correctamente');
console.log('⚠️ Backend no disponible, usando datos simulados');
```

## 📝 Notas Importantes

1. **Entorno de Producción**: Asegúrate de usar claves de producción (`pk_live_` y `sk_live_`) solo en producción
2. **Webhooks**: Configura webhooks de Stripe para manejar eventos en tiempo real
3. **Testing**: Usa las claves de test (`pk_test_` y `sk_test_`) durante el desarrollo
4. **Monitoreo**: Implementa monitoreo de errores para las transacciones de Stripe

## 🆘 Solución de Problemas

### Error: "Backend no disponible"
- Verifica que el backend esté ejecutándose
- Comprueba que los endpoints estén configurados correctamente
- El servicio usará datos simulados como fallback

### Error: "Clave secreta no debe usarse en el frontend"
- La clave secreta solo debe usarse en el backend
- Verifica que no estés intentando usar la clave secreta en el navegador

### Error: "Stripe.js no se carga"
- Verifica la conexión a internet
- Comprueba que el CDN de Stripe esté disponible

## 📚 Recursos Adicionales

- [Documentación oficial de Stripe](https://stripe.com/docs)
- [Guía de integración de Stripe](https://stripe.com/docs/development/quickstart)
- [API Reference de Stripe](https://stripe.com/docs/api)
