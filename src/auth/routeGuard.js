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
        if (!ready) return;

        // Asegurar que los datos estén cargados
        try { window.authService.loadAuthData(); } catch (_) {}

        const isAuth = window.authService.isAuthenticated();
        const isLogin = window.location.pathname.includes('login.html');

        if (isAuth && isLogin) {
            window.location.replace('index.html');
        } else if (!isAuth && !isLogin) {
            window.location.replace('login.html');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', guard);
    } else {
        guard();
    }
})();


