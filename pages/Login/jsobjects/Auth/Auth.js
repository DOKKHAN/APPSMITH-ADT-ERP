export default {
    async login() {
        if (!inp_email.text || !inp_password.text) {
            showAlert("Por favor, llena todos los campos", "warning");
            return;
        }

        try {
            const data = await api_login_supabase.run();

            if (!data?.access_token || !data?.user?.email) {
                showAlert("Email o contraseña incorrectos", "error");
                return;
            }

            const user = data.user;

            const displayName =
                user.user_metadata?.display_name ||
                user.user_metadata?.nombre ||
                user.email;

            // Guardar sesión Supabase
            await storeValue("sb_access_token", data.access_token);
            await storeValue("sb_refresh_token", data.refresh_token);
            await storeValue("sb_expires_at", data.expires_at);

            // Guardar datos simples del usuario
            await storeValue("user_id", user.id);
            await storeValue("user_email", user.email);
            await storeValue("user_name", displayName);

            // Mantener esto si tu Sidebar/Home V2 depende de selectedTab
            await storeValue("selectedTab", "Inicio");

            showAlert("Bienvenido de nuevo, " + displayName, "success");
            navigateTo("Home V2");

        } catch (error) {
            showAlert("Email o contraseña incorrectos", "error");
            console.error(error);
        }
    }
}