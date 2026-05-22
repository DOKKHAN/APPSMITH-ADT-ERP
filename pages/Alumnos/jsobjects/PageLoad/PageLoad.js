export default {
  async loadStudents() {
    try {
      await Promise.all([
        get_students_lookup.run(),
        get_active_students.run()
      ]);

      const lookupRows = get_students_lookup.data || [];
      const activeRows = get_active_students.data || [];
      const rows = activeRows.length ? activeRows : lookupRows;

      await storeValue('alumnos_student_options', rows);

      return {
        loaded: rows.length,
        activeRows: activeRows.length,
        lookupRows: lookupRows.length,
        rows
      };
    } catch (error) {
      showAlert('Error cargando alumnos: ' + error.message, 'error');
      return { loaded: 0, error: error.message };
    }
  },

  async init() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await this.loadStudents();
  }
}
