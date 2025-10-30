#!/bin/bash

# Script para iniciar el servidor de desarrollo con configuración correcta

echo "🚀 Iniciando servidor de desarrollo..."

# Detener procesos existentes
echo "🛑 Deteniendo procesos existentes..."
pkill -f "vite\|node.*3004" 2>/dev/null || true

# Esperar un momento
sleep 2

# Limpiar cache de npm
echo "🧹 Limpiando cache..."
npm cache clean --force

# Instalar dependencias si es necesario
echo "📦 Verificando dependencias..."
npm install

# Iniciar servidor de desarrollo
echo "🌐 Iniciando servidor en puerto 3004..."
npm run dev


