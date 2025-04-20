const { DateTime } = require('luxon');

/**
 * Get current time in Sydney timezone
 * @returns {DateTime} Current time in Sydney
 */
function getSydneyTime() {
    return DateTime.now().setZone('Australia/Sydney');
}

/**
 * Format date for filenames
 * @param {DateTime} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForFile(date) {
    return date.toFormat('yyyy-MM-dd');
}

/**
 * Format date for display
 * @param {DateTime} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateForDisplay(date) {
    return date.toFormat('dd MMM yyyy HH:mm');
}

/**
 * Check if it's time to run the daily report (9:00 AM Sydney time)
 * @returns {boolean} True if it's time to run
 */
function isTimeForDailyReport() {
    const now = getSydneyTime();
    return now.hour === 9 && now.minute === 0;
}

module.exports = {
    getSydneyTime,
    formatDateForFile,
    formatDateForDisplay,
    isTimeForDailyReport
}; 