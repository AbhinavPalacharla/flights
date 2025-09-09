"use strict";
/**
 * Bright Data integration for flight search
 * Provides a fallback method when regular requests fail
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrightDataClient = void 0;
exports.brightDataFetch = brightDataFetch;
const http_client_1 = require("./http-client");
class BrightDataClient {
    constructor(options = {}) {
        this.client = new http_client_1.HttpClient();
        this.apiUrl = options.apiUrl || process.env.BRIGHT_DATA_API_URL || 'https://api.brightdata.com/request';
        this.apiKey = options.apiKey || process.env.BRIGHT_DATA_API_KEY || '';
        this.zone = options.zone || process.env.BRIGHT_DATA_SERP_ZONE || 'serp_api1';
        if (!this.apiKey) {
            throw new Error('BRIGHT_DATA_API_KEY environment variable is required');
        }
    }
    async fetchFlights(params) {
        // Construct Google Flights URL
        const url = "https://www.google.com/travel/flights?" +
            Object.entries(params)
                .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
                .join('&');
        try {
            const response = await this.client.post(this.apiUrl, {
                url: url,
                zone: this.zone
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            if (response.statusCode !== 200) {
                throw new Error(`${response.statusCode} Result: ${response.text}`);
            }
            return response;
        }
        catch (error) {
            throw new Error(`Bright Data request failed: ${error}`);
        }
    }
}
exports.BrightDataClient = BrightDataClient;
async function brightDataFetch(params) {
    const client = new BrightDataClient();
    return client.fetchFlights(params);
}
//# sourceMappingURL=bright-data.js.map