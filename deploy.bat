@echo off
REM Script para desplegar a Vercel en Windows
REM Uso: deploy.bat

echo.
echo 🚀 Preparando despliegue a Vercel...
echo.

REM Verificar que npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no está instalado
    exit /b 1
)

REM Verificar que vercel CLI está instalado
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Instalando Vercel CLI...
    call npm i -g vercel
)

REM Limpiar caché local
echo 🧹 Limpiando build anterior...
if exist .next rmdir /s /q .next

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

REM Build local para verificar
echo 🔨 Compilando proyecto...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build exitoso
    echo 🌐 Desplegando a Vercel...
    call vercel --prod
) else (
    echo ❌ Error en el build. Revisa los errores arriba.
    exit /b 1
)
