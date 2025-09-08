/**
 * Local Playwright integration for flight search
 * Provides a fallback method using local browser automation
 */

import { chromium, Browser, Page } from 'playwright';
import { HttpResponse } from './http-client';

export class LocalPlaywrightClient {
  private browser: Browser | null = null;

  async fetchFlights(params: Record<string, string>): Promise<HttpResponse> {
    const url = "https://www.google.com/travel/flights?" + 
      Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');

    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      }

      const page = await this.browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      });
      
      // Navigate to the URL
      await page.goto(url, { waitUntil: 'networkidle' });

      // Handle consent dialog if present
      try {
        const consentButton = page.locator('text="Accept all"');
        if (await consentButton.isVisible({ timeout: 5000 })) {
          await consentButton.click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        // Consent dialog not found or already handled, continue
      }

      // Wait for the main content to load
      try {
        await page.locator('.eQ35Ce').waitFor({ timeout: 10000 });
      } catch (error) {
        // Fallback: wait for any content
        await page.waitForTimeout(3000);
      }

      // Extract the main content
      const body = await page.evaluate(() => {
        const mainElement = (document as any).querySelector('[role="main"]');
        return mainElement ? mainElement.innerHTML : (document as any).body.innerHTML;
      });

      await page.close();

      return new HttpResponse({
        status: 200,
        statusText: 'OK',
        data: body,
        headers: {},
        config: {} as any
      });
    } catch (error) {
      throw new Error(`Local Playwright request failed: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export async function localPlaywrightFetch(params: Record<string, string>): Promise<HttpResponse> {
  const client = new LocalPlaywrightClient();
  try {
    return await client.fetchFlights(params);
  } finally {
    await client.close();
  }
}