# 📋 Instrucciones para el Usuario

## 🎯 Problema Actual

Los campos personalizados de GPTMaker no se están mostrando en el modal "Ver Prospecto", aunque existen en GPTMaker.

## ❓ Necesito tu Ayuda

Para resolver esto, necesito que me digas:

### 1. ¿Cómo accedes a los campos personalizados en GPTMaker?

- ¿Vas al perfil del contacto "Gabriel"?
- ¿Ves los campos en la pantalla del chat?
- ¿Hay una sección específica donde los ves?

### 2. ¿Qué campos personalizados ves para "Gabriel"?

Por favor, dime exactamente qué campos ves y sus valores. Por ejemplo:
- Perfil laboral: "asalariado"
- DUI: "[imagen delantera y trasera"
- Constancia de salario: "[constancia salarial recibida"
- etc.

### 3. Ejecuta este diagnóstico

Copia y pega este código en la consola del navegador (F12) cuando tengas el modal de Gabriel abierto:

```javascript
(async function() {
    console.log('🔍 DIAGNÓSTICO RÁPIDO');
    
    // Buscar el chat de Gabriel
    const chats = window.dashboard?.dashboardData?.chats || [];
    const gabrielChat = chats.find(c => c.name && c.name.toLowerCase().includes('gabriel'));
    
    if (gabrielChat) {
        console.log('✅ Chat encontrado:', gabrielChat.name);
        console.log('📊 Estructura completa del chat:', JSON.stringify(gabrielChat, null, 2));
        console.log('📊 ID:', gabrielChat.id);
        console.log('📊 Recipient:', gabrielChat.recipient);
        console.log('📊 User ID:', gabrielChat.userId);
    } else {
        console.log('❌ Chat de Gabriel no encontrado');
    }
})();
```

## 🎯 Con esta información podré:

- Implementar la solución correcta
- Mostrar los campos personalizados en el modal
- Resolver el problema completamente

**¡Gracias por tu ayuda!**

