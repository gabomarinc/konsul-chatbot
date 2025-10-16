// Dashboard JavaScript
class ChatbotDashboard {
    constructor() {
        this.currentSection = 'overview';
        this.isDarkTheme = false;
        this.isSidebarCollapsed = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.loadTheme();
        this.loadBrandSettings();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.closest('.nav-item').dataset.section;
                this.navigateToSection(section);
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Brand customization
        this.setupBrandCustomization();

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Filter functionality
        this.setupFilters();

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const mobileToggle = document.getElementById('mobileMenuToggle');
                
                if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    navigateToSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        // Update page title
        const titles = {
            overview: 'Resumen General',
            chats: 'Chats',
            team: 'Equipo',
            integrations: 'Integraciones'
        };
        document.getElementById('pageTitle').textContent = titles[section];

        this.currentSection = section;

        // Close mobile menu if open
        this.closeMobileMenu();

        // Add animation
        document.getElementById(section).classList.add('fade-in');
        setTimeout(() => {
            document.getElementById(section).classList.remove('fade-in');
        }, 300);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        
        if (this.isSidebarCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }

        // Save preference
        localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed);
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    }

    closeMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.remove('active');
    }

    setupMobileMenu() {
        // Check if sidebar should be collapsed on load
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState === 'true') {
            this.isSidebarCollapsed = true;
            document.querySelector('.sidebar').classList.add('collapsed');
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = this.isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';

        // Save preference
        localStorage.setItem('darkTheme', this.isDarkTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('darkTheme');
        if (savedTheme === 'true') {
            this.isDarkTheme = true;
            document.documentElement.setAttribute('data-theme', 'dark');
            const themeIcon = document.querySelector('#themeToggle i');
            themeIcon.className = 'fas fa-sun';
        }
    }

    setupBrandCustomization() {
        // This would typically open a modal for brand customization
        // For now, we'll add event listeners for the brand modal
        const brandModal = document.getElementById('brandModal');
        const saveBrandBtn = document.getElementById('saveBrand');
        const cancelBrandBtn = document.getElementById('cancelBrand');

        if (saveBrandBtn) {
            saveBrandBtn.addEventListener('click', () => {
                this.saveBrandSettings();
                this.closeBrandModal();
            });
        }

        if (cancelBrandBtn) {
            cancelBrandBtn.addEventListener('click', () => {
                this.closeBrandModal();
            });
        }

        // Close modal when clicking outside
        if (brandModal) {
            brandModal.addEventListener('click', (e) => {
                if (e.target === brandModal) {
                    this.closeBrandModal();
                }
            });
        }
    }

    openBrandModal() {
        const brandModal = document.getElementById('brandModal');
        if (brandModal) {
            brandModal.classList.add('active');
        }
    }

    closeBrandModal() {
        const brandModal = document.getElementById('brandModal');
        if (brandModal) {
            brandModal.classList.remove('active');
        }
    }

    saveBrandSettings() {
        const companyName = document.getElementById('companyName').value;
        const primaryColor = document.getElementById('primaryColor').value;
        const logoUpload = document.getElementById('logoUpload').files[0];

        // Update company name
        if (companyName) {
            document.querySelector('.brand-name').textContent = companyName;
        }

        // Update primary color
        if (primaryColor) {
            document.documentElement.style.setProperty('--primary-color', primaryColor);
            document.documentElement.style.setProperty('--primary-dark', this.darkenColor(primaryColor, 20));
        }

        // Handle logo upload
        if (logoUpload) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.querySelector('.logo').src = e.target.result;
            };
            reader.readAsDataURL(logoUpload);
        }

        // Save to localStorage
        const brandSettings = {
            companyName,
            primaryColor,
            logo: logoUpload ? 'uploaded' : null
        };
        localStorage.setItem('brandSettings', JSON.stringify(brandSettings));

        this.showNotification('Configuración de marca guardada', 'success');
    }

    loadBrandSettings() {
        const savedSettings = localStorage.getItem('brandSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            
            if (settings.companyName) {
                document.querySelector('.brand-name').textContent = settings.companyName;
            }
            
            if (settings.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
                document.documentElement.style.setProperty('--primary-dark', this.darkenColor(settings.primaryColor, 20));
            }
        }
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    setupFilters() {
        const agentFilter = document.getElementById('agentFilter');
        const channelFilter = document.getElementById('channelFilter');
        const dateFilter = document.getElementById('dateFilter');

        if (agentFilter) {
            agentFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (channelFilter) {
            channelFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    applyFilters() {
        const agentFilter = document.getElementById('agentFilter').value;
        const channelFilter = document.getElementById('channelFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;

        // This would typically filter the chat list based on the selected filters
        console.log('Applying filters:', { agentFilter, channelFilter, dateFilter });
        
        // For demo purposes, we'll just show a notification
        this.showNotification('Filtros aplicados', 'info');
    }

    handleSearch(query) {
        if (query.length < 2) return;

        // This would typically search through chats, users, etc.
        console.log('Searching for:', query);
        
        // For demo purposes, we'll just show a notification
        this.showNotification(`Buscando: ${query}`, 'info');
    }

    initializeCharts() {
        this.initializeTokensChart();
        this.initializeChannelsChart();
    }

    initializeTokensChart() {
        const ctx = document.getElementById('tokensChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Tokens Consumidos',
                    data: [12000, 15000, 18000, 22000, 19000, 25000, 28000],
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initializeChannelsChart() {
        const ctx = document.getElementById('channelsChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['WhatsApp', 'Instagram', 'Web'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#25D366',
                        '#E4405F',
                        '#6366f1'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    handleResize() {
        // Close mobile menu on desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 1rem;
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // API Integration methods (for future use)
    async fetchChats() {
        try {
            const response = await fetch('/api/chats');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching chats:', error);
            this.showNotification('Error al cargar los chats', 'error');
        }
    }

    async fetchTeamMembers() {
        try {
            const response = await fetch('/api/team');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching team members:', error);
            this.showNotification('Error al cargar el equipo', 'error');
        }
    }

    async fetchStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching stats:', error);
            this.showNotification('Error al cargar las estadísticas', 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotDashboard();
});

// Add CSS for notifications
const notificationStyles = `
@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.notification {
    font-size: 0.875rem;
    color: var(--text-primary);
}

.notification-success {
    border-left: 4px solid var(--success-color);
}

.notification-error {
    border-left: 4px solid var(--danger-color);
}

.notification-warning {
    border-left: 4px solid var(--warning-color);
}

.notification-info {
    border-left: 4px solid var(--info-color);
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

