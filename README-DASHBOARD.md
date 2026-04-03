# Dashboard de Ventas - Next.js 15 + Recharts

Dashboard interactivo de ventas desarrollado con Next.js 15, App Router, TypeScript y Recharts. Incluye análisis de datos con gráficos dinámicos, KPIs y filtrado por año.

## 🚀 Características

- **4 KPIs principales**: Total de ventas, cantidad de órdenes, ticket promedio y país con más ventas
- **Gráfico de línea**: Evolución de ventas por mes
- **Gráfico de barras**: Ventas por línea de productos
- **Gráfico de dona**: Distribución por tamaño de deal
- **Tabla de top clientes**: Top 5 clientes por ventas
- **Filtrado interactivo**: Selecciona años (2003, 2004, 2005) para actualizar todos los gráficos
- **Diseño Dark Fintech**: Estilo moderno con Tailwind CSS
- **CSV Parser**: Carga de datos desde CSV con Papa Parse

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Dashboard principal
│   └── globals.css      # Estilos globales
public/
├── data/
│   └── sales_data_sample.csv  # Datos de ventas
.vercelignore           # Archivos a ignorar en Vercel
vercel.json             # Configuración de Vercel
```

## 📦 Instalación Local

1. **Clonar/descargar el proyecto**
   ```bash
   cd data-dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Colocar el CSV**
   - Copia `sales_data_sample.csv` en `public/data/`

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```
   - Abre [http://localhost:3000](http://localhost:3000)

## 🏗️ Build y Producción

### Build local
```bash
npm run build
npm run start
```

### ✨ Desplegar en Vercel

#### Opción 1: Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

#### Opción 2: GitHub Integration (recomendado)
1. Sube el repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el repositorio
4. Next.js será detectado automáticamente
5. Haz clic en "Deploy"

#### Opción 3: Vercel Web UI
1. Sube a GitHub (o GitLab/Bitbucket)
2. Ve a [vercel.com/new](https://vercel.com/new)
3. Selecciona tu repositorio
4. Click en "Deploy"

## 📊 Formato del CSV

El CSV debe incluir estas columnas (mínimo requeridas):
- `ORDERNUMBER` - ID de orden
- `QUANTITYORDERED` - Cantidad
- `PRICEEACH` - Precio unitario
- `SALES` - Monto total (se valida como número)
- `ORDERDATE` - Fecha
- `STATUS` - Estado de orden
- `QTR_ID` - Trimestre
- `MONTH_ID` - Mes (1-12)
- `YEAR_ID` - Año (2003, 2004, 2005)
- `PRODUCTLINE` - Línea de producto
- `COUNTRY` - País
- `DEALSIZE` - Tamaño del deal (Small, Medium, Large)
- `CUSTOMERNAME` - Nombre del cliente

## 🛠️ Tecnologías

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Type safety
- **Recharts** - Visualización de gráficos
- **Tailwind CSS** - Estilos
- **Papa Parse** - Parseo de CSV
- **React 19** - UI library

## 📝 Variables de Entorno (opcional)

Crea un archivo `.env.local` si necesitas variables personalizadas:
```
NEXT_PUBLIC_API_URL=https://tu-api.com
```

## ⚙️ Configuración de Vercel

El archivo `vercel.json` configura automáticamente:
- Build command: `npm run build`
- Output directory: `.next`
- Node version: 20.x

No requiere configuración adicional en el dashboard de Vercel.

## 🐛 Troubleshooting

### Error al cargar CSV
- Verifica que el archivo esté en `public/data/sales_data_sample.csv`
- Asegúrate que el CSV usa delimitador `,` 
- Revisa la consola del navegador para errores específicos

### Gráficos no se muestran
- Verifica que Recharts esté instalado: `npm install recharts`
- Revisa que no haya errores de TypeScript

### Error en Vercel al desplegar
- Elimina `.next` y `node_modules` localmente
- Ejecuta `npm install` nuevamente
- Verifica que no haya errores en `npm run build`

## 📄 Licencia

MIT

## 👨‍💻 Autor

Dashboard de Ventas - 2026
