// Datos mock para el sistema de autenticación
// En un entorno real, estos datos vendrían de una API backend

const MOCK_USERS = [
    {
        id: '1',
        email: 'admin@chatbot.com',
        password: 'admin123', // En producción esto estaría hasheado
        firstName: 'Admin',
        lastName: 'Usuario',
        phone: '+1234567890',
        company: 'Chatbot Corp',
        role: 'Administrador',
        createdAt: '2024-01-01T00:00:00Z',
        avatar: null
    },
    {
        id: '2',
        email: 'user@chatbot.com',
        password: 'user123', // En producción esto estaría hasheado
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+1234567891',
        company: 'Mi Empresa',
        role: 'Usuario',
        createdAt: '2024-01-15T00:00:00Z',
        avatar: null
    }
];

const MOCK_BILLING = {
    plan: 'Plan Pro',
    price: '$29/mes',
    features: [
        'Chats ilimitados',
        'Soporte prioritario',
        'Integraciones avanzadas',
        'Reportes detallados'
    ],
    paymentMethod: {
        type: 'Visa',
        maskedNumber: '**** **** **** 4242',
        expiryMonth: '12',
        expiryYear: '2025'
    }
};

const MOCK_INVOICES = [
    {
        id: '1',
        amount: '29.00',
        date: '2024-01-01T00:00:00Z',
        status: 'paid',
        description: 'Plan Pro - Enero 2024'
    },
    {
        id: '2',
        amount: '29.00',
        date: '2023-12-01T00:00:00Z',
        status: 'paid',
        description: 'Plan Pro - Diciembre 2023'
    },
    {
        id: '3',
        amount: '29.00',
        date: '2023-11-01T00:00:00Z',
        status: 'paid',
        description: 'Plan Pro - Noviembre 2023'
    },
    {
        id: '4',
        amount: '29.00',
        date: '2023-10-01T00:00:00Z',
        status: 'pending',
        description: 'Plan Pro - Octubre 2023'
    },
    {
        id: '5',
        amount: '29.00',
        date: '2023-09-01T00:00:00Z',
        status: 'failed',
        description: 'Plan Pro - Septiembre 2023'
    }
];

// Función para simular delay de API
function simulateApiDelay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Función para generar token JWT mock
function generateMockToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };
    
    // En un entorno real, esto sería un JWT real
    return btoa(JSON.stringify(payload));
}

// Función para validar token mock
function validateMockToken(token) {
    try {
        const payload = JSON.parse(atob(token));
        const now = Math.floor(Date.now() / 1000);
        
        if (payload.exp < now) {
            return null; // Token expirado
        }
        
        return payload;
    } catch (error) {
        return null;
    }
}

// Función para buscar usuario por email
function findUserByEmail(email) {
    return MOCK_USERS.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Función para buscar usuario por ID
function findUserById(id) {
    return MOCK_USERS.find(user => user.id === id);
}

// Función para verificar contraseña
function verifyPassword(user, password) {
    return user.password === password;
}

// Exportar funciones para uso en el AuthService
window.mockAuthData = {
    MOCK_USERS,
    MOCK_BILLING,
    MOCK_INVOICES,
    simulateApiDelay,
    generateMockToken,
    validateMockToken,
    findUserByEmail,
    findUserById,
    verifyPassword
};

