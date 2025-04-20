const logger = require('./logger');

class ConfigValidator {
    constructor() {
        this.requiredVars = {
            TARGET_URL: this.validateUrl,
            OPENAI_API_KEY: this.validateOpenAIKey,
            SMTP_HOST: this.validateHost,
            SMTP_PORT: this.validatePort,
            SMTP_USER: this.validateEmail,
            SMTP_PASS: this.validateString,
            EMAIL_FROM: this.validateEmail,
            EMAIL_TO: this.validateEmail
        };

        this.optionalVars = {
            REPORT_TIME: this.validateTime,
            MAX_PAGES: this.validatePositiveInteger,
            ENABLE_IMAGE_CHECKS: this.validateBoolean,
            ENABLE_SLACK_ALERTS: this.validateBoolean,
            ENABLE_EMAIL_REPORTS: this.validateBoolean,
            TIMEZONE: this.validateTimezone
        };
    }

    validateUrl(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    validateOpenAIKey(value) {
        return value && value.startsWith('sk-') && value.length > 20;
    }

    validateHost(value) {
        return value && value.length > 0;
    }

    validatePort(value) {
        const port = parseInt(value);
        return !isNaN(port) && port > 0 && port <= 65535;
    }

    validateEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    validateString(value) {
        return value && value.length > 0;
    }

    validateTime(value) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
    }

    validatePositiveInteger(value) {
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
    }

    validateBoolean(value) {
        return value === 'true' || value === 'false';
    }

    validateTimezone(value) {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: value });
            return true;
        } catch {
            return false;
        }
    }

    validate() {
        const errors = [];
        const warnings = [];

        // Check required variables
        for (const [key, validator] of Object.entries(this.requiredVars)) {
            const value = process.env[key];
            if (!value) {
                errors.push(`Missing required environment variable: ${key}`);
            } else if (!validator(value)) {
                errors.push(`Invalid value for ${key}: ${value}`);
            }
        }

        // Check optional variables
        for (const [key, validator] of Object.entries(this.optionalVars)) {
            const value = process.env[key];
            if (value && !validator(value)) {
                warnings.push(`Invalid value for optional variable ${key}: ${value}`);
            }
        }

        // Log results
        if (errors.length > 0) {
            logger.error('Configuration validation failed:', { errors });
            throw new Error('Configuration validation failed. Check logs for details.');
        }

        if (warnings.length > 0) {
            logger.warn('Configuration validation warnings:', { warnings });
        }

        logger.info('Configuration validation successful');
        return true;
    }
}

module.exports = new ConfigValidator(); 