/**
 * Share Module
 * Handles sharing functionality for results
 */

export class Share {
    /**
     * Generate shareable text from results
     * @param {Object} results - Results data
     * @returns {string} - Formatted text
     */
    generateShareText(results) {
        const { year, semester, semesterAvg, yearAvg, status } = results;

        let text = `📊 Mes résultats M3DL\n\n`;
        text += `🎓 Année ${year} - Semestre ${semester}\n`;
        text += `📈 Moyenne du semestre: ${semesterAvg}/20\n`;

        if (yearAvg) {
            text += `📊 Moyenne annuelle: ${yearAvg}/20\n`;
            text += `✅ Statut: ${status}\n`;
        }

        text += `\n🔗 Calculez vos notes sur M3DL`;

        return text;
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                return success;
            }
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            return false;
        }
    }

    /**
     * Share via Web Share API (mobile)
     * @param {Object} results - Results data
     * @returns {Promise<boolean>} - Success status
     */
    async shareNative(results) {
        if (!navigator.share) {
            return false;
        }

        try {
            const text = this.generateShareText(results);
            await navigator.share({
                title: 'Mes résultats M3DL',
                text: text
            });
            return true;
        } catch (error) {
            // User cancelled or error occurred
            console.error('Error sharing:', error);
            return false;
        }
    }

    /**
     * Generate shareable URL with encoded data
     * @param {Object} results - Results data
     * @returns {string} - Shareable URL
     */
    generateShareURL(results) {
        const baseURL = window.location.origin + window.location.pathname;
        const data = btoa(JSON.stringify({
            y: results.year,
            s: results.semester,
            sa: results.semesterAvg,
            ya: results.yearAvg
        }));
        return `${baseURL}?share=${data}`;
    }

    /**
     * Parse shared URL data
     * @param {string} url - URL to parse
     * @returns {Object|null} - Parsed data or null
     */
    parseShareURL(url) {
        try {
            const urlObj = new URL(url);
            const shareParam = urlObj.searchParams.get('share');
            if (!shareParam) return null;

            const decoded = atob(shareParam);
            const data = JSON.parse(decoded);

            return {
                year: data.y,
                semester: data.s,
                semesterAvg: data.sa,
                yearAvg: data.ya
            };
        } catch (error) {
            console.error('Error parsing share URL:', error);
            return null;
        }
    }

    /**
     * Show share modal/notification
     * @param {Object} results - Results data
     */
    async showShareOptions(results) {
        // Try native share first (mobile)
        if (navigator.share) {
            const shared = await this.shareNative(results);
            if (shared) return true;
        }

        // Fallback to copy to clipboard
        const text = this.generateShareText(results);
        const copied = await this.copyToClipboard(text);

        if (copied) {
            this.showNotification('✓ Résultats copiés dans le presse-papiers!', 'success');
            return true;
        } else {
            this.showNotification('✗ Erreur lors de la copie', 'error');
            return false;
        }
    }

    /**
     * Show notification toast
     * @param {string} message - Message to display
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' :
                type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
                    'rgba(59, 130, 246, 0.9)'};
      color: white;
      border-radius: 0.75rem;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add notification animations to document
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);
}
