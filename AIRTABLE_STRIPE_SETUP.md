# Configuración de Airtable para Integración con Stripe

## 📋 Pasos para Configurar el Campo stripe_customer_id

### 1. Agregar Campo en Airtable

Necesitas agregar un nuevo campo en tu tabla de usuarios en Airtable:

1. **Abre tu base de Airtable** en [airtable.com](https://airtable.com)
2. **Ve a la tabla "Users"** (o como se llame tu tabla de usuarios)
3. **Agrega un nuevo campo:**
   - **Nombre del campo:** `StripeCustomerId`
   - **Tipo de campo:** `Single line text`
   - **Descripción:** `ID del cliente en Stripe`

### 2. Obtener el Stripe Customer ID

Para obtener el `stripe_customer_id` de tus usuarios existentes:

#### Opción A: Desde el Dashboard de Stripe
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. Navega a **Customers** en el menú lateral
3. Busca el cliente por email
4. Copia el ID del cliente (formato: `cus_xxxxx`)

#### Opción B: Desde la API de Stripe
```bash
# Buscar cliente por email
curl -X GET "https://api.stripe.com/v1/customers?email=usuario@ejemplo.com" \
  -u sk_live_tu_clave_secreta_aqui:
```

### 3. Actualizar Registros en Airtable

Para cada usuario en Airtable:

1. **Busca el cliente en Stripe** usando el email del usuario
2. **Copia el ID del cliente** (ejemplo: `cus_1A2B3C4D5E6F7G8H`)
3. **Pega el ID** en el campo `StripeCustomerId` en Airtable

### 4. Ejemplo de Registro Completo

Tu registro en Airtable debería verse así:

| Campo | Valor | Ejemplo |
|-------|-------|---------|
| `Email` | admin@example.com | admin@example.com |
| `Name` | Admin User | Admin User |
| `Role` | admin | admin |
| `Status` | active | active |
| `StripeCustomerId` | cus_xxxxx | cus_1A2B3C4D5E6F7G8H |

### 5. Verificar la Configuración

Una vez que hayas agregado el campo y actualizado los registros:

1. **Refresca la página** de tu aplicación
2. **Ve a la sección "Facturación"**
3. **Verifica que se muestren los datos reales** de Stripe

### 6. Script para Automatizar (Opcional)

Si tienes muchos usuarios, puedes crear un script para automatizar la actualización:

```javascript
// Script para obtener customer IDs desde Stripe y actualizar Airtable
const Airtable = require('airtable');
const Stripe = require('stripe');

const airtable = new Airtable({apiKey: 'TU_AIRTABLE_API_KEY'}).base('TU_BASE_ID');
const stripe = Stripe('TU_STRIPE_SECRET_KEY');

async function updateStripeCustomerIds() {
    // Obtener todos los usuarios de Airtable
    const users = await airtable('Users').select().all();
    
    for (const user of users) {
        try {
            // Buscar cliente en Stripe por email
            const customers = await stripe.customers.list({
                email: user.fields.Email
            });
            
            if (customers.data.length > 0) {
                const stripeCustomerId = customers.data[0].id;
                
                // Actualizar registro en Airtable
                await airtable('Users').update(user.id, {
                    'StripeCustomerId': stripeCustomerId
                });
                
                console.log(`✅ Actualizado ${user.fields.Email}: ${stripeCustomerId}`);
            } else {
                console.log(`⚠️ No se encontró cliente en Stripe para ${user.fields.Email}`);
            }
        } catch (error) {
            console.error(`❌ Error actualizando ${user.fields.Email}:`, error.message);
        }
    }
}

updateStripeCustomerIds();
```

## 🔧 Configuración del Backend

Una vez que tengas los `stripe_customer_id` en Airtable, necesitas implementar el backend que:

1. **Obtenga el usuario autenticado** desde Airtable
2. **Extraiga el `stripe_customer_id`** del usuario
3. **Haga llamadas a la API de Stripe** usando ese ID
4. **Retorne los datos reales** al frontend

### Ejemplo de Endpoint Backend

```javascript
// Obtener información del cliente desde Stripe
app.get('/api/stripe/customer/:customerId', async (req, res) => {
    try {
        const customer = await stripe.customers.retrieve(req.params.customerId);
        res.json(customer);
    } catch (error) {
        console.error('Error obteniendo cliente:', error);
        res.status(500).json({ error: error.message });
    }
});
```

## ✅ Verificación Final

Para verificar que todo funciona correctamente:

1. ✅ Campo `StripeCustomerId` agregado en Airtable
2. ✅ Usuarios tienen su `stripe_customer_id` configurado
3. ✅ Backend implementado con los endpoints correctos
4. ✅ Frontend actualizado para usar los datos reales
5. ✅ Sección de facturación muestra datos reales de Stripe

## 🆘 Solución de Problemas

### Error: "Usuario no tiene stripe_customer_id configurado"
- Verifica que el campo `StripeCustomerId` existe en Airtable
- Asegúrate de que el usuario tiene un valor en ese campo
- Verifica que el campo esté configurado correctamente en `airtable.config.js`

### Error: "Backend no disponible"
- Implementa el backend usando el archivo `backend-example.js`
- Asegúrate de que los endpoints estén configurados correctamente
- Verifica que la clave secreta de Stripe esté configurada

### Datos no se muestran
- Verifica que el `stripe_customer_id` sea válido
- Comprueba que el cliente existe en Stripe
- Revisa los logs del backend para errores de API
