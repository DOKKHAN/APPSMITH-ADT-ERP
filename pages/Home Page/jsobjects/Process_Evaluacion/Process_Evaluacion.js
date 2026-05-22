export default {
  async guardarTodo() {
    try {
      // 1. Crear la Sesión
      const res = await create_sesion.run();
      const nuevaSesionId = res[0].id_sesion;

      // 2. Insertar los detalles (Pasamos el ID de sesión)
      await insert_detalles_masivo.run({ "id_sesion": nuevaSesionId });

      // 3. Marcar al alumno como evaluado (NUEVO PASO)
      await update_alumno_evaluado.run();

      showAlert("Evaluación guardada y alumno actualizado", "success");

      // 4. Refrescar los datos para que el alumno desaparezca de la lista
      // Reemplaza 'get_alumnos_pendientes' por el nombre de tu query del Select
      await get_alumnos_pendientes.run(); 
      
      // Limpiar selección actual
      resetWidget("sel_alumno");
      resetWidget("List1");

    } catch (error) {
      showAlert("Error en el proceso: " + error.message, "error");
    }
  }
}