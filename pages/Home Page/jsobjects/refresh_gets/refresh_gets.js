export default {
  async actualizar_busquedas() {
    try {
      showAlert("Datos actualizados", "success");

      await get_alumnos_pendientes.run(); 
      await get_active_evaluated_students.run();
      await get_current_routine.run();
      await get_daily_exercises.run();

    } catch (error) {
      showAlert("Error en el proceso: " + error.message, "error");
    }
  }
}
