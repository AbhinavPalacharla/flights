/**
 * Tests for HTTP client functionality
 */

import { HttpClient, HttpResponse } from '../http-client';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

describe('HTTP Client', () => {
  let client: HttpClient;
  let mockAxios: any;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new HttpClient();
    mockAxios = require('axios');
  });

  test('should create client with default options', () => {
    const client = new HttpClient();
    expect(client).toBeDefined();
  });

  test('should create client with custom options', () => {
    const client = new HttpClient({
      verify: false,
      timeout: 10000,
      headers: { 'Custom-Header': 'value' }
    });
    expect(client).toBeDefined();
  });

  test('should make GET request successfully', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      data: 'test data',
      headers: { 'content-type': 'text/html' }
    };

    mockAxios.get.mockResolvedValue(mockResponse);

    const result = await client.get('https://example.com');

    expect(mockAxios.get).toHaveBeenCalledWith('https://example.com', {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      },
      validateStatus: expect.any(Function)
    });

    expect(result).toBeInstanceOf(HttpResponse);
    expect(result.statusCode).toBe(200);
    expect(result.text).toBe('test data');
  });

  test('should make POST request successfully', async () => {
    const mockResponse = {
      status: 201,
      statusText: 'Created',
      data: { id: 1, name: 'test' },
      headers: { 'content-type': 'application/json' }
    };

    mockAxios.post.mockResolvedValue(mockResponse);

    const result = await client.post('https://example.com', { name: 'test' });

    expect(mockAxios.post).toHaveBeenCalledWith('https://example.com', { name: 'test' }, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      },
      validateStatus: expect.any(Function)
    });

    expect(result).toBeInstanceOf(HttpResponse);
    expect(result.statusCode).toBe(201);
    expect(result.data).toEqual({ id: 1, name: 'test' });
  });

  test('should handle GET request errors', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(client.get('https://example.com')).rejects.toThrow('HTTP GET request failed: Error: Network error');
  });

  test('should handle POST request errors', async () => {
    mockAxios.post.mockRejectedValue(new Error('Network error'));

    await expect(client.post('https://example.com', {})).rejects.toThrow('HTTP POST request failed: Error: Network error');
  });

  test('should merge custom headers', async () => {
    const client = new HttpClient({
      headers: { 'Custom-Header': 'value' }
    });

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      data: 'test',
      headers: {}
    };

    mockAxios.get.mockResolvedValue(mockResponse);

    await client.get('https://example.com', {
      headers: { 'Another-Header': 'another-value' }
    });

    expect(mockAxios.get).toHaveBeenCalledWith('https://example.com', {
      timeout: 30000,
      headers: {
        'Custom-Header': 'value',
        'Another-Header': 'another-value'
      },
      validateStatus: expect.any(Function)
    });
  });
});

describe('HttpResponse', () => {
  test('should create response with correct properties', () => {
    const mockAxiosResponse = {
      status: 200,
      statusText: 'OK',
      data: 'test data',
      headers: { 'content-type': 'text/html' },
      config: {} as any
    };

    const response = new HttpResponse(mockAxiosResponse);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('test data');
    expect(response.data).toBe('test data');
    expect(response.headers).toEqual({ 'content-type': 'text/html' });
  });

  test('should handle JSON data', () => {
    const mockAxiosResponse = {
      status: 200,
      statusText: 'OK',
      data: { id: 1, name: 'test' },
      headers: { 'content-type': 'application/json' },
      config: {} as any
    };

    const response = new HttpResponse(mockAxiosResponse);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('{"id":1,"name":"test"}');
    expect(response.data).toEqual({ id: 1, name: 'test' });
  });

  test('text_markdown should return same as text', () => {
    const mockAxiosResponse = {
      status: 200,
      statusText: 'OK',
      data: 'test data',
      headers: {},
      config: {} as any
    };

    const response = new HttpResponse(mockAxiosResponse);

    expect(response.text_markdown).toBe('test data');
    expect(response.text_markdown).toBe(response.text);
  });
});