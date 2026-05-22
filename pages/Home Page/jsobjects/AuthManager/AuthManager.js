export default {
	// Función para verificar si hay sesión al cargar cualquier página protegida
	verificarSesion() {
		const tenant = appsmith.store.tenant_schema;
		const userId = appsmith.store.user_id;

		// Si falta alguno de los datos críticos, lo mandamos al Login
		if (!tenant || !userId) {
			showAlert("Sesión expirada o no válida. Por favor inicia sesión.", "warning");
			navigateTo("Login"); // Asegúrate de que este sea el nombre de tu página de login
			return false;
		}
		return true;
	},

	// Función de Logout
	async logout() {
		await Promise.all([
			removeValue("user_id"),
			removeValue("user_name"),
			removeValue("tenant_schema"),
			removeValue("user_role"),
			removeValue("selectedTab")
		]);
		
		showAlert("Has cerrado sesión correctamente", "success");
		
		navigateTo("Login");
	}
}
