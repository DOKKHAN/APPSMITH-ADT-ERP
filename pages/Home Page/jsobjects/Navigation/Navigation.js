export default {
    tabs: {
        INICIO: 'Inicio',
        RUTINAS: 'Rutinas',
        ADMIN: 'Admin'
    },

    switchTab: async (tabName) => {
        // Validación de Seguridad RBAC (Role Based Access Control)
        if (tabName === 'Admin' && appsmith.store.user_role !== 'admin') {
            showAlert("Acceso Denegado: Se requieren permisos de administrador", "error");
            return;
        }

        // Actualizar el estado global de navegación
        await storeValue('selectedTab', tabName);
    },

    initPage: async () => {
        if (!appsmith.store.selectedTab) {
            await storeValue('selectedTab', 'Inicio');
        }
    }
}