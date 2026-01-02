const axios = require('axios');
const { logInfo, logError } = require('./logger.service.js');

class TurnstileService {
    constructor() {
        this.secretKey = process.env.TURNSTILE_SECRET_KEY;
        this.verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        this.isEnabled = process.env.ENABLE_TURNSTILE !== 'false';
    }

    async verifyToken(token) {
        // Skip validation if Turnstile is disabled
        if (!this.isEnabled) {
            logInfo('TurnstileService', 'Turnstile validation is disabled');
            return true;
        }

        try {
            logInfo('TurnstileService', 'Verifying Turnstile token');
            
            const formData = new URLSearchParams();
            formData.append('secret', this.secretKey);
            formData.append('response', token);

            const response = await axios.post(this.verifyUrl, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const { success, challenge_ts, hostname, error_codes } = response.data;

            if (!success) {
                logError('TurnstileService', `Validation failed: ${error_codes?.join(', ')}`);
                throw new Error('Turnstile validation failed');
            }

            logInfo('TurnstileService', 'Token verified successfully');
            return true;
        } catch (error) {
            logError('TurnstileService', `Error verifying token: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new TurnstileService(); 