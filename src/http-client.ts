/**
 * HTTP client for making requests with proper error handling and response formatting
 * Equivalent to the primp library used in Python
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

export interface HttpClientOptions {
  verify?: boolean;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private options: HttpClientOptions;

  constructor(options: HttpClientOptions = {}) {
    this.options = {
      verify: true,
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      },
      ...options
    };
  }

  async get(url: string, config: AxiosRequestConfig = {}): Promise<HttpResponse> {
    try {
      const response = await axios.get(url, {
        ...config,
        timeout: this.options.timeout,
        headers: { ...this.options.headers, ...config.headers },
        validateStatus: () => true // Don't throw on any status code
      });

      return new HttpResponse(response);
    } catch (error) {
      throw new Error(`HTTP GET request failed: ${error}`);
    }
  }

  async post(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<HttpResponse> {
    try {
      const response = await axios.post(url, data, {
        ...config,
        timeout: this.options.timeout,
        headers: { ...this.options.headers, ...config.headers },
        validateStatus: () => true // Don't throw on any status code
      });

      return new HttpResponse(response);
    } catch (error) {
      throw new Error(`HTTP POST request failed: ${error}`);
    }
  }
}

export class HttpResponse {
  public readonly statusCode: number;
  public readonly text: string;
  public readonly data: any;
  public readonly headers: Record<string, string>;

  constructor(response: AxiosResponse) {
    this.statusCode = response.status;
    this.text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    this.data = response.data;
    this.headers = response.headers as Record<string, string>;
  }

  get text_markdown(): string {
    return this.text;
  }
}

// Default client instance
export const client = new HttpClient();