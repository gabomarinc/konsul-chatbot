document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const messageContainer = document.getElementById('messageContainer');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Verificar si ya está autenticado
    if (window.authService && window.authService.isAuthenticated()) {
        console.log('✅ Usuario ya autenticado, redirigiendo...');
        window.location.href = 'index.html';
        return;
    }

    // Cargar AuthService
    if (!window.authService) {
        loadAuthService();
    }

    // Event listeners
    loginForm.addEventListener('submit', handleLogin);
    emailInput.addEventListener('input', clearErrors);
    passwordInput.addEventListener('input', clearErrors);

    // Auto-focus en el campo email
    emailInput.focus();

    // ===== FUNCIONES PRINCIPALES =====

    async function handleLogin(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Validaciones básicas
        if (!validateForm(email, password)) {
            return;
        }

        // Mostrar loading
        setLoading(true);
        clearMessages();

        try {
            // Intentar login
            const result = await window.authService.login(email, password, rememberMe);

            if (result.success) {
                showSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showError(result.error || 'Error al iniciar sesión');
                setLoading(false);
            }

        } catch (error) {
            console.error('Error en login:', error);
            showError('Error de conexión. Inténtalo de nuevo.');
            setLoading(false);
        }
    }

    function validateForm(email, password) {
        let isValid = true;
        clearErrors();

        // Validar email
        if (!email) {
            showFieldError(emailInput, 'El email es requerido');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError(emailInput, 'Formato de email inválido');
            isValid = false;
        }

        // Validar contraseña
        if (!password) {
            showFieldError(passwordInput, 'La contraseña es requerida');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError(passwordInput, 'La contraseña debe tener al menos 6 caracteres');
            isValid = false;
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ===== FUNCIONES DE UI =====

    function setLoading(loading) {
        loginBtn.disabled = loading;
        
        if (loading) {
            loginBtn.classList.add('loading');
        } else {
            loginBtn.classList.remove('loading');
        }
    }

    function showError(message) {
        messageContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
    }

    function showSuccess(message) {
        messageContainer.innerHTML = `
            <div class="success-message">
                <i class="fas fa-check-circle"></i>
                ${message}
            </div>
        `;
    }

    function clearMessages() {
        messageContainer.innerHTML = '';
    }

    function clearErrors() {
        // Limpiar errores de campos
        [emailInput, passwordInput].forEach(input => {
            input.classList.remove('error');
        });

        // Limpiar mensajes
        clearMessages();
    }

    function showFieldError(input, message) {
        input.classList.add('error');
        
        // Mostrar mensaje de error específico del campo
        let errorElement = input.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: #e53e3e;
                font-size: 0.8rem;
                margin-top: 0.25rem;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            `;
            input.parentNode.appendChild(errorElement);
        }
        
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;
    }

    // ===== FUNCIONES GLOBALES =====

    window.togglePassword = function() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.getElementById('passwordToggleIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleIcon.className = 'fas fa-eye';
        }
    };

    window.showForgotPassword = function() {
        showError('Función de recuperación de contraseña no disponible. Contacta al administrador.');
    };

    // ===== UTILIDADES =====

    function loadAuthService() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'src/auth/authService.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Manejar tecla Enter en campos
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    });

    // Auto-rellenar si hay datos guardados
    if (localStorage.getItem('authData')) {
        try {
            const authData = JSON.parse(localStorage.getItem('authData'));
            if (authData.user && authData.user.email) {
                emailInput.value = authData.user.email;
                rememberMeCheckbox.checked = true;
            }
        } catch (error) {
            console.warn('Error cargando datos guardados:', error);
        }
    }
});

