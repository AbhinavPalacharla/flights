/**
 * Tests for Playwright integrations
 */

import { LocalPlaywrightClient, localPlaywrightFetch } from '../local-playwright';
import { FallbackPlaywrightClient, fallbackPlaywrightFetch } from '../fallback-playwright';

// Mock playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn()
  }
}));

// Mock the HTTP client
jest.mock('../http-client', () => ({
  HttpClient: jest.fn().mockImplementation(() => ({
    post: jest.fn()
  })),
  HttpResponse: jest.fn().mockImplementation((response) => ({
    statusCode: response.status,
    text: response.data,
    data: response.data,
    headers: response.headers
  }))
}));

describe('Local Playwright Integration', () => {
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPage = {
      newPage: jest.fn(),
      goto: jest.fn(),
      locator: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
      waitForTimeout: jest.fn()
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn()
    };

    const { chromium } = require('playwright');
    chromium.launch.mockResolvedValue(mockBrowser);
  });

  test('LocalPlaywrightClient should launch browser and fetch flights', async () => {
    mockPage.locator.mockReturnValue({
      isVisible: jest.fn().mockResolvedValue(false),
      waitFor: jest.fn().mockResolvedValue(undefined)
    });
    mockPage.evaluate.mockResolvedValue('<html>Mock flight data</html>');

    const client = new LocalPlaywrightClient();
    const params = { tfs: 'test-data', hl: 'en' };

    const result = await client.fetchFlights(params);

    expect(mockBrowser.newPage).toHaveBeenCalledWith({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    });
    expect(mockPage.goto).toHaveBeenCalledWith(
      'https://www.google.com/travel/flights?tfs=test-data&hl=en',
      { waitUntil: 'networkidle' }
    );
    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('<html>Mock flight data</html>');
  });

  test('LocalPlaywrightClient should handle consent dialog', async () => {
    const mockConsentButton = {
      isVisible: jest.fn().mockResolvedValue(true),
      click: jest.fn().mockResolvedValue(undefined)
    };

    mockPage.locator.mockImplementation((selector: string) => {
      if (selector === 'text="Accept all"') {
        return mockConsentButton;
      }
      return {
        waitFor: jest.fn().mockResolvedValue(undefined)
      };
    });
    mockPage.evaluate.mockResolvedValue('<html>Mock data</html>');

    const client = new LocalPlaywrightClient();
    const params = { tfs: 'test-data' };

    await client.fetchFlights(params);

    expect(mockConsentButton.click).toHaveBeenCalled();
    expect(mockPage.waitForTimeout).toHaveBeenCalledWith(1000);
  });

  test('LocalPlaywrightClient should close browser on close', async () => {
    const client = new LocalPlaywrightClient();
    // Initialize the browser first
    await client.fetchFlights({ tfs: 'test' });
    await client.close();

    expect(mockBrowser.close).toHaveBeenCalled();
  });

  test('localPlaywrightFetch should work as standalone function', async () => {
    mockPage.locator.mockReturnValue({
      isVisible: jest.fn().mockResolvedValue(false),
      waitFor: jest.fn().mockResolvedValue(undefined)
    });
    mockPage.evaluate.mockResolvedValue('<html>Mock data</html>');

    const params = { tfs: 'test-data' };
    const result = await localPlaywrightFetch(params);

    expect(result.statusCode).toBe(200);
    expect(mockBrowser.close).toHaveBeenCalled();
  });
});

describe('Fallback Playwright Integration', () => {
  let mockClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      post: jest.fn()
    };
    (require('../http-client').HttpClient as jest.Mock).mockImplementation(() => mockClient);
  });

  test('FallbackPlaywrightClient should make correct API call', async () => {
    const mockResponse = {
      statusCode: 200,
      text: JSON.stringify({ output: '<html>Mock flight data</html>' }),
      data: JSON.stringify({ output: '<html>Mock flight data</html>' }),
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const client = new FallbackPlaywrightClient();
    const params = { tfs: 'test-data', hl: 'en' };

    const result = await client.fetchFlights(params);

    expect(mockClient.post).toHaveBeenCalledWith(
      'https://try.playwright.tech/service/control/run',
      {
        code: expect.stringContaining('https://www.google.com/travel/flights?tfs=test-data&hl=en'),
        language: 'python'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('<html>Mock flight data</html>');
  });

  test('FallbackPlaywrightClient should handle API errors', async () => {
    const mockResponse = {
      statusCode: 500,
      text: 'Internal Server Error',
      data: 'Internal Server Error',
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const client = new FallbackPlaywrightClient();
    const params = { tfs: 'test-data' };

    await expect(client.fetchFlights(params)).rejects.toThrow('500 Result: Internal Server Error');
  });

  test('FallbackPlaywrightClient should handle invalid JSON response', async () => {
    const mockResponse = {
      statusCode: 200,
      text: 'Invalid JSON',
      data: 'Invalid JSON',
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const client = new FallbackPlaywrightClient();
    const params = { tfs: 'test-data' };

    await expect(client.fetchFlights(params)).rejects.toThrow('Failed to parse Playwright response');
  });

  test('fallbackPlaywrightFetch should work as standalone function', async () => {
    const mockResponse = {
      statusCode: 200,
      text: JSON.stringify({ output: '<html>Mock data</html>' }),
      data: JSON.stringify({ output: '<html>Mock data</html>' }),
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const params = { tfs: 'test-data' };
    const result = await fallbackPlaywrightFetch(params);

    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('<html>Mock data</html>');
  });
});