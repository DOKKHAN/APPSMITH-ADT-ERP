export default {
  async loadStudents() {
    try {
      await get_students_lookup.run();

      const rows = get_students_lookup.data || [];
      await storeValue('rutinas_student_options', rows);

      let routineRows = [];
      if (sel_routine_student.selectedOptionValue && sel_routine_student.selectedOptionValue !== '__empty__') {
        await get_student_routine.run();
        routineRows = get_student_routine.data || [];
      }

      return {
        loaded: rows.length,
        routineRows: routineRows.length,
        rows
      };
    } catch (error) {
      showAlert('Error cargando rutinas: ' + error.message, 'error');
      return { loaded: 0, routineRows: 0, error: error.message };
    }
  },

  async init() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await this.loadStudents();
  }
}
