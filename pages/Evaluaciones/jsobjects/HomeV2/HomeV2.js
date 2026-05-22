export default {
  async init() {
    return await PageLoad.loadEvaluationData();
  },

  async refreshCurrentView(view = 'evaluaciones') {
    try {
      if (view === 'evaluaciones') {
        return await PageLoad.loadEvaluationData();
      }
      return null;
    } catch (error) {
      showAlert('Error cargando datos: ' + error.message, 'error');
      return { error: error.message };
    }
  },

  escapeSql(value) {
    return String(value ?? '').replace(/'/g, "''");
  },

  rawEvaluationRows() {
    return [
      {
        id_ejercicio: sel_eval_exercise_1.selectedOptionValue,
        label: sel_eval_exercise_1.selectedOptionLabel,
        peso: inp_eval_peso_1.text,
        reps: inp_eval_reps_1.text,
        rpe: inp_eval_rpe_1.text,
        tecnica: sel_eval_tecnica_1.selectedOptionValue
      },
      {
        id_ejercicio: sel_eval_exercise_2.selectedOptionValue,
        label: sel_eval_exercise_2.selectedOptionLabel,
        peso: inp_eval_peso_2.text,
        reps: inp_eval_reps_2.text,
        rpe: inp_eval_rpe_2.text,
        tecnica: sel_eval_tecnica_2.selectedOptionValue
      },
      {
        id_ejercicio: sel_eval_exercise_3.selectedOptionValue,
        label: sel_eval_exercise_3.selectedOptionLabel,
        peso: inp_eval_peso_3.text,
        reps: inp_eval_reps_3.text,
        rpe: inp_eval_rpe_3.text,
        tecnica: sel_eval_tecnica_3.selectedOptionValue
      },
      {
        id_ejercicio: sel_eval_exercise_4.selectedOptionValue,
        label: sel_eval_exercise_4.selectedOptionLabel,
        peso: inp_eval_peso_4.text,
        reps: inp_eval_reps_4.text,
        rpe: inp_eval_rpe_4.text,
        tecnica: sel_eval_tecnica_4.selectedOptionValue
      },
      {
        id_ejercicio: sel_eval_exercise_5.selectedOptionValue,
        label: sel_eval_exercise_5.selectedOptionLabel,
        peso: inp_eval_peso_5.text,
        reps: inp_eval_reps_5.text,
        rpe: inp_eval_rpe_5.text,
        tecnica: sel_eval_tecnica_5.selectedOptionValue
      },
      {
        id_ejercicio: sel_eval_exercise_6.selectedOptionValue,
        label: sel_eval_exercise_6.selectedOptionLabel,
        peso: inp_eval_peso_6.text,
        reps: inp_eval_reps_6.text,
        rpe: inp_eval_rpe_6.text,
        tecnica: sel_eval_tecnica_6.selectedOptionValue
      }
    ].filter((row) => row.id_ejercicio && !['__empty__', '__loading__'].includes(row.id_ejercicio));
  },

  validEvaluationRows() {
    return this.rawEvaluationRows().filter((row) => row.peso !== '' && row.reps !== '' && row.rpe !== '' && row.tecnica);
  },

  canSaveEvaluation() {
    return !!sel_eval_student.selectedOptionValue &&
      !['__empty__', '__loading__'].includes(sel_eval_student.selectedOptionValue) &&
      !!sel_eval_objetivo.selectedOptionValue &&
      !!sel_eval_prioridad_recomposicion.selectedOptionValue &&
      !!sel_eval_enfoque_principal.selectedOptionValue &&
      !!sel_eval_enfoque_especifico.selectedOptionValue &&
      !!sel_eval_debilidad.selectedOptionValue &&
      !!inp_eval_frecuencia.text &&
      !!sel_eval_nivel.selectedOptionValue &&
      this.validEvaluationRows().length > 0 &&
      this.validEvaluationRows().length === this.rawEvaluationRows().length;
  },

  evaluationRows(idSesion) {
    return this.validEvaluationRows().map((row) => ({
      id_sesion: Number(idSesion),
      id_ejercicio: Number(row.id_ejercicio),
      punto_evaluado: row.label ? "'" + this.escapeSql(row.label) + "'" : 'NULL',
      peso_manejado: Number(row.peso || 0),
      reps_logradas: Number(row.reps || 0),
      rpe_observado: Number(row.rpe || 0),
      tecnica_calificacion: Number(row.tecnica || 0)
    }));
  },

  selectedStudent() {
    const idAlumno = Number(sel_eval_student.selectedOptionValue);
    const sources = [
      appsmith.store.evaluaciones_student_options || [],
      get_pending_initial_evaluations.data || [],
      get_pending_students_lookup.data || []
    ];
    return sources.flat().find((student) => Number(student.id_alumno || student.value) === idAlumno) || {};
  },

  normalizeObjetivo(value) {
    const raw = String(value || '').trim();
    const key = raw.toLowerCase();
    if (key.includes('recompos')) return 'RC';
    if (key.includes('grasa')) return 'perdida_de_grasa';
    if (key.includes('muscul')) return 'musculatura';
    return raw || null;
  },

  noneToNull(value) {
    return ['ninguno', 'ninguna', '', null, undefined].includes(value) ? null : value;
  },

  routineAutomationPayload() {
    return [
      {
        id_alumno: Number(sel_eval_student.selectedOptionValue),
        objetivo: sel_eval_objetivo.selectedOptionValue,
        prioridad_recomposicion: sel_eval_prioridad_recomposicion.selectedOptionValue,
        enfoque_principal: sel_eval_enfoque_principal.selectedOptionValue,
        enfoque_especifico: this.noneToNull(sel_eval_enfoque_especifico.selectedOptionValue),
        debilidad: this.noneToNull(sel_eval_debilidad.selectedOptionValue)
      }
    ];
  },

  async saveEvaluation() {
    if (!this.canSaveEvaluation()) {
      showAlert('Completa alumno, objetivo, prioridad, enfoque principal, enfoque específico, debilidad, frecuencia, nivel y al menos un ejercicio con peso/reps/RPE/técnica.', 'warning');
      return;
    }
    try {
      const sesion = await create_eval_session_v2.run();
      const idSesion = sesion?.[0]?.id_sesion;
      if (!idSesion) throw new Error('No se pudo crear la sesión de evaluación.');
      await insert_eval_movements_v2.run({ id_sesion: idSesion });
      await complete_initial_evaluation.run();
      await routine_automation.run();
      showAlert('Evaluación guardada y alumno actualizado', 'success');
      resetWidget('sel_eval_student');
      await this.refreshCurrentView('evaluaciones');
    } catch (error) {
      showAlert('Error guardando evaluación: ' + error.message, 'error');
    }
  }
}
