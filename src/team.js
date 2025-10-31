
// Función global simple para mostrar el modal
window.showTeamModal = function() {
    if (window.teamManager) {
        window.teamManager.showInviteModal();
    } else {
        console.error('TeamManager no está disponible');
        alert('Error: TeamManager no está disponible');
    }
};

// Gestión de Equipo de Ventas
class TeamManager {
    constructor() {
        this.maxMembers = 3;
        this.teamMembers = [];
        this.usingAirtable = false;
        this.init();
    }

    async init() {
        // Usar Airtable siempre que haya apiKey, incluso en localhost
        this.usingAirtable = !!(window.airtableService && window.airtableService.apiKey);
        await this.loadTeamMembers();
        this.setupEventListeners();
        this.updateTeamUI();
    }

    setupEventListeners() {
        const inviteBtn = document.getElementById('inviteMemberBtn');
        if (inviteBtn) {
            inviteBtn.addEventListener('click', () => {
                this.showInviteModal();
            });
        }
    }

    async loadTeamMembers() {
        if (this.usingAirtable) {
            try {
                const owner = window.authService?.getCurrentUser();
                const ownerEmail = owner?.email;
                if (!ownerEmail) {
                    console.warn('⚠️ No hay email del propietario para cargar equipo');
                    this.teamMembers = [];
                    return;
                }
                const result = await window.airtableService.getTeamMembers(ownerEmail);
                this.teamMembers = (result.success && Array.isArray(result.members)) ? result.members : [];
                console.log('✅ Miembros del equipo (Airtable):', this.teamMembers);
            } catch (error) {
                console.error('❌ Error cargando equipo desde Airtable:', error);
                // En modo Airtable, si hay error, mostrar vacío (no datos locales)
                this.teamMembers = [];
            }
        } else {
            // Cargar miembros del equipo desde localStorage
            const savedTeam = localStorage.getItem('teamMembers');
            if (savedTeam) {
                try {
                    this.teamMembers = JSON.parse(savedTeam);
                    console.log('✅ Miembros del equipo cargados:', this.teamMembers);
                } catch (error) {
                    console.error('❌ Error cargando miembros del equipo:', error);
                    this.teamMembers = [];
                }
            }
        }
    }

    saveTeamMembers() {
        if (this.usingAirtable) return; // En Airtable no guardamos en localStorage
        localStorage.setItem('teamMembers', JSON.stringify(this.teamMembers));
        console.log('💾 Miembros del equipo guardados');
    }

    updateTeamUI() {
        // Actualizar contador
        const currentCount = document.getElementById('currentMembersCount');
        if (currentCount) {
            currentCount.textContent = this.teamMembers.length;
        }

        // Actualizar barra de progreso
        const progressFill = document.getElementById('teamProgressFill');
        if (progressFill) {
            const percentage = (this.teamMembers.length / this.maxMembers) * 100;
            progressFill.style.width = `${percentage}%`;
        }

        // Notificar al dashboard para actualizar el contador de miembros del equipo
        if (window.dashboard && typeof window.dashboard.updateOverviewStats === 'function') {
            window.dashboard.updateOverviewStats();
        }

        // Actualizar lista de miembros
        this.renderTeamMembers();

        // Deshabilitar botón si llegó al límite
        const inviteBtn = document.getElementById('inviteMemberBtn');
        if (inviteBtn) {
            if (this.teamMembers.length >= this.maxMembers) {
                inviteBtn.disabled = true;
                inviteBtn.innerHTML = '<i class="fas fa-lock"></i> Límite alcanzado';
            } else {
                inviteBtn.disabled = false;
                inviteBtn.innerHTML = '<i class="fas fa-user-plus"></i> Invitar Miembro';
            }
        }
    }

    renderTeamMembers() {
        const membersList = document.getElementById('teamMembersList');
        if (!membersList) return;

        if (this.teamMembers.length === 0) {
            membersList.innerHTML = `
                <div class="empty-team-state">
                    <i class="fas fa-user-slash"></i>
                    <p>Aún no has invitado a ningún miembro</p>
                    <button class="btn btn-outline" onclick="window.showTeamModal()">
                        <i class="fas fa-user-plus"></i>
                        Invitar Primer Miembro
                    </button>
                </div>
            `;
            return;
        }

        membersList.innerHTML = this.teamMembers.map((member, index) => `
            <div class="team-member-card" data-member-id="${member.id}">
                <div class="member-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.email}</p>
                    <span class="member-role">
                        <i class="fas fa-briefcase"></i>
                        ${member.role}
                    </span>
                </div>
                <div class="member-actions">
                    <button class="btn-icon" onclick="window.teamManager.removeMember('${member.id}')" title="Eliminar miembro">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showInviteModal() {
        if (this.teamMembers.length >= this.maxMembers) {
            this.showNotification('Ya has alcanzado el límite de 3 miembros', 'warning');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay team-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>
                        <i class="fas fa-user-plus"></i>
                        Invitar Miembro al Equipo
                    </h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #475569; font-size: 0.9rem;">
                            <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                            <span>Los miembros recibirán notificaciones cuando un cliente sea calificado por el chatbot.</span>
                        </div>
                    </div>
                    <form id="inviteMemberForm">
                        <div class="form-group">
                            <label for="memberEmail">Correo Electrónico</label>
                            <input 
                                type="email" 
                                id="memberEmail" 
                                class="form-input" 
                                placeholder="juan.perez@empresa.com"
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label for="memberRole">Rol en el Equipo</label>
                            <select id="memberRole" class="form-input" required>
                                <option value="">Selecciona un rol...</option>
                                <option value="user">User</option>
                                <option value="agent">Agent</option>
                            </select>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane"></i>
                                Enviar Invitación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup form handler
        const form = modal.querySelector('#inviteMemberForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInvite(form, modal);
        });

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async handleInvite(form, modal) {
        const formData = new FormData(form);
        const memberData = {
            id: Date.now().toString(),
            email: formData.get('memberEmail'),
            // Derivar nombre a partir del email (antes de @) si no existe
            name: (formData.get('memberEmail') || '').split('@')[0],
            role: formData.get('memberRole'),
            invitedAt: new Date().toISOString(),
            status: 'active'
        };

        try {
            if (this.usingAirtable) {
                const ownerEmail = window.authService?.getCurrentUser()?.email;
                const result = await window.airtableService.addTeamMember(ownerEmail, {
                    email: memberData.email,
                    name: memberData.name,
                    role: memberData.role
                });
                if (!result.success) throw new Error(result.error || 'No se pudo agregar');
                // Recargar desde Airtable para asegurar datos reales
                await this.loadTeamMembers();
            } else {
                // Agregar miembro al equipo localmente
                this.teamMembers.push(memberData);
                this.saveTeamMembers();
            }
            this.updateTeamUI();

            // Cerrar modal
            modal.remove();

            // Mostrar notificación de éxito
            this.showNotification(`${memberData.name} ha sido agregado al equipo`, 'success');
            console.log('✅ Miembro agregado');
        } catch (error) {
            console.error('❌ Error agregando miembro:', error);
            // Fallback: guardar localmente para no bloquear el flujo
            if (!this.usingAirtable) {
                this.teamMembers.push(memberData);
                this.saveTeamMembers();
                this.updateTeamUI();
                this.showNotification('Miembro guardado localmente', 'warning');
            } else {
                this.showNotification(error.message || 'Error agregando miembro', 'error');
            }
        }
    }

    async removeMember(memberId) {
        const member = this.teamMembers.find(m => m.id === memberId);
        if (!member) return;

        if (!confirm(`¿Estás seguro de eliminar a ${member.name} del equipo?`)) return;

        try {
            if (this.usingAirtable && memberId) {
                const result = await window.airtableService.removeTeamMember(memberId);
                if (!result.success) throw new Error(result.error || 'No se pudo eliminar en Airtable');
                // Recargar desde Airtable
                await this.loadTeamMembers();
            } else {
                this.teamMembers = this.teamMembers.filter(m => m.id !== memberId);
                this.saveTeamMembers();
            }
            this.updateTeamUI();
            this.showNotification(`${member.name} ha sido eliminado del equipo`, 'info');
            console.log('🗑️ Miembro eliminado:', member);
        } catch (error) {
            console.error('❌ Error eliminando miembro:', error);
            this.showNotification(error.message || 'Error eliminando miembro', 'error');
        }
    }

    // Asignación simple: envía email al miembro asignado
    assignToMember(memberEmail, assignment) {
        const member = this.teamMembers.find(m => m.email === memberEmail);
        if (!member) {
            this.showNotification('Miembro no encontrado', 'error');
            return;
        }

        const subject = encodeURIComponent(assignment?.subject || `Nueva asignación`);
        const owner = window.authService?.getCurrentUser();
        const ownerName = owner?.name || owner?.email || 'Administrador';
        const body = encodeURIComponent(
            `${assignment?.message || 'Tienes una nueva asignación.'}\n\n` +
            (assignment?.details ? `${assignment.details}\n\n` : '') +
            `Asignado por: ${ownerName}\nFecha: ${new Date().toLocaleString('es-ES')}`
        );

        const mailto = `mailto:${member.email}?subject=${subject}&body=${body}`;
        // Abrir cliente de correo del sistema
        window.location.href = mailto;

        this.showNotification(`Email de asignación preparado para ${member.name}`, 'success');
    }

    // Método para notificar al equipo sobre un cliente calificado
    notifyTeamAboutQualifiedLead(clientData) {
        if (this.teamMembers.length === 0) {
            console.warn('⚠️ No hay miembros en el equipo para notificar');
            return;
        }

        const user = window.authService ? window.authService.getCurrentUser() : null;
        const ownerName = user ? user.name || 'El administrador' : 'El administrador';

        this.teamMembers.forEach(member => {
            const subject = encodeURIComponent(`🎯 Nuevo cliente calificado - ${clientData.name || 'Cliente'}`);
            const body = encodeURIComponent(
                `Hola ${member.name},\n\n` +
                `Se ha calificado un nuevo cliente y está listo para que lo trabajes:\n\n` +
                `📋 DATOS DEL CLIENTE:\n` +
                `Nombre: ${clientData.name || 'No especificado'}\n` +
                `Email: ${clientData.email || 'No especificado'}\n` +
                `Teléfono: ${clientData.phone || 'No especificado'}\n` +
                `Empresa: ${clientData.company || 'No especificado'}\n\n` +
                `💬 INFORMACIÓN ADICIONAL:\n` +
                `${clientData.notes || 'Sin notas adicionales'}\n\n` +
                `Por favor, contacta a este cliente lo antes posible.\n\n` +
                `---\n` +
                `Notificación enviada por: ${ownerName}\n` +
                `Fecha: ${new Date().toLocaleString('es-ES')}`
            );

            const mailtoLink = `mailto:${member.email}?subject=${subject}&body=${body}`;
            // Abrir cliente de correo (uno por vez)
            window.location.href = mailtoLink;
            console.log(`📧 Notificación disparada para ${member.name} (${member.email})`);
        });

        this.showNotification(`Emails de notificación disparados a ${this.teamMembers.length} miembro(s)`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';

        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        notification.addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    // Método para forzar la reinicialización
    forceReinitialize() {
        console.log('🔄 Forzando reinicialización del TeamManager...');
        this.setupEventListeners();
        this.updateTeamUI();
        console.log('✅ TeamManager reinicializado forzadamente');
    }

}

// Inicializar TeamManager de forma robusta (funciona si el DOM ya está listo)
(function initTeamManager() {
    function bootstrap() {
        if (!window.teamManager) {
            window.teamManager = new TeamManager();
            console.log('✅ TeamManager inicializado');
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // Reinicializar cuando se accede a la sección de equipo
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('[data-section="team"]');
        if (navItem) {
            setTimeout(() => {
                if (window.teamManager) {
                    window.teamManager.setupEventListeners();
                    window.teamManager.updateTeamUI();
                }
            }, 100);
        }
    });
})();

// Función global para reinicializar manualmente si es necesario
window.reinitializeTeam = () => {
    if (window.teamManager) {
        window.teamManager.forceReinitialize();
    } else {
        console.error('❌ TeamManager no está disponible');
    }
};

