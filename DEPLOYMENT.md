# 🚀 Guía Rápida de Despliegue en Vercel

## ✅ Pre-requisitos
- Node.js 20+
- npm o yarn
- Cuenta gratuita en [vercel.com](https://vercel.com)
- Tu repositorio en GitHub (opcional pero recomendado)

## 🔥 Despliegue en 3 pasos

### Opción A: CLI de Vercel (más rápido)

```bash
# 1. Instalar Vercel CLI globalmente
npm i -g vercel

# 2. Login en tu cuenta
vercel login

# 3. Desplegar
vercel --prod
```

**Listo! Tu dashboard estará en vivo en ~2 minutos a una URL como:**
```
https://data-dashboard-xxxxx.vercel.app
```

### Opción B: GitHub Integration (recomendado)

1. **Sube a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Sales Dashboard"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/data-dashboard.git
   git push -u origin main
   ```

2. **Ve a Vercel**
   - https://vercel.com/new
   - Haz click en "Import Git Repository"
   - Selecciona tu repositorio

3. **Vercel detectará automáticamente Next.js**
   - Haz click en "Deploy"
   - 🎉 ¡Listo!

### Opción C: Bash/Batch Script

**En Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**En Windows:**
```bash
deploy.bat
```

## 📊 Después del Despliegue

### Agregar dominio personalizado
1. Ve al dashboard de Vercel
2. Tu proyecto → Settings → Domains
3. Agrega tu dominio personalizado
4. Configura los DNS en tu proveedor

### Variables de entorno (si necesitas)
1. Settings → Environment Variables
2. Agrega `NEXT_PUBLIC_API_URL` u otras que necesites
3. Re-deploy automático

### Monitorear el sitio
- Vercel proporciona analytics automático
- Verifica performance en: https://web.dev/measure/

## 🐛 Si hay problemas

### "Error: Build failed"
```bash
# Limpia y reconstruye locally
rm -rf .next node_modules
npm install
npm run build
```

### CSV no carga en producción
- Verifica que `public/data/sales_data_sample.csv` existe
- Revisa la consola del navegador (F12) para mensajes de error

### "Module not found"
- Asegúrate de instalar dependencias: `npm install`
- Revisa que `@types/papaparse` esté en `package.json`

## 💡 Tips

- **Auto-deploy**: Cada push a main redeploya automáticamente (con GitHub)
- **Preview URLs**: Cada PR crea una preview de la app
- **Logs**: Vercel → Deployments → Logs te muestra errores en vivo
- **Rollback**: Vercel → Deployments → puedes revertir a versiones anteriores

## 📞 Soporte

- Documentación: https://vercel.com/docs
- Community: https://discord.gg/vercel
- Status: https://status.vercel.com

---

**¡Tu dashboard estará en vivo en producción en minutos! 🎯**
