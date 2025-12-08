# 👀 Cómo Ver Cambios en Vercel

## 🚀 Acceder al Dashboard de Vercel

### Paso 1: Ir a Vercel
1. Ve a [https://vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Busca tu proyecto en la lista

### Paso 2: Ver Deployments
1. Click en tu proyecto
2. Verás la pestaña **"Deployments"** (o "Despliegues")
3. Aquí verás TODOS los deployments

## 📋 Qué Verás en Deployments

### Production (Producción)
```
┌─────────────────────────────────────────┐
│ ✅ main                                 │
│ Production • Deployed 2 hours ago      │
│ https://tu-proyecto.vercel.app         │
└─────────────────────────────────────────┘
```
- **Rama**: `main`
- **Estado**: ✅ (verde) = exitoso
- **URL**: `tu-proyecto.vercel.app` (dominio principal)
- **Etiqueta**: "Production"

### Preview (Previsualización)
```
┌─────────────────────────────────────────┐
│ ✅ feature/boton-verde                  │
│ Preview • Deployed 5 minutes ago        │
│ https://tu-proyecto-git-feature-boton...│
└─────────────────────────────────────────┘
```
- **Rama**: `feature/boton-verde` (o la rama que creé)
- **Estado**: ✅ (verde) = exitoso
- **URL**: `tu-proyecto-git-feature-boton-verde-tu-usuario.vercel.app`
- **Etiqueta**: "Preview"

## 🔍 Información Detallada de Cada Deployment

### Click en un Deployment

Al hacer click en cualquier deployment, verás:

1. **Estado del Build**
   - ✅ Build exitoso
   - ⏳ Build en progreso
   - ❌ Build fallido

2. **URLs**
   - **Production URL**: `tu-proyecto.vercel.app`
   - **Preview URL**: `tu-proyecto-git-rama-xxx.vercel.app`

3. **Información del Commit**
   - Mensaje del commit
   - Autor
   - Fecha y hora

4. **Logs del Build**
   - Ver qué pasó durante el build
   - Errores si los hay

5. **Variables de Entorno**
   - Qué variables se usaron
   - (Solo visible en Settings, no en el deployment)

## 🎯 Cómo Identificar tus Cambios

### Cuando Yo Hago un Cambio

1. **Creo una rama**: `feature/nombre-del-cambio`
2. **Hago push**: Vercel detecta automáticamente
3. **Vercel despliega**: Aparece un nuevo deployment

**Lo que verás:**
```
Deployments:
  ✅ main (Production) - 2 hours ago
  ✅ feature/nombre-del-cambio (Preview) - 2 minutes ago ← NUEVO
```

### Cómo Acceder a Preview

**Opción 1: Desde Vercel Dashboard**
1. Ve a Deployments
2. Click en el deployment de Preview
3. Click en el botón "Visit" o la URL

**Opción 2: URL Directa**
- Te daré la URL cuando haga el cambio
- Ejemplo: `https://tu-proyecto-git-feature-boton-verde.vercel.app`

## 📊 Estados de los Deployments

### ✅ Build Exitoso
- Verde
- Listo para usar
- Puedes hacer click y ver tu app

### ⏳ Build en Progreso
- Amarillo/Naranja
- Vercel está construyendo tu app
- Espera unos minutos

### ❌ Build Fallido
- Rojo
- Hubo un error
- Click para ver los logs y el error

## 🔄 Flujo Visual Completo

```
1. TÚ: "Cambia el botón a verde"

2. YO: 
   - Creo rama: feature/boton-verde
   - Push a GitHub

3. VERCEL (Automático):
   - Detecta el push
   - Inicia build
   - Despliega en Preview

4. TÚ (En Vercel Dashboard):
   - Ves nuevo deployment: feature/boton-verde
   - Estado: ⏳ → ✅
   - Click en "Visit" para ver Preview

5. TÚ: "Súbelo a producción"

6. YO:
   - Merge a main
   - Push a main

7. VERCEL (Automático):
   - Detecta el push a main
   - Inicia build
   - Despliega en Production

8. TÚ (En Vercel Dashboard):
   - Ves deployment actualizado: main
   - Estado: ⏳ → ✅
   - Production ahora tiene el cambio
```

## 💡 Tips Útiles

### 1. Notificaciones
- Vercel puede enviarte emails cuando hay nuevos deployments
- Configúralo en Settings > Notifications

### 2. Comparar Versiones
- Puedes ver qué cambió entre deployments
- Click en un deployment → "View Build Logs"

### 3. Rollback (Revertir)
- Si algo falla, puedes revertir a un deployment anterior
- Click en el deployment anterior → "Promote to Production"

### 4. Dominio Personalizado
- Production usa tu dominio personalizado
- Preview usa dominios temporales de Vercel

## 🎨 Vista del Dashboard

```
┌─────────────────────────────────────────────────────┐
│  Tu Proyecto                                        │
├─────────────────────────────────────────────────────┤
│  [Overview] [Deployments] [Analytics] [Settings]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Deployments                                        │
│                                                     │
│  ✅ main                                            │
│     Production • 2 hours ago                       │
│     https://tu-proyecto.vercel.app                 │
│     [Visit] [⋮]                                     │
│                                                     │
│  ✅ feature/boton-verde                             │
│     Preview • 5 minutes ago                         │
│     https://tu-proyecto-git-feature-boton...       │
│     [Visit] [⋮]                                     │
│                                                     │
│  ✅ feature/header-azul                            │
│     Preview • 1 hour ago                            │
│     https://tu-proyecto-git-feature-header...       │
│     [Visit] [⋮]                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📱 Acceso Rápido

**Para ver Production:**
- URL directa: `https://tu-proyecto.vercel.app`
- O desde Vercel: Deployments → main → Visit

**Para ver Preview:**
- Te daré la URL cuando haga el cambio
- O desde Vercel: Deployments → tu-rama → Visit

---

**Resumen:**
- Ve a vercel.com → Tu proyecto → Deployments
- Production = rama `main`
- Preview = otras ramas
- Cada cambio aparece como nuevo deployment automáticamente
