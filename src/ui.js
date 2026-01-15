/**
 * UI Manager
 * Handles all UI interactions and updates
 */

import { Calculator } from './calculator.js';
import { Storage } from './storage.js';
import { Share } from './share.js';

export class UI {
    constructor() {
        this.calculator = new Calculator();
        this.storage = new Storage();
        this.share = new Share();

        this.data = null;
        this.currentYear = 1;
        this.currentSemester = 1;

        this.init();
    }

    init() {
        // Load data from localStorage or create new
        this.loadData();

        // Initialize event listeners
        this.initEventListeners();

        // Render initial state
        this.updateUI();
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
            });
        });

        // Subject form
        const subjectForm = document.getElementById('subject-form');
        subjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSubject();
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

        // Share button
        const shareBtn = document.getElementById('share-btn');
        shareBtn.addEventListener('click', () => {
            this.shareResults();
        });
    }

    updateFormVisibility(tpType) {
        const tdGroup = document.getElementById('td-group');
        const tpGroup = document.getElementById('tp-group');

        switch (tpType) {
            case 'both':
                tdGroup.style.display = 'flex';
                tpGroup.style.display = 'flex';
                break;
            case 'td':
                tdGroup.style.display = 'flex';
                tpGroup.style.display = 'none';
                break;
            case 'tp':
                tdGroup.style.display = 'none';
                tpGroup.style.display = 'flex';
                break;
        }
    }

    addSubject() {
        const name = document.getElementById('subject-name').value.trim();
        const coefficient = parseFloat(document.getElementById('subject-coef').value);
        const exam = parseFloat(document.getElementById('exam-grade').value) || 0;
        const td = parseFloat(document.getElementById('td-grade').value) || 0;
        const tp = parseFloat(document.getElementById('tp-grade').value) || 0;
        const tpType = document.querySelector('input[name="tp-type"]:checked').value;

        if (!name) {
            this.share.showNotification('Veuillez entrer le nom de la matière', 'error');
            return;
        }

        if (!this.calculator.isValidCoefficient(coefficient)) {
            this.share.showNotification('Coefficient invalide (1-10)', 'error');
            return;
        }

        const subject = {
            id: Date.now(),
            name,
            coefficient,
            exam,
            td,
            tp,
            tpType
        };

        // Add to current semester
        const semesterKey = `s${this.currentSemester}`;
        this.data.years[this.currentYear][semesterKey].push(subject);

        // Reset form
        document.getElementById('subject-form').reset();

        // Update UI
        this.updateUI();
        this.saveData();

        this.share.showNotification('✓ Matière ajoutée avec succès!', 'success');
    }

    deleteSubject(subjectId) {
        const semesterKey = `s${this.currentSemester}`;
        const subjects = this.data.years[this.currentYear][semesterKey];

        const index = subjects.findIndex(s => s.id === subjectId);
        if (index !== -1) {
            subjects.splice(index, 1);
            this.updateUI();
            this.saveData();
            this.share.showNotification('✓ Matière supprimée', 'success');
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

            return `
        <div class="subject-card">
          <div class="subject-header">
            <div class="subject-title">${subject.name}</div>
            <div class="subject-coef">Coef ${subject.coefficient}</div>
          </div>
          
          <div class="subject-grades">
            <div class="grade-item">
              <div class="grade-label">Examen (60%)</div>
              <div class="grade-value">${subject.exam.toFixed(2)}</div>
            </div>
            ${subject.tpType === 'both' || subject.tpType === 'td' ? `
              <div class="grade-item">
                <div class="grade-label">TD (${subject.tpType === 'both' ? '20%' : '40%'})</div>
                <div class="grade-value">${subject.td.toFixed(2)}</div>
              </div>
            ` : ''}
            ${subject.tpType === 'both' || subject.tpType === 'tp' ? `
              <div class="grade-item">
                <div class="grade-label">TP (${subject.tpType === 'both' ? '20%' : '40%'})</div>
                <div class="grade-value">${subject.tp.toFixed(2)}</div>
              </div>
            ` : ''}
          </div>
          
          <div class="subject-average">
            <div class="subject-average-label">Moyenne de la matière</div>
            <div class="subject-average-value">${grade.toFixed(2)}/20</div>
          </div>
          
          <div class="subject-actions">
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
        const filename = `m3dl_annee${this.currentYear}_${new Date().toISOString().split('T')[0]}.json`;
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
