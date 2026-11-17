/**
 * Grade Calculator Engine
 * Handles all grade calculations for Algerian university system
 */

export class Calculator {
    constructor() {
        this.PASSING_GRADE = 10; // Default passing grade
    }

    /**
     * Calculate subject grade based on exam, TD, and TP scores
     * @param {Object} subject - Subject data
     * @returns {number} - Calculated subject average
     */
    calculateSubjectGrade(subject) {
        const { exam, td, tp, tpType } = subject;

        let grade = 0;
        let examScore = parseFloat(exam) || 0;
        let tdScore = parseFloat(td) || 0;
        let tpScore = parseFloat(tp) || 0;
        const requestedExamPercent = Number(subject.examWeight ?? 60);
        const examPercent = Number.isFinite(requestedExamPercent)
            ? Math.min(100, Math.max(0, requestedExamPercent))
            : 60;
        const examWeight = examPercent / 100;
        const continuousWeight = 1 - examWeight;

        grade += examScore * examWeight;

        // Handle different TD/TP configurations
        switch (tpType) {
            case 'both':
                // Both TD and TP: share the continuous-assessment weight equally
                grade += tdScore * (continuousWeight / 2);
                grade += tpScore * (continuousWeight / 2);
                break;

            case 'td':
                // TD only: use the full continuous-assessment weight
                grade += tdScore * continuousWeight;
                break;

            case 'tp':
                // TP only: use the full continuous-assessment weight
                grade += tpScore * continuousWeight;
                break;

            case 'exam':
                // Exam only: 100%
                // Reset previously added 60% and use 100%
                grade = examScore * 1.0;
                break;
        }

        return Math.round(grade * 100) / 100; // Round to 2 decimals
    }

    /**
     * Calculate semester average with coefficient weighting
     * @param {Array} subjects - Array of subjects with grades and coefficients
     * @returns {number} - Weighted semester average
     */
    calculateSemesterAverage(subjects) {
        if (!subjects || subjects.length === 0) {
            return 0;
        }

        let totalWeightedGrade = 0;
        let totalCoefficients = 0;

        subjects.forEach(subject => {
            const subjectGrade = this.calculateSubjectGrade(subject);
            const coefficient = parseFloat(subject.coefficient) || 1;

            totalWeightedGrade += subjectGrade * coefficient;
            totalCoefficients += coefficient;
        });

        const average = totalCoefficients > 0 ? totalWeightedGrade / totalCoefficients : 0;
        return Math.round(average * 100) / 100;
    }

    /**
     * Calculate year average from S1 and S2
     * @param {number} s1Average - Semester 1 average
     * @param {number} s2Average - Semester 2 average
     * @returns {number} - Year average
     */
    calculateYearAverage(s1Average, s2Average) {
        if (!s1Average && !s2Average) {
            return 0;
        }

        if (!s1Average) return s2Average;
        if (!s2Average) return s1Average;

        const average = (s1Average + s2Average) / 2;
        return Math.round(average * 100) / 100;
    }

    /**
     * Determine if student passes to next year
     * @param {number} yearAverage - Year average
     * @param {number} passingGrade - Minimum passing grade (default 10)
     * @returns {Object} - Status object with pass/fail and message
     */
    getYearStatus(yearAverage, passingGrade = this.PASSING_GRADE) {
        if (!yearAverage) {
            return {
                passed: false,
                status: 'incomplete',
                message: 'Données incomplètes',
                class: 'warning'
            };
        }

        if (yearAverage >= passingGrade) {
            return {
                passed: true,
                status: 'success',
                message: '✓ Admis(e)',
                class: 'success'
            };
        } else if (yearAverage >= passingGrade - 1) {
            return {
                passed: false,
                status: 'rattrapage',
                message: '⚠ Rattrapage',
                class: 'warning'
            };
        } else {
            return {
                passed: false,
                status: 'failed',
                message: '✗ Redoublement',
                class: 'error'
            };
        }
    }

    /**
     * Calculate required average for next semester to pass the year
     * @param {number} currentSemesterAvg - Current semester average
     * @param {number} targetYearAvg - Target year average (default 10)
     * @returns {number} - Required average for next semester
     */
    calculateRequiredAverage(currentSemesterAvg, targetYearAvg = this.PASSING_GRADE) {
        if (!currentSemesterAvg) return targetYearAvg;

        const required = (targetYearAvg * 2) - currentSemesterAvg;
        return Math.max(0, Math.min(20, Math.round(required * 100) / 100));
    }

    /**
     * Validate grade input
     * @param {number} grade - Grade to validate
     * @returns {boolean} - True if valid
     */
    isValidGrade(grade) {
        const num = parseFloat(grade);
        return !isNaN(num) && num >= 0 && num <= 20;
    }

    /**
     * Validate coefficient input
     * @param {number} coefficient - Coefficient to validate
     * @returns {boolean} - True if valid
     */
    isValidCoefficient(coefficient) {
        const num = parseFloat(coefficient);
        return !isNaN(num) && num >= 1 && num <= 10;
    }
}
