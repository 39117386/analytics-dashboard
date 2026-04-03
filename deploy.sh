#!/bin/bash

# Script para desplegar a Vercel
# Uso: ./deploy.sh

echo "🚀 Preparando despliegue a Vercel..."

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

# Verificar que vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm i -g vercel
fi

# Limpiar caché local
echo "🧹 Limpiando build anterior..."
rm -rf .next

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build local para verificar
echo "🔨 Compilando proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso"
    echo "🌐 Desplegando a Vercel..."
    vercel --prod
else
    echo "❌ Error en el build. Revisa los errores arriba."
    exit 1
fi
