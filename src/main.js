// Main entry point
console.log('🚀 Inicializando Dashboard Chatbot AI...');

// Configuración global de GPTMaker
// El token se carga dinámicamente desde localStorage o desde la configuración del usuario
window.GPTMAKER_CONFIG = {
    token: null, // Se cargará dinámicamente desde localStorage o configuración del usuario
    baseURL: 'https://api.gptmaker.ai'
};

// Variable global para evitar inicialización múltiple
window.dashboardInitialized = false;

// Función de verificación de autenticación
function checkAuthentication() {
    // Verificar si estamos en la página de login
    if (window.location.pathname.includes('login.html')) {
        console.log('🏠 En página de login, permitiendo acceso');
        return true;
    }
    
    // Verificar que AuthService esté disponible
    if (!window.authService) {
        console.warn('⚠️ AuthService no disponible, esperando...');
        return false;
    }
    
    // Verificar autenticación
    const isAuthenticated = window.authService.isAuthenticated();
    console.log('🔐 Estado de autenticación:', isAuthenticated ? 'Autenticado' : 'No autenticado');
    
    if (isAuthenticated) {
        console.log('✅ Usuario autenticado');
        return true;
    } else {
        console.log('❌ Usuario no autenticado, redirigiendo a login...');
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
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
        const api = new GPTMakerAPI();
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
    
    // Función para verificar dependencias
    function checkDependencies() {
        const hasGPTMakerAPI = typeof GPTMakerAPI !== 'undefined';
        const hasDataService = typeof DataService !== 'undefined';
        const hasChatbotDashboard = typeof ChatbotDashboard !== 'undefined';
        const hasAuthService = typeof window.authService !== 'undefined';
        
        console.log('📦 Dependencias:', {
            GPTMakerAPI: hasGPTMakerAPI,
            DataService: hasDataService,
            ChatbotDashboard: hasChatbotDashboard,
            AuthService: hasAuthService
        });
        
        return hasGPTMakerAPI && hasDataService && hasChatbotDashboard && hasAuthService;
    }
    
    // Intentar inicializar inmediatamente
    if (checkDependencies()) {
        console.log('✅ Todas las dependencias disponibles, inicializando...');
        initializeDashboard();
    } else {
        console.log('⏳ Esperando dependencias...');
        // Esperar más tiempo para que AuthService se cargue completamente
        setTimeout(() => {
            if (checkDependencies()) {
                console.log('✅ Dependencias cargadas después del delay, inicializando...');
                initializeDashboard();
            } else {
                console.error('❌ Algunas dependencias no se cargaron');
            }
        }, 500);
    }
});