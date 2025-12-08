// Route Guard: Redirige según estado de autenticación
(function routeGuard() {
    async function waitForAuthService(timeoutMs = 2000) {
        const start = Date.now();
        while (!window.authService) {
            await new Promise(r => setTimeout(r, 50));
            if (Date.now() - start > timeoutMs) return false;
        }
        return true;
    }

    async function guard() {
        const ready = await waitForAuthService(2500);
        if (!ready) {
            console.warn('⚠️ AuthService no disponible después de esperar');
            return;
        }

        // Asegurar que los datos estén cargados ANTES de verificar
        try {
            console.log('🔄 RouteGuard: Cargando datos de autenticación...');
            window.authService.loadAuthData();
            
            // Dar más tiempo para asegurar que los datos se cargaron completamente
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verificar que los datos se cargaron correctamente
            console.log('🔍 RouteGuard: Verificando datos cargados:', {
                hasUser: !!window.authService.currentUser,
                hasToken: !!window.authService.token,
                userEmail: window.authService.currentUser?.email,
                localStorage: !!localStorage.getItem('authData'),
                sessionStorage: !!sessionStorage.getItem('authData')
            });
        } catch (error) {
            console.error('❌ Error cargando datos de autenticación en routeGuard:', error);
        }

        const isAuth = window.authService.isAuthenticated();
        const isLogin = window.location.pathname.includes('login.html');

        console.log('🛡️ RouteGuard - Estado de autenticación:', {
            isAuth,
            isLogin,
            hasUser: !!window.authService.currentUser,
            hasToken: !!window.authService.token,
            userEmail: window.authService.currentUser?.email
        });

        // Solo redirigir si realmente es necesario
        // Evitar redirecciones múltiples
        if (isAuth && isLogin) {
            console.log('✅ Usuario autenticado en login, redirigiendo a dashboard');
            // Usar replace para evitar que se pueda volver atrás
            window.location.replace('index.html');
            return; // Salir inmediatamente para evitar ejecuciones adicionales
        } else if (!isAuth && !isLogin) {
            // Verificar una vez más después de un pequeño delay para evitar condiciones de carrera
            await new Promise(resolve => setTimeout(resolve, 200));
            const doubleCheck = window.authService.isAuthenticated();
            if (!doubleCheck) {
                console.log('❌ Usuario no autenticado (verificado dos veces), redirigiendo a login');
                window.location.replace('login.html');
            } else {
                console.log('✅ Usuario autenticado en segunda verificación, no redirigiendo');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', guard);
    } else {
        guard();
    }
})();


