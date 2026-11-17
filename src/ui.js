/**
 * UI Manager
 * Handles all UI interactions and updates
 */

import { Calculator } from './calculator.js';
import { Storage } from './storage.js';
import { Share } from './share.js';
import { DEFAULT_SUBJECTS } from './data.js';

export class UI {
    constructor() {
        this.calculator = new Calculator();
        this.storage = new Storage();
        this.share = new Share();

        this.data = null;
        this.currentYear = 1;
        this.currentSemester = 1;

        // Edit mode state
        this.isEditing = false;
        this.editingId = null;

        this.init();
    }

    init() {
        // Load data from localStorage or create new
        this.loadData();

        // Initialize event listeners
        this.initEventListeners();

        // Render initial state
        this.updateUI();

        // Initial form state
        this.updateFormVisibility('both'); // Default
    }

    loadData() {
        const savedData = this.storage.loadFromLocalStorage();

        if (savedData && this.storage.validateData(savedData)) {
            this.data = this.storage.migrateData(savedData);
            this.currentYear = savedData.currentYear || 1;
            this.currentSemester = savedData.currentSemester || 1;
        } else {
            this.data = this.storage.createEmptyData();
        }
    }

    saveData() {
        this.data.currentYear = this.currentYear;
        this.data.currentSemester = this.currentSemester;
        this.data.lastModified = new Date().toISOString();

        if (this.data.settings.autoSave) {
            this.storage.saveToLocalStorage(this.data);
        }
    }

    initEventListeners() {
        // Year selector
        const yearSelect = document.getElementById('year-select');
        yearSelect.value = this.currentYear;
        yearSelect.addEventListener('change', (e) => {
            this.currentYear = parseInt(e.target.value);
            this.updateUI();
            this.saveData();
            // Clear suggestions on year change
            const list = document.getElementById('suggestions-list');
            if (list) list.classList.remove('active');
        });

        // Semester buttons
        const semesterButtons = document.querySelectorAll('.btn-semester');
        semesterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const semester = parseInt(e.target.dataset.semester);
                this.currentSemester = semester;

                // Update active state
                semesterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                this.updateUI();
                this.saveData();
                // Clear suggestions on semester change
                const list = document.getElementById('suggestions-list');
                if (list) list.classList.remove('active');
            });
        });

        // Subject form
        const subjectForm = document.getElementById('subject-form');
        subjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel edit button
        const cancelBtn = document.getElementById('cancel-edit-btn');
        cancelBtn.addEventListener('click', () => {
            this.resetForm();
        });

        // Subject name input (Custom Autocomplete)
        const nameInput = document.getElementById('subject-name');

        nameInput.addEventListener('input', (e) => {
            this.handleSubjectInput(e.target.value);
        });

        nameInput.addEventListener('focus', () => {
            this.handleSubjectInput(nameInput.value);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const wrapper = document.querySelector('.autocomplete-wrapper');
            const list = document.getElementById('suggestions-list');
            // If click is outside wrapper and list is active
            if (wrapper && !wrapper.contains(e.target) && list && list.classList.contains('active')) {
                list.classList.remove('active');
            }
        });

        // TD/TP type radio buttons
        const tpTypeRadios = document.querySelectorAll('input[name="tp-type"]');
        tpTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateFormVisibility(e.target.value);
            });
        });

        // Save button
        const saveBtn = document.getElementById('save-btn');
        saveBtn.addEventListener('click', () => {
            this.exportData();
        });

        // Load button
        const loadBtn = document.getElementById('load-btn');
        const fileInput = document.getElementById('file-input');

        loadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Exam / continuous-assessment weighting
        const examWeightInput = document.getElementById('exam-weight');
        const continuousWeightInput = document.getElementById('continuous-weight');

        this.updateWeightDisplay(60);

        examWeightInput.addEventListener('input', () => {
            this.updateWeightDisplay(examWeightInput.value);
            this.updateFormVisibility(document.querySelector('input[name="tp-type"]:checked').value);
        });

        continuousWeightInput.addEventListener('input', () => {
            this.updateWeightDisplay(100 - this.clampPercentage(continuousWeightInput.value));
            this.updateFormVisibility(document.querySelector('input[name="tp-type"]:checked').value);
        });

        // Share button
        const shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', () => {
            this.shareResults();
        });
    }

    clampPercentage(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return 0;
        return Math.min(100, Math.max(0, Math.round(number)));
    }

    updateWeightDisplay(examPercent) {
        const safeExamPercent = this.clampPercentage(examPercent);
        const continuousPercent = 100 - safeExamPercent;
        document.getElementById('exam-weight').value = safeExamPercent;
        document.getElementById('continuous-weight').value = continuousPercent;
        document.getElementById('exam-weight-bar').style.width = `${safeExamPercent}%`;
        document.getElementById('continuous-weight-bar').style.width = `${continuousPercent}%`;
    }

    getWeightPercentages(tpType, examWeight = 60) {
        const exam = this.clampPercentage(examWeight);
        const continuous = 100 - exam;
        return {
            exam: tpType === 'exam' ? 100 : exam,
            td: tpType === 'both' ? continuous / 2 : continuous,
            tp: tpType === 'both' ? continuous / 2 : continuous
        };
    }

    formatPercentage(value) {
        return Number.isInteger(value) ? value : value.toFixed(1);
    }

    handleSubjectInput(value) {
        const list = document.getElementById('suggestions-list');
        if (!list) return;

        if (!DEFAULT_SUBJECTS[this.currentYear] || !DEFAULT_SUBJECTS[this.currentYear][`s${this.currentSemester}`]) {
            list.innerHTML = '';
            list.classList.remove('active');
            return;
        }

        const subjects = DEFAULT_SUBJECTS[this.currentYear][`s${this.currentSemester}`];
        const filtered = value
            ? subjects.filter(s => s.name.toLowerCase().includes(value.toLowerCase()))
            : subjects;

        if (filtered.length === 0) {
            list.classList.remove('active');
            return;
        }

        this.renderSuggestions(filtered);
    }

    renderSuggestions(subjects) {
        const list = document.getElementById('suggestions-list');
        list.innerHTML = '';

        subjects.forEach(subject => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';
            li.textContent = subject.name;
            li.addEventListener('click', (e) => {
                // Stop propagation so the outside click listener doesn't immediately close it
                e.stopPropagation();
                this.selectSuggestion(subject);
            });
            list.appendChild(li);
        });

        list.classList.add('active');
    }

    selectSuggestion(subject) {
        document.getElementById('subject-name').value = subject.name;
        document.getElementById('subject-coef').value = subject.coefficient;

        if (subject.tpType) {
            const radio = document.querySelector(`input[name="tp-type"][value="${subject.tpType}"]`);
            if (radio) {
                radio.checked = true;
                this.updateFormVisibility(subject.tpType);
            }
        }

        const list = document.getElementById('suggestions-list');
        if (list) list.classList.remove('active');
    }

    updateFormVisibility(tpType) {
        const tdGroup = document.getElementById('td-group');
        const tpGroup = document.getElementById('tp-group');
        const examLabel = document.getElementById('exam-label');
        const tdLabel = document.querySelector('label[for="td-grade"]');
        const tpLabel = document.querySelector('label[for="tp-grade"]');

        // Reset display
        tdGroup.style.display = 'flex';
        tpGroup.style.display = 'flex';

        const weights = this.getWeightPercentages(
            tpType,
            document.getElementById('exam-weight').value
        );

        switch (tpType) {
            case 'both':
                examLabel.textContent = `Note Examen (${this.formatPercentage(weights.exam)}%)`;
                tdLabel.textContent = `Note TD (${this.formatPercentage(weights.td)}%)`;
                tpLabel.textContent = `Note TP (${this.formatPercentage(weights.tp)}%)`;
                break;
            case 'td':
                tpGroup.style.display = 'none';
                examLabel.textContent = `Note Examen (${this.formatPercentage(weights.exam)}%)`;
                tdLabel.textContent = `Note TD (${this.formatPercentage(weights.td)}%)`;
                break;
            case 'tp':
                tdGroup.style.display = 'none';
                examLabel.textContent = `Note Examen (${this.formatPercentage(weights.exam)}%)`;
                tpLabel.textContent = `Note TP (${this.formatPercentage(weights.tp)}%)`;
                break;
            case 'exam':
                tdGroup.style.display = 'none';
                tpGroup.style.display = 'none';
                examLabel.textContent = 'Note Examen (100%)';
                break;
        }
    }

    handleFormSubmit() {
        if (this.isEditing) {
            this.updateSubject();
        } else {
            this.addSubject();
        }
    }

    resetForm() {
        document.getElementById('subject-form').reset();
        this.isEditing = false;
        this.editingId = null;

        // Reset UI elements
        document.getElementById('submit-btn-text').textContent = 'Ajouter la matière';
        document.querySelector('#submit-btn span').textContent = '➕';
        document.getElementById('cancel-edit-btn').style.display = 'none';

        // Reset type to default
        document.querySelector('input[name="tp-type"][value="both"]').checked = true;
        this.updateWeightDisplay(60);
        this.updateFormVisibility('both');
    }

    addSubject() {
        const subject = this.getSubjectFromForm();
        if (!subject) return;

        subject.id = Date.now();

        // Add to current semester
        const semesterKey = `s${this.currentSemester}`;
        this.data.years[this.currentYear][semesterKey].push(subject);

        this.resetForm();
        this.updateUI();
        this.saveData();

        this.share.showNotification('✓ Matière ajoutée avec succès!', 'success');
    }

    updateSubject() {
        const subject = this.getSubjectFromForm();
        if (!subject) return;

        subject.id = this.editingId;

        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];
        const index = subjects.findIndex(s => s.id === this.editingId);

        if (index !== -1) {
            subjects[index] = subject;

            this.resetForm();
            this.updateUI();
            this.saveData();

            this.share.showNotification('✓ Matière modifiée avec succès!', 'success');
        }
    }

    getSubjectFromForm() {
        const name = document.getElementById('subject-name').value.trim();
        const coefficient = parseFloat(document.getElementById('subject-coef').value);
        const exam = parseFloat(document.getElementById('exam-grade').value) || 0;
        const td = parseFloat(document.getElementById('td-grade').value) || 0;
        const tp = parseFloat(document.getElementById('tp-grade').value) || 0;
        const tpType = document.querySelector('input[name="tp-type"]:checked').value;
        const examWeight = this.clampPercentage(document.getElementById('exam-weight').value);

        if (!name) {
            this.share.showNotification('Veuillez entrer le nom de la matière', 'error');
            return null;
        }

        if (!this.calculator.isValidCoefficient(coefficient)) {
            this.share.showNotification('Coefficient invalide (1-10)', 'error');
            return null;
        }

        return { name, coefficient, exam, td, tp, tpType, examWeight };
    }

    editSubject(subjectId) {
        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];
        const subject = subjects.find(s => s.id === subjectId);

        if (!subject) return;

        // Enter edit mode
        this.isEditing = true;
        this.editingId = subjectId;

        // Populate form
        document.getElementById('subject-name').value = subject.name;
        document.getElementById('subject-coef').value = subject.coefficient;
        document.getElementById('exam-grade').value = subject.exam || '';
        document.getElementById('td-grade').value = subject.td || '';
        document.getElementById('tp-grade').value = subject.tp || '';
        this.updateWeightDisplay(subject.examWeight ?? 60);

        // Select Radio
        const radio = document.querySelector(`input[name="tp-type"][value="${subject.tpType || 'both'}"]`);
        if (radio) {
            radio.checked = true;
            this.updateFormVisibility(subject.tpType || 'both');
        }

        // Change button text
        document.getElementById('submit-btn-text').textContent = 'Modifier';
        document.querySelector('#submit-btn span').textContent = '✏️';
        document.getElementById('cancel-edit-btn').style.display = 'inline-flex';

        // Scroll to form
        document.querySelector('.subject-section').scrollIntoView({ behavior: 'smooth' });
    }

    deleteSubject(subjectId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) {
            const semesterKey = `s${this.currentSemester}`;
            const subjects = this.data.years[this.currentYear][semesterKey];

            const index = subjects.findIndex(s => s.id === subjectId);
            if (index !== -1) {
                subjects.splice(index, 1);
                this.updateUI();
                this.saveData();
                this.share.showNotification('✓ Matière supprimée', 'success');

                // If we were editing this subject, cancel edit
                if (this.isEditing && this.editingId === subjectId) {
                    this.resetForm();
                }
            }
        }
    }

    updateUI() {
        this.updateSemesterLabels();
        this.renderSubjects();
        this.renderResults();
    }

    updateSemesterLabels() {
        const startSemester = (this.currentYear - 1) * 2 + 1;
        const buttons = document.querySelectorAll('.btn-semester');

        if (buttons[0]) buttons[0].textContent = `S${startSemester}`;
        if (buttons[1]) buttons[1].textContent = `S${startSemester + 1}`;
    }

    renderSubjects() {
        const container = document.getElementById('subjects-container');
        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];

        if (!subjects || subjects.length === 0) {
            container.innerHTML = `
        <div class="empty-state">
          <p>Aucune matière ajoutée pour ce semestre</p>
        </div>
      `;
            return;
        }

        container.innerHTML = subjects.map(subject => {
            const grade = this.calculator.calculateSubjectGrade(subject);
            const weights = this.getWeightPercentages(subject.tpType, subject.examWeight);

            let detailsHtml = `
                    <div class="grade-item">
                        <div class="grade-label">Examen (${this.formatPercentage(weights.exam)}%)</div>
                         <div class="grade-value">${subject.exam.toFixed(2)}</div>
                     </div>`;

            if (subject.tpType === 'both' || subject.tpType === 'td') {
                detailsHtml += `
                    <div class="grade-item">
                        <div class="grade-label">TD (${this.formatPercentage(weights.td)}%)</div>
                         <div class="grade-value">${(subject.td || 0).toFixed(2)}</div>
                     </div>`;
            }

            if (subject.tpType === 'both' || subject.tpType === 'tp') {
                detailsHtml += `
                    <div class="grade-item">
                        <div class="grade-label">TP (${this.formatPercentage(weights.tp)}%)</div>
                         <div class="grade-value">${(subject.tp || 0).toFixed(2)}</div>
                     </div>`;
            }

            return `
        <div class="subject-card">
          <div class="subject-header">
            <div class="subject-title">${subject.name}</div>
            <div class="subject-coef">Coef ${subject.coefficient}</div>
          </div>
          
          <div class="subject-grades">
            ${detailsHtml}
          </div>
          
          <div class="subject-average">
            <div class="subject-average-label">Moyenne de la matière</div>
            <div class="subject-average-value">${grade.toFixed(2)}/20</div>
          </div>
          
          <div class="subject-actions">
            <button class="btn-icon edit" onclick="window.ui.editSubject(${subject.id})" title="Modifier">
              ✏️
            </button>
            <button class="btn-icon delete" onclick="window.ui.deleteSubject(${subject.id})" title="Supprimer">
              🗑️
            </button>
          </div>
        </div>
      `;
        }).join('');
    }

    renderResults() {
        const resultsSection = document.getElementById('results-section');
        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];

        if (!subjects || subjects.length === 0) {
            resultsSection.style.display = 'none';
            return;
        }

        resultsSection.style.display = 'block';

        // Calculate semester average
        const semesterAvg = this.calculator.calculateSemesterAverage(subjects);
        document.getElementById('semester-avg').textContent = `${semesterAvg.toFixed(2)}/20`;

        // Calculate year average if both semesters have data
        const s1Subjects = this.data.years[this.currentYear].s1;
        const s2Subjects = this.data.years[this.currentYear].s2;

        let yearAvg = 0;
        let statusObj = null;

        if (s1Subjects.length > 0 && s2Subjects.length > 0) {
            const s1Avg = this.calculator.calculateSemesterAverage(s1Subjects);
            const s2Avg = this.calculator.calculateSemesterAverage(s2Subjects);
            yearAvg = this.calculator.calculateYearAverage(s1Avg, s2Avg);
            statusObj = this.calculator.getYearStatus(yearAvg);

            document.getElementById('year-avg').textContent = `${yearAvg.toFixed(2)}/20`;

            const statusEl = document.getElementById('status');
            statusEl.textContent = statusObj.message;
            statusEl.className = `result-status ${statusObj.class}`;
        } else {
            document.getElementById('year-avg').textContent = '--';

            const statusEl = document.getElementById('status');
            statusEl.textContent = 'Complétez les deux semestres';
            statusEl.className = 'result-status warning';
        }
    }

    exportData() {
        const filename = `m3dl_byryuu_annee${this.currentYear}_${new Date().toISOString().split('T')[0]}.json`;
        const success = this.storage.exportToJSON(this.data, filename);

        if (success) {
            this.share.showNotification('✓ Données exportées avec succès!', 'success');
        } else {
            this.share.showNotification('✗ Erreur lors de l\'exportation', 'error');
        }
    }

    async importData(file) {
        try {
            const data = await this.storage.importFromJSON(file);

            if (!this.storage.validateData(data)) {
                this.share.showNotification('✗ Fichier invalide', 'error');
                return;
            }

            this.data = this.storage.migrateData(data);
            this.currentYear = data.currentYear || 1;
            this.currentSemester = data.currentSemester || 1;

            // Update year selector
            document.getElementById('year-select').value = this.currentYear;

            // Update semester buttons
            document.querySelectorAll('.btn-semester').forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.semester) === this.currentSemester);
            });

            this.updateUI();
            this.saveData();

            this.share.showNotification('✓ Données importées avec succès!', 'success');
        } catch (error) {
            this.share.showNotification(`✗ ${error.message}`, 'error');
        }

        // Reset file input
        document.getElementById('file-input').value = '';
    }

    shareResults() {
        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];

        if (!subjects || subjects.length === 0) {
            this.share.showNotification('Aucune donnée à partager', 'warning');
            return;
        }

        const semesterAvg = this.calculator.calculateSemesterAverage(subjects);

        const s1Subjects = this.data.years[this.currentYear].s1;
        const s2Subjects = this.data.years[this.currentYear].s2;

        let yearAvg = null;
        let status = null;

        if (s1Subjects.length > 0 && s2Subjects.length > 0) {
            const s1Avg = this.calculator.calculateSemesterAverage(s1Subjects);
            const s2Avg = this.calculator.calculateSemesterAverage(s2Subjects);
            yearAvg = this.calculator.calculateYearAverage(s1Avg, s2Avg);
            const statusObj = this.calculator.getYearStatus(yearAvg);
            status = statusObj.message;
        }

        const results = {
            year: this.currentYear,
            semester: this.currentSemester,
            semesterAvg: semesterAvg.toFixed(2),
            yearAvg: yearAvg ? yearAvg.toFixed(2) : null,
            status: status
        };

        this.share.showShareOptions(results);
    }
}
