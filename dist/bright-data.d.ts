/**
 * Bright Data integration for flight search
 * Provides a fallback method when regular requests fail
 */
import { HttpResponse } from './http-client';
export interface BrightDataOptions {
    apiUrl?: string;
    apiKey?: string;
    zone?: string;
}
export declare class BrightDataClient {
    private client;
    private apiUrl;
    private apiKey;
    private zone;
    constructor(options?: BrightDataOptions);
    fetchFlights(params: Record<string, string>): Promise<HttpResponse>;
}
export declare function brightDataFetch(params: Record<string, string>): Promise<HttpResponse>;
//# sourceMappingURL=bright-data.d.ts.map