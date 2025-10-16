// Main entry point
console.log('🚀 Inicializando Dashboard Chatbot AI...');

// Token actualizado de GPTMaker
const GPTMAKER_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJncHRtYWtlciIsImlkIjoiM0U2MTZFMDQ2RDI3RTFDQjYyM0JGRTVFOUE2RTlCREUiLCJ0ZW5hbnQiOiIzRTYxNkUwNDZEMjdFMUNCNjIzQkZFNUU5QTZFOUJERSIsInV1aWQiOiJjMDU1NGM1Yy1mYjhiLTQ5YjUtOGRhMy1mZGEzMTc1MGZlZDgifQ.el1Rog4MU6G0UJ8tBzsWhhnecYoZ6n7nUFC-6l1VpJE';

// Variable global para evitar inicialización múltiple
window.dashboardInitialized = false;

// Función de verificación de autenticación
function checkAuthentication() {
    // Verificar si estamos en la página de login
    if (window.location.pathname.includes('login.html')) {
        return true;
    }
    
    // Verificar autenticación
    if (window.authService && window.authService.isAuthenticated()) {
        console.log('✅ Usuario autenticado');
        return true;
    } else {
        console.log('❌ Usuario no autenticado, redirigiendo a login...');
        window.location.href = 'login.html';
        return false;
    }
}

// Función de inicialización optimizada
function initializeDashboard() {
    // Verificar autenticación primero
    if (!checkAuthentication()) {
        return;
    }
    
    // Verificar que no esté ya inicializado
    if (window.dashboardInitialized) {
        console.log('⚠️ Dashboard ya inicializado, saltando...');
        return;
    }
    
    // Verificar que Chart.js esté disponible
    if (typeof Chart === 'undefined') {
        console.warn('⚠️ Chart.js no está disponible, continuando sin gráficos');
    }
    
    // Verificar que las clases estén disponibles
    if (typeof GPTMakerAPI === 'undefined') {
        console.error('❌ GPTMakerAPI no está disponible');
        return;
    }
    
    if (typeof DataService === 'undefined') {
        console.error('❌ DataService no está disponible');
        return;
    }
    
    if (typeof ChatbotDashboard === 'undefined') {
        console.error('❌ ChatbotDashboard no está disponible');
        return;
    }
    
    console.log('✅ Todas las dependencias están disponibles');
    
    // Inicializar el dashboard
    try {
        // Crear instancia de API primero
        const api = new GPTMakerAPI(GPTMAKER_API_TOKEN);
        const dataService = new DataService(api);
        const dashboard = new ChatbotDashboard(dataService);
        console.log('✅ Dashboard inicializado correctamente');
        
        // Marcar como inicializado
        window.dashboardInitialized = true;
        
        // Hacer el dashboard globalmente accesible para debugging
        window.dashboard = dashboard;
        
        // Exponer métodos importantes globalmente
        window.dashboard.navigateToSection = dashboard.navigateToSection.bind(dashboard);
        
    } catch (error) {
        console.error('❌ Error inicializando dashboard:', error);
    }
}

// Verificar que todas las dependencias estén cargadas
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM cargado, inicializando dashboard...');
    
    // Inicializar inmediatamente si las dependencias están disponibles
    if (typeof GPTMakerAPI !== 'undefined' && typeof DataService !== 'undefined' && typeof ChatbotDashboard !== 'undefined') {
        initializeDashboard();
    } else {
        // Esperar un poco para que las dependencias se carguen
        setTimeout(initializeDashboard, 100);
    }
});