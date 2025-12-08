# 🚀 Cómo Subir Cambios de Preview a Producción

## 📋 Flujo Completo

### Paso 1: Haces un Cambio (Preview)

**Tú me dices:**
> "Cambia el color del botón de login a verde"

**Yo hago:**
1. Creo una rama: `feature/boton-login-verde`
2. Cambio el color en el código
3. Hago commit: `git commit -m "Cambiar color botón login a verde"`
4. Hago push: `git push origin feature/boton-login-verde`
5. **Vercel despliega automáticamente en Preview** 🎉

**Resultado:**
- ✅ Cambio hecho en la rama `feature/boton-login-verde`
- ✅ Disponible en Preview (URL única de Vercel)
- ✅ Production sigue igual (sin cambios)

### Paso 2: Pruebas en Preview

**Tú:**
- Vas a la URL de Preview que te doy
- Pruebas el cambio
- Decides si te gusta o no

**Opciones:**
- ✅ **Te gusta**: "Súbelo a producción" o "Mergea a main"
- ❌ **No te gusta**: "Cambia el color a azul" o "Revierte esto"

### Paso 3: Subir a Producción

**Si me dices "Súbelo a producción":**

**Yo hago:**
1. Cambio a la rama main: `git checkout main`
2. Hago merge de la rama: `git merge feature/boton-login-verde`
3. Hago push a main: `git push origin main`
4. **Vercel despliega automáticamente en Production** 🚀

**Resultado:**
- ✅ Cambio ahora está en `main`
- ✅ Production actualizado automáticamente
- ✅ Preview y Production tienen el mismo código

## 🎯 Ejemplo Práctico

```
1. TÚ: "Cambia el botón de login a verde"
   
2. YO: 
   - Creo: feature/boton-verde
   - Cambio: styles.css (color: green)
   - Commit: "Cambiar botón login a verde"
   - Push: feature/boton-verde
   - Te digo: "✅ Listo! Prueba en: https://tu-proyecto-git-feature-boton-verde.vercel.app"

3. TÚ: (pruebas en Preview)
   - "Perfecto, me gusta"
   - "Súbelo a producción"

4. YO:
   - git checkout main
   - git merge feature/boton-verde
   - git push origin main
   - Te digo: "✅ Listo! Ya está en producción: https://tu-proyecto.vercel.app"

5. RESULTADO:
   - ✅ Production tiene el botón verde
   - ✅ Preview y Production iguales
```

## 📝 Comandos que Yo Ejecuto

### Para Hacer un Cambio (Preview)
```bash
# Crear rama
git checkout -b feature/nombre-del-cambio

# Hacer cambios (edito archivos)
# ...

# Commit y push
git add .
git commit -m "Descripción del cambio"
git push origin feature/nombre-del-cambio
```

### Para Subir a Producción
```bash
# Cambiar a main
git checkout main

# Mergear la rama
git merge feature/nombre-del-cambio

# Push a main
git push origin main
```

## ⚠️ Importante

- **Preview**: Cada rama se despliega automáticamente
- **Production**: Solo se actualiza cuando hago merge a `main`
- **Seguridad**: Nunca subo a producción sin que me lo pidas explícitamente
- **Rollback**: Si algo falla, puedo revertir el merge fácilmente

## 💡 Tips

1. **Puedes pedir múltiples cambios** antes de subir a producción
   - "Cambia el botón a verde"
   - "También cambia el header a azul"
   - "Y agrega un nuevo campo"
   - Luego: "Súbelo todo a producción"

2. **Puedo hacer varios cambios en la misma rama**
   - Todos los cambios quedan en Preview
   - Cuando estés listo, subo todo junto

3. **Puedes probar todo lo que quieras en Preview**
   - No afecta Production
   - Puedes pedir cambios y más cambios
   - Solo subo cuando me lo pides

---

**Resumen:** 
- Cambio → Preview automático
- "Súbelo a producción" → Merge a main → Production automático

