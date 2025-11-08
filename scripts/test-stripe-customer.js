#!/usr/bin/env node
/**
 * Script de verificación de clientes en Stripe.
 *
 * Uso:
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/test-stripe-customer.js cus_123
 *
 * Opcionalmente puedes crear un archivo .env.local con STRIPE_SECRET_KEY
 * y simplemente ejecutar:
 *   node scripts/test-stripe-customer.js cus_123
 *
 * También puedes indicar un archivo de entorno distinto con:
 *   ENV_FILE=./ruta_al_env node scripts/test-stripe-customer.js cus_123
 */

const path = require('path');
const fs = require('fs');

// Permitir especificar un archivo de entorno personalizado
const envFilePath = process.env.ENV_FILE || path.resolve(process.cwd(), '.env.local');

if (fs.existsSync(envFilePath)) {
    try {
        require('dotenv').config({ path: envFilePath });
        console.log(`📄 Archivo de entorno cargado: ${envFilePath}`);
    } catch (error) {
        console.warn('⚠️ No se pudo cargar el archivo de entorno:', error.message);
    }
} else {
    console.log('ℹ️ No se encontró archivo .env.local (se usará STRIPE_SECRET_KEY del entorno).');
}

const customerId = process.argv[2];

if (!customerId) {
    console.error('❌ Debes proporcionar el Customer ID de Stripe como argumento.');
    console.error('   Ejemplo: node scripts/test-stripe-customer.js cus_123456789');
    process.exit(1);
}

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY no está definida en el entorno.');
    console.error('   Define la variable antes de ejecutar el script.');
    process.exit(1);
}

const stripe = require('stripe')(secretKey);

async function verifyCustomer(id) {
    console.log(`🔍 Buscando cliente "${id}" en Stripe...`);
    try {
        const customer = await stripe.customers.retrieve(id);
        console.log('✅ Cliente encontrado:');
        console.log(`   ID: ${customer.id}`);
        console.log(`   Email: ${customer.email || 'N/A'}`);
        console.log(`   Nombre: ${customer.name || 'N/A'}`);
        console.log(`   Creado: ${new Date(customer.created * 1000).toISOString()}`);
    } catch (error) {
        console.error('❌ No se pudo obtener el cliente.');
        console.error(`   Código: ${error.statusCode || 'N/A'}`);
        console.error(`   Tipo: ${error.type || 'N/A'}`);
        console.error(`   Mensaje: ${error.message}`);
        if (error.raw) {
            console.error('   Detalles:', error.raw);
        }
        process.exit(1);
    }
}

verifyCustomer(customerId);

