(function () {
  const storageKey = 'm3dl_simple_data';
  const examWeightInput = document.getElementById('exam-weight');
  const continuousWeightInput = document.getElementById('continuous-weight');
  const examBar = document.getElementById('exam-bar');
  const continuousBar = document.getElementById('continuous-bar');
  const form = document.getElementById('subject-form');
  const typeInput = document.getElementById('assessment-type');
  const subjectList = document.getElementById('subject-list');
  const clearButton = document.getElementById('clear-button');

  let state = loadState();

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Array.isArray(saved.subjects)) {
        return {
          examWeight: clamp(saved.examWeight ?? 60),
          subjects: saved.subjects
        };
      }
    } catch (error) {
      console.warn('Impossible de charger les données sauvegardées.', error);
    }
    return { examWeight: 60, subjects: [] };
  }

  function saveState() {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function clamp(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function formatPercent(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function setWeights(examPercent) {
    state.examWeight = clamp(examPercent);
    const continuousPercent = 100 - state.examWeight;

    examWeightInput.value = state.examWeight;
    continuousWeightInput.value = continuousPercent;
    examBar.style.width = state.examWeight + '%';
    continuousBar.style.width = continuousPercent + '%';
    examBar.textContent = state.examWeight + '%';
    continuousBar.textContent = continuousPercent + '%';

    updateGradeFields();
    renderSubjects();
    saveState();
  }

  function getWeights(type) {
    const continuous = 100 - state.examWeight;
    return {
      exam: type === 'exam' ? 100 : state.examWeight,
      td: type === 'both' ? continuous / 2 : continuous,
      tp: type === 'both' ? continuous / 2 : continuous
    };
  }

  function updateGradeFields() {
    const type = typeInput.value;
    const weights = getWeights(type);
    const tdField = document.getElementById('td-field');
    const tpField = document.getElementById('tp-field');

    tdField.hidden = type === 'tp' || type === 'exam';
    tpField.hidden = type === 'td' || type === 'exam';
    document.getElementById('exam-label').textContent = 'Examen (' + formatPercent(weights.exam) + '%)';
    document.getElementById('td-label').textContent = 'TD (' + formatPercent(weights.td) + '%)';
    document.getElementById('tp-label').textContent = 'TP (' + formatPercent(weights.tp) + '%)';
  }

  function calculateGrade(subject) {
    const weights = getWeights(subject.type);
    if (subject.type === 'exam') return subject.exam;

    let grade = subject.exam * (weights.exam / 100);
    if (subject.type === 'both' || subject.type === 'td') grade += subject.td * (weights.td / 100);
    if (subject.type === 'both' || subject.type === 'tp') grade += subject.tp * (weights.tp / 100);
    return Math.round(grade * 100) / 100;
  }

  function renderSubjects() {
    if (state.subjects.length === 0) {
      subjectList.innerHTML = '<p class="empty-state">Aucune matière ajoutée.</p>';
      clearButton.hidden = true;
      document.getElementById('semester-average').textContent = '--';
      return;
    }

    let weightedTotal = 0;
    let coefficientTotal = 0;
    subjectList.innerHTML = '';

    state.subjects.forEach(function (subject) {
      const grade = calculateGrade(subject);
      weightedTotal += grade * subject.coefficient;
      coefficientTotal += subject.coefficient;

      const row = document.createElement('article');
      row.className = 'subject-row';

      const info = document.createElement('div');
      const name = document.createElement('div');
      const meta = document.createElement('div');
      name.className = 'subject-name';
      meta.className = 'subject-meta';
      name.textContent = subject.name;
      meta.textContent = 'Coefficient ' + subject.coefficient + ' · ' + typeLabel(subject.type);
      info.append(name, meta);

      const weightSummary = document.createElement('div');
      weightSummary.className = 'subject-meta';
      const weights = getWeights(subject.type);
      weightSummary.textContent = subject.type === 'exam'
        ? 'Examen 100%'
        : 'Examen ' + formatPercent(weights.exam) + '% · CC ' + formatPercent(100 - weights.exam) + '%';

      const gradeElement = document.createElement('div');
      gradeElement.className = 'subject-grade';
      gradeElement.textContent = grade.toFixed(2) + '/20';

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button';
      deleteButton.type = 'button';
      deleteButton.textContent = '×';
      deleteButton.setAttribute('aria-label', 'Supprimer ' + subject.name);
      deleteButton.addEventListener('click', function () {
        state.subjects = state.subjects.filter(function (item) { return item.id !== subject.id; });
        saveState();
        renderSubjects();
      });

      row.append(info, weightSummary, gradeElement, deleteButton);
      subjectList.appendChild(row);
    });

    const average = coefficientTotal ? weightedTotal / coefficientTotal : 0;
    document.getElementById('semester-average').textContent = average.toFixed(2) + '/20';
    clearButton.hidden = false;
  }

  function typeLabel(type) {
    return { both: 'TD + TP', td: 'TD seulement', tp: 'TP seulement', exam: 'Examen seulement' }[type];
  }

  examWeightInput.addEventListener('input', function () { setWeights(examWeightInput.value); });
  continuousWeightInput.addEventListener('input', function () { setWeights(100 - clamp(continuousWeightInput.value)); });
  typeInput.addEventListener('change', updateGradeFields);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    state.subjects.push({
      id: Date.now(),
      name: document.getElementById('subject-name').value.trim(),
      coefficient: Number(document.getElementById('subject-coef').value) || 1,
      type: typeInput.value,
      exam: Number(document.getElementById('exam-grade').value) || 0,
      td: Number(document.getElementById('td-grade').value) || 0,
      tp: Number(document.getElementById('tp-grade').value) || 0
    });
    form.reset();
    document.getElementById('subject-coef').value = 1;
    updateGradeFields();
    saveState();
    renderSubjects();
    document.getElementById('subject-name').focus();
  });

  clearButton.addEventListener('click', function () {
    if (window.confirm('Effacer toutes les matières ?')) {
      state.subjects = [];
      saveState();
      renderSubjects();
    }
  });

  setWeights(state.examWeight);
})();
