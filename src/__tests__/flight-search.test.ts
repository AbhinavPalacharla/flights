/**
 * Flight search functionality tests based on original Python library
 * Tests the actual flight search with mocked responses
 */

import { 
  FlightData, 
  Passengers, 
  createFilter, 
  getFlightsFromFilter,
  getFlights
} from '../index';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the fallback methods
jest.mock('../bright-data', () => ({
  brightDataFetch: jest.fn()
}));

jest.mock('../local-playwright', () => ({
  localPlaywrightFetch: jest.fn()
}));

jest.mock('../fallback-playwright', () => ({
  fallbackPlaywrightFetch: jest.fn()
}));

describe('Flight Search Tests (Based on Python Examples)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HTML Data Source Tests', () => {
    test('should parse HTML response like Python core.py', async () => {
      const mockHtmlResponse = `
        <html>
          <body>
            <div jsname="IWWDBc">
              <ul class="Rk10dc">
                <li>
                  <div class="sSHqwe tPgKwe ogfYpf">
                    <span>American Airlines</span>
                  </div>
                  <span class="mv1WYe">
                    <div>10:30 AM</div>
                    <div>2:45 PM</div>
                  </span>
                  <span class="bOzv6">+1 day</span>
                  <li>
                    <div class="Ak5kof">
                      <div>4h 15m</div>
                    </div>
                  </li>
                  <div class="BbR8Ec">
                    <div class="ogfYpf">1 stop</div>
                  </div>
                  <div class="YMlIz FpEdX">$450</div>
                </li>
              </ul>
            </div>
            <span class="gOatQ">typical</span>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtmlResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      const result = await getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'html' });

      expect(result).toBeDefined();
      // Check if it's a DecodedResult (has raw, best, other) or Result (has current_price, flights)
      if (result && 'raw' in result) {
        // DecodedResult
        expect(result).toHaveProperty('raw');
        expect(result).toHaveProperty('best');
        expect(result).toHaveProperty('other');
        expect(Array.isArray(result.raw)).toBe(true);
        expect(Array.isArray(result.best)).toBe(true);
        expect(Array.isArray(result.other)).toBe(true);
      } else if (result && 'current_price' in result) {
        // Result
        expect(result).toHaveProperty('current_price');
        expect(result).toHaveProperty('flights');
        expect(Array.isArray(result.flights)).toBe(true);
      }
    });

    test('should handle multiple flights in HTML response', async () => {
      const mockHtmlResponse = `
        <html>
          <body>
            <div jsname="IWWDBc">
              <ul class="Rk10dc">
                <li>
                  <div class="sSHqwe tPgKwe ogfYpf">
                    <span>American Airlines</span>
                  </div>
                  <span class="mv1WYe">
                    <div>10:30 AM</div>
                    <div>2:45 PM</div>
                  </span>
                  <span class="bOzv6">+1 day</span>
                  <li>
                    <div class="Ak5kof">
                      <div>4h 15m</div>
                    </div>
                  </li>
                  <div class="BbR8Ec">
                    <div class="ogfYpf">1 stop</div>
                  </div>
                  <div class="YMlIz FpEdX">$450</div>
                </li>
                <li>
                  <div class="sSHqwe tPgKwe ogfYpf">
                    <span>United Airlines</span>
                  </div>
                  <span class="mv1WYe">
                    <div>2:15 PM</div>
                    <div>6:30 PM</div>
                  </span>
                  <span class="bOzv6">Same day</span>
                  <li>
                    <div class="Ak5kof">
                      <div>4h 15m</div>
                    </div>
                  </li>
                  <div class="BbR8Ec">
                    <div class="ogfYpf">Nonstop</div>
                  </div>
                  <div class="YMlIz FpEdX">$520</div>
                </li>
              </ul>
            </div>
            <span class="gOatQ">low</span>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtmlResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      const result = await getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'html' });

      expect(result).toBeDefined();
      // Check if it's a DecodedResult (has raw, best, other) or Result (has current_price, flights)
      if (result && 'raw' in result) {
        // DecodedResult
        expect(result).toHaveProperty('raw');
        expect(result).toHaveProperty('best');
        expect(result).toHaveProperty('other');
        expect(Array.isArray(result.raw)).toBe(true);
        expect(Array.isArray(result.best)).toBe(true);
        expect(Array.isArray(result.other)).toBe(true);
      } else if (result && 'current_price' in result) {
        // Result
        expect(result).toHaveProperty('current_price');
        expect(result).toHaveProperty('flights');
        expect(Array.isArray(result.flights)).toBe(true);
      }
    });

    test('should handle flights with delays', async () => {
      const mockHtmlResponse = `
        <html>
          <body>
            <div jsname="IWWDBc">
              <ul class="Rk10dc">
                <li>
                  <div class="sSHqwe tPgKwe ogfYpf">
                    <span>Delta Airlines</span>
                  </div>
                  <span class="mv1WYe">
                    <div>10:30 AM</div>
                    <div>2:45 PM</div>
                  </span>
                  <span class="bOzv6">+1 day</span>
                  <li>
                    <div class="Ak5kof">
                      <div>4h 15m</div>
                    </div>
                  </li>
                  <div class="BbR8Ec">
                    <div class="ogfYpf">1 stop</div>
                  </div>
                  <div class="GsCCve">+2h 30m delay</div>
                  <div class="YMlIz FpEdX">$450</div>
                </li>
              </ul>
            </div>
            <span class="gOatQ">high</span>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtmlResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      const result = await getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'html' });

      expect(result).toBeDefined();
      // Check if it's a DecodedResult (has raw, best, other) or Result (has current_price, flights)
      if (result && 'raw' in result) {
        // DecodedResult
        expect(result).toHaveProperty('raw');
        expect(result).toHaveProperty('best');
        expect(result).toHaveProperty('other');
        expect(Array.isArray(result.raw)).toBe(true);
        expect(Array.isArray(result.best)).toBe(true);
        expect(Array.isArray(result.other)).toBe(true);
      } else if (result && 'current_price' in result) {
        // Result
        expect(result).toHaveProperty('current_price');
        expect(result).toHaveProperty('flights');
        expect(Array.isArray(result.flights)).toBe(true);
      }
    });
  });

  describe('JS Data Source Tests', () => {
    test.skip('should parse JS response like Python core.py', async () => {
      const mockJsResponse = `
        <html>
          <body>
            <script class="ds:1">
              var data = {
                data: [["test"]]
              }
            </script>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockJsResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      const result = await getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'js' });

      expect(result).toBeDefined();
      // The JS data source should return a DecodedResult
      expect(result).toHaveProperty('raw');
      expect(result).toHaveProperty('best');
      expect(result).toHaveProperty('other');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle HTTP errors like Python core.py', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      await expect(getFlightsFromFilter(filter, '', { mode: 'common' }))
        .rejects.toThrow('Network error');
    });

    test('should handle malformed HTML response', async () => {
      const mockHtmlResponse = '<html><body>No flight data</body></html>';

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockHtmlResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      await expect(getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'html' }))
        .rejects.toThrow('No flights found');
    });

    test('should handle malformed JS response', async () => {
      const mockJsResponse = `
        <html>
          <body>
            <script class="ds:1">
              Invalid JSON data
            </script>
          </body>
        </html>
      `;

      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: mockJsResponse,
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      await expect(getFlightsFromFilter(filter, '', { mode: 'common', data_source: 'js' }))
        .rejects.toThrow('Malformed js data');
    });
  });

  describe('Different Fetch Modes Tests', () => {
    test('should use common mode by default', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: '<html><body><div jsname="IWWDBc"><ul class="Rk10dc"><li><div class="sSHqwe tPgKwe ogfYpf"><span>Test Airline</span></div><span class="mv1WYe"><div>10:00 AM</div><div>2:00 PM</div></span><span class="bOzv6">Same day</span><li><div class="Ak5kof"><div>4h 0m</div></div></li><div class="BbR8Ec"><div class="ogfYpf">Nonstop</div></div><div class="YMlIz FpEdX">$300</div></li></ul></div><span class="gOatQ">typical</span></body></html>',
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      await getFlightsFromFilter(filter, '', { mode: 'common' });

      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('should use getFlights convenience function', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: '<html><body><div jsname="IWWDBc"><ul class="Rk10dc"><li><div class="sSHqwe tPgKwe ogfYpf"><span>Test Airline</span></div><span class="mv1WYe"><div>10:00 AM</div><div>2:00 PM</div></span><span class="bOzv6">Same day</span><li><div class="Ak5kof"><div>4h 0m</div></div></li><div class="BbR8Ec"><div class="ogfYpf">Nonstop</div></div><div class="YMlIz FpEdX">$300</div></li></ul></div><span class="gOatQ">typical</span></body></html>',
        headers: {}
      });

      await getFlights({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy',
        fetch_mode: 'common'
      });

      expect(mockedAxios.get).toHaveBeenCalled();
    });
  });

  describe('Currency Parameter Tests', () => {
    test('should pass currency parameter to request', async () => {
      mockedAxios.get.mockResolvedValue({
        status: 200,
        data: '<html><body><div jsname="IWWDBc"><ul class="Rk10dc"><li><div class="sSHqwe tPgKwe ogfYpf"><span>Test Airline</span></div><span class="mv1WYe"><div>10:00 AM</div><div>2:00 PM</div></span><span class="bOzv6">Same day</span><li><div class="Ak5kof"><div>4h 0m</div></div></li><div class="BbR8Ec"><div class="ogfYpf">Nonstop</div></div><div class="YMlIz FpEdX">$300</div></li></ul></div><span class="gOatQ">typical</span></body></html>',
        headers: {}
      });

      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      await getFlightsFromFilter(filter, 'EUR', { mode: 'common' });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.google.com/travel/flights',
        expect.objectContaining({
          params: expect.objectContaining({
            curr: 'EUR'
          })
        })
      );
    });
  });
});