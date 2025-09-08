"use strict";
/**
 * HTTP client for making requests with proper error handling and response formatting
 * Equivalent to the primp library used in Python
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.HttpResponse = exports.HttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
class HttpClient {
    constructor(options = {}) {
        this.options = {
            verify: true,
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            ...options
        };
    }
    async get(url, config = {}) {
        try {
            const response = await axios_1.default.get(url, {
                ...config,
                timeout: this.options.timeout,
                headers: { ...this.options.headers, ...config.headers },
                validateStatus: () => true // Don't throw on any status code
            });
            return new HttpResponse(response);
        }
        catch (error) {
            throw new Error(`HTTP GET request failed: ${error}`);
        }
    }
    async post(url, data, config = {}) {
        try {
            const response = await axios_1.default.post(url, data, {
                ...config,
                timeout: this.options.timeout,
                headers: { ...this.options.headers, ...config.headers },
                validateStatus: () => true // Don't throw on any status code
            });
            return new HttpResponse(response);
        }
        catch (error) {
            throw new Error(`HTTP POST request failed: ${error}`);
        }
    }
}
exports.HttpClient = HttpClient;
class HttpResponse {
    constructor(response) {
        this.statusCode = response.status;
        this.text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        this.data = response.data;
        this.headers = response.headers;
    }
    get text_markdown() {
        return this.text;
    }
}
exports.HttpResponse = HttpResponse;
// Default client instance
exports.client = new HttpClient();
//# sourceMappingURL=http-client.js.map