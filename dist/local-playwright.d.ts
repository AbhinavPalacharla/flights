/**
 * Local Playwright integration for flight search
 * Provides a fallback method using local browser automation
 */
import { HttpResponse } from './http-client';
export declare class LocalPlaywrightClient {
    private browser;
    fetchFlights(params: Record<string, string>): Promise<HttpResponse>;
    close(): Promise<void>;
}
export declare function localPlaywrightFetch(params: Record<string, string>): Promise<HttpResponse>;
//# sourceMappingURL=local-playwright.d.ts.map