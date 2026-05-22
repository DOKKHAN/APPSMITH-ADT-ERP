export default {
  async loadEvaluationData() {
    await storeValue('evaluaciones_loading', true);
    await storeValue('evaluaciones_error', '');

    try {
      const [pendingResult, lookupResult, exercisesResult] = await Promise.allSettled([
        get_pending_initial_evaluations.run(),
        get_pending_students_lookup.run(),
        get_exercises_lookup.run()
      ]);

      const pendingRows = pendingResult.status === 'fulfilled'
        ? (pendingResult.value || get_pending_initial_evaluations.data || [])
        : [];
      const pendingLookupRows = lookupResult.status === 'fulfilled'
        ? (lookupResult.value || get_pending_students_lookup.data || [])
        : [];
      const exerciseRows = exercisesResult.status === 'fulfilled'
        ? (exercisesResult.value || get_exercises_lookup.data || [])
        : [];
      const studentRows = pendingRows.length ? pendingRows : pendingLookupRows;
      const errors = [
        pendingResult.status === 'rejected' ? 'alumnos pendientes: ' + pendingResult.reason.message : '',
        lookupResult.status === 'rejected' ? 'lookup alumnos: ' + lookupResult.reason.message : '',
        exercisesResult.status === 'rejected' ? 'ejercicios: ' + exercisesResult.reason.message : ''
      ].filter(Boolean);

      await storeValue('evaluaciones_student_options', studentRows);
      await storeValue('evaluaciones_exercise_options', exerciseRows);
      await storeValue('evaluaciones_loaded', true);

      if (errors.length) {
        await storeValue('evaluaciones_error', errors.join(' | '));
        showAlert('Carga parcial de evaluaciones: ' + errors.join(' | '), 'warning');
      }

      return {
        loadedStudents: studentRows.length,
        pendingRows: pendingRows.length,
        pendingLookupRows: pendingLookupRows.length,
        loadedExercises: exerciseRows.length,
        errors,
        studentRows,
        exerciseRows
      };
    } catch (error) {
      await storeValue('evaluaciones_error', error.message);
      showAlert('Error cargando evaluaciones: ' + error.message, 'error');
      return { loadedStudents: 0, loadedExercises: 0, error: error.message };
    } finally {
      await storeValue('evaluaciones_loading', false);
    }
  },

  async init() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await this.loadEvaluationData();
  }
}
