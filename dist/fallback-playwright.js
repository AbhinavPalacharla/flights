"use strict";
/**
 * Fallback Playwright integration using try.playwright.tech service
 * Provides a fallback method when local Playwright is not available
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackPlaywrightClient = void 0;
exports.fallbackPlaywrightFetch = fallbackPlaywrightFetch;
const http_client_1 = require("./http-client");
const PLAYWRIGHT_CODE = `import asyncio
import sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto("%s")
        locator = page.locator('.eQ35Ce')
        await locator.wait_for()
        body = await page.evaluate(
            """() => {
                return document.querySelector('[role="main"]').innerHTML
            }"""
        )
        await browser.close()
    sys.stdout.write(body)

asyncio.run(main())`;
class FallbackPlaywrightClient {
    constructor() {
        this.client = new http_client_1.HttpClient({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });
    }
    async fetchFlights(params) {
        const url = "https://www.google.com/travel/flights?" +
            Object.entries(params)
                .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
                .join('&');
        const code = PLAYWRIGHT_CODE.replace('%s', url);
        try {
            const response = await this.client.post('https://try.playwright.tech/service/control/run', {
                code: code,
                language: 'python'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.statusCode !== 200) {
                throw new Error(`${response.statusCode} Result: ${response.text}`);
            }
            // Parse the JSON response
            let result;
            try {
                result = JSON.parse(response.text);
            }
            catch (parseError) {
                throw new Error(`Failed to parse Playwright response: ${parseError}`);
            }
            if (!result.output) {
                throw new Error('No output received from Playwright service');
            }
            return new http_client_1.HttpResponse({
                status: 200,
                statusText: 'OK',
                data: result.output,
                headers: {},
                config: {}
            });
        }
        catch (error) {
            throw new Error(`Fallback Playwright request failed: ${error}`);
        }
    }
}
exports.FallbackPlaywrightClient = FallbackPlaywrightClient;
async function fallbackPlaywrightFetch(params) {
    const client = new FallbackPlaywrightClient();
    return client.fetchFlights(params);
}
//# sourceMappingURL=fallback-playwright.js.map