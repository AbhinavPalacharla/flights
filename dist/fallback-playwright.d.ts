/**
 * Fallback Playwright integration using try.playwright.tech service
 * Provides a fallback method when local Playwright is not available
 */
import { HttpResponse } from './http-client';
export declare class FallbackPlaywrightClient {
    private client;
    constructor();
    fetchFlights(params: Record<string, string>): Promise<HttpResponse>;
}
export declare function fallbackPlaywrightFetch(params: Record<string, string>): Promise<HttpResponse>;
//# sourceMappingURL=fallback-playwright.d.ts.map