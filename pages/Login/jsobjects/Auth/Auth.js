export default {
    defaultSlogan: "\"Tu compromiso hoy es su éxito mañana.\"",

    slogans: [
        "\"Tu compromiso hoy es su éxito mañana.\"",
        "\"Presentes en cada paso, desde el primer día.\"",
        "\"Acompañar no es una tarea, es nuestra promesa.\"",
        "\"Expertos en guiar, apasionados por servir.\"",
        "\"La excelencia se nota en los detalles que cuidas.\"",
        "\"Somos el equipo que hace el entrenamiento más humano.\""
    ],

    async init() {
        const randomIndex = Math.floor(Math.random() * this.slogans.length);
        await storeValue("login_slogan_opacity", 1);
        await storeValue("login_slogan_index", randomIndex);
        await storeValue("login_slogan", this.slogans[randomIndex]);

        clearInterval("login_slogan_rotation");
        setInterval(() => Auth.rotateSlogan(), 5000, "login_slogan_rotation");
    },

    async rotateSlogan() {
        if (appsmith.store.login_slogan_animating) {
            return;
        }

        try {
            await storeValue("login_slogan_animating", true);
            const currentIndex = Number(appsmith.store.login_slogan_index ?? -1);
            const nextIndex = (currentIndex + 1) % this.slogans.length;

            await this.fadeSlogan([1, 0.86, 0.68, 0.48, 0.3, 0.14]);
            await storeValue("login_slogan_index", nextIndex);
            await storeValue("login_slogan", this.slogans[nextIndex]);
            await this.fadeSlogan([0.14, 0.3, 0.48, 0.68, 0.86, 1]);
        } finally {
            await storeValue("login_slogan_opacity", 1);
            await storeValue("login_slogan_animating", false);
        }
    },

    async fadeSlogan(opacitySteps) {
        for (const opacity of opacitySteps) {
            await storeValue("login_slogan_opacity", opacity);
            await new Promise(resolve => setTimeout(resolve, 45));
        }
    },

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
