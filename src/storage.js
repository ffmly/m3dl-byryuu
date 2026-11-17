/**
 * Storage Module
 * Handles data persistence (localStorage, JSON export/import)
 */

export class Storage {
    constructor() {
        this.STORAGE_KEY = 'm3dl_data';
    }

    /**
     * Save data to localStorage
     * @param {Object} data - Data to save
     */
    saveToLocalStorage(data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(this.STORAGE_KEY, jsonData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @returns {Object|null} - Loaded data or null
     */
    loadFromLocalStorage() {
        try {
            const jsonData = localStorage.getItem(this.STORAGE_KEY);
            if (!jsonData) return null;
            return JSON.parse(jsonData);
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }

    /**
     * Export data as JSON file
     * @param {Object} data - Data to export
     * @param {string} filename - Filename for download
     */
    exportToJSON(data, filename = 'm3dl_grades.json') {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            return false;
        }
    }

    /**
     * Import data from JSON file
     * @param {File} file - File object to import
     * @returns {Promise<Object>} - Imported data
     */
    importFromJSON(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            if (file.type !== 'application/json') {
                reject(new Error('Invalid file type. Please select a JSON file.'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Invalid JSON file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };

            reader.readAsText(file);
        });
    }

    /**
     * Clear all stored data
     */
    clearStorage() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Create initial data structure
     * @returns {Object} - Empty data structure
     */
    createEmptyData() {
        return {
            currentYear: 1,
            currentSemester: 1,
            years: {
                1: { s1: [], s2: [] },
                2: { s1: [], s2: [] },
                3: { s1: [], s2: [] },
                4: { s1: [], s2: [] },
                5: { s1: [], s2: [] }
            },
            settings: {
                passingGrade: 10,
                autoSave: true,
                examWeight: 60
            },
            lastModified: new Date().toISOString()
        };
    }

    /**
     * Validate imported data structure
     * @param {Object} data - Data to validate
     * @returns {boolean} - True if valid
     */
    validateData(data) {
        if (!data || typeof data !== 'object') return false;

        // Check required fields
        if (!data.years || typeof data.years !== 'object') return false;

        // Check year structure
        for (let year = 1; year <= 5; year++) {
            if (!data.years[year]) return false;
            if (!Array.isArray(data.years[year].s1)) return false;
            if (!Array.isArray(data.years[year].s2)) return false;
        }

        return true;
    }

    /**
     * Migrate old data format to new format (if needed)
     * @param {Object} data - Data to migrate
     * @returns {Object} - Migrated data
     */
    migrateData(data) {
        // Add migration logic here if data format changes in future
        // For now, just ensure all required fields exist
        const migrated = { ...data };

        if (!migrated.settings) {
            migrated.settings = {
                passingGrade: 10,
                autoSave: true,
                examWeight: 60
            };
        }

        if (typeof migrated.settings.examWeight !== 'number') {
            migrated.settings.examWeight = 60;
        }

        if (!migrated.lastModified) {
            migrated.lastModified = new Date().toISOString();
        }

        return migrated;
    }
}
