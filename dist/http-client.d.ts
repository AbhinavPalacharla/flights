/**
 * HTTP client for making requests with proper error handling and response formatting
 * Equivalent to the primp library used in Python
 */
import { AxiosResponse, AxiosRequestConfig } from 'axios';
export interface HttpClientOptions {
    verify?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
}
export declare class HttpClient {
    private options;
    constructor(options?: HttpClientOptions);
    get(url: string, config?: AxiosRequestConfig): Promise<HttpResponse>;
    post(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse>;
}
export declare class HttpResponse {
    readonly statusCode: number;
    readonly text: string;
    readonly data: any;
    readonly headers: Record<string, string>;
    constructor(response: AxiosResponse);
    get text_markdown(): string;
}
export declare const client: HttpClient;
//# sourceMappingURL=http-client.d.ts.map