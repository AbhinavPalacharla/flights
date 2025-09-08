/**
 * Tests for Bright Data integration
 */

import { BrightDataClient, brightDataFetch } from '../bright-data';

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

describe('Bright Data Integration', () => {
  let mockClient: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      post: jest.fn()
    };
    (require('../http-client').HttpClient as jest.Mock).mockImplementation(() => mockClient);
    
    // Set environment variable for tests
    originalEnv = process.env.BRIGHT_DATA_API_KEY;
    process.env.BRIGHT_DATA_API_KEY = 'test-key';
  });

  afterEach(() => {
    // Restore environment variable
    if (originalEnv !== undefined) {
      process.env.BRIGHT_DATA_API_KEY = originalEnv;
    } else {
      delete process.env.BRIGHT_DATA_API_KEY;
    }
  });

  test('BrightDataClient should be created with default options', () => {
    const client = new BrightDataClient();
    expect(client).toBeDefined();
  });

  test('BrightDataClient should be created with custom options', () => {
    const client = new BrightDataClient({
      apiUrl: 'https://custom.api.com',
      apiKey: 'test-key',
      zone: 'custom-zone'
    });
    expect(client).toBeDefined();
  });

  test('BrightDataClient should throw error when API key is missing', () => {
    // Mock environment to not have API key
    const originalEnv = process.env.BRIGHT_DATA_API_KEY;
    delete process.env.BRIGHT_DATA_API_KEY;

    expect(() => {
      new BrightDataClient();
    }).toThrow('BRIGHT_DATA_API_KEY environment variable is required');

    // Restore environment
    process.env.BRIGHT_DATA_API_KEY = originalEnv;
  });

  test('fetchFlights should make correct API call', async () => {
    const mockResponse = {
      statusCode: 200,
      text: '<html>Mock flight data</html>',
      data: '<html>Mock flight data</html>',
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const client = new BrightDataClient({
      apiKey: 'test-key'
    });

    const params = {
      tfs: 'test-data',
      hl: 'en'
    };

    const result = await client.fetchFlights(params);

    expect(mockClient.post).toHaveBeenCalledWith(
      'https://api.brightdata.com/request',
      {
        url: 'https://www.google.com/travel/flights?tfs=test-data&hl=en',
        zone: 'serp_api1'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-key'
        }
      }
    );

    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('<html>Mock flight data</html>');
  });

  test('fetchFlights should throw error on API failure', async () => {
    const mockResponse = {
      statusCode: 500,
      text: 'Internal Server Error',
      data: 'Internal Server Error',
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const client = new BrightDataClient({
      apiKey: 'test-key'
    });

    const params = { tfs: 'test-data' };

    await expect(client.fetchFlights(params)).rejects.toThrow('500 Result: Internal Server Error');
  });

  test('brightDataFetch should work as standalone function', async () => {
    const mockResponse = {
      statusCode: 200,
      text: '<html>Mock data</html>',
      data: '<html>Mock data</html>',
      headers: {}
    };

    mockClient.post.mockResolvedValue(mockResponse);

    const params = { tfs: 'test-data' };
    const result = await brightDataFetch(params);

    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('<html>Mock data</html>');
  });
});