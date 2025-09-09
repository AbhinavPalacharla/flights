/**
 * Bright Data integration for flight search
 * Provides a fallback method when regular requests fail
 */

import { HttpClient, HttpResponse } from './http-client';

export interface BrightDataOptions {
  apiUrl?: string;
  apiKey?: string;
  zone?: string;
}

export class BrightDataClient {
  private client: HttpClient;
  private apiUrl: string;
  private apiKey: string;
  private zone: string;

  constructor(options: BrightDataOptions = {}) {
    this.client = new HttpClient();
    this.apiUrl = options.apiUrl || process.env.BRIGHT_DATA_API_URL || 'https://api.brightdata.com/request';
    this.apiKey = options.apiKey || process.env.BRIGHT_DATA_API_KEY || '';
    this.zone = options.zone || process.env.BRIGHT_DATA_SERP_ZONE || 'serp_api1';

    if (!this.apiKey) {
      throw new Error('BRIGHT_DATA_API_KEY environment variable is required');
    }
  }

  async fetchFlights(params: Record<string, string>): Promise<HttpResponse> {
    // Construct Google Flights URL
    const url = "https://www.google.com/travel/flights?" + 
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

    try {
      const response = await this.client.post(
        this.apiUrl,
        {
          url: url,
          zone: this.zone
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.statusCode !== 200) {
        throw new Error(`${response.statusCode} Result: ${response.text}`);
      }

      return response;
    } catch (error) {
      throw new Error(`Bright Data request failed: ${error}`);
    }
  }
}

export async function brightDataFetch(params: Record<string, string>): Promise<HttpResponse> {
  const client = new BrightDataClient();
  return client.fetchFlights(params);
}