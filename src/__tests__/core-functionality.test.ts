/**
 * Core functionality tests based on original Python library examples
 * These tests mirror the test.py, test_bright_data.py, and test_jsdata.py files
 */

import { 
  FlightData, 
  Passengers, 
  createFilter, 
  getFlightsFromFilter,
  getFlights,
  searchAirport,
  Airport 
} from '../index';

// Mock axios to avoid actual HTTP requests
jest.mock('axios', () => ({
  get: jest.fn()
}));

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

describe('Core Functionality Tests (Based on Python Examples)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Flight Search (test.py equivalent)', () => {
    test('should create filter and get flights like test.py', async () => {
      const filter = createFilter({
        flight_data: [
          new FlightData({
            date: '2025-07-01',
            from_airport: 'TPE',
            to_airport: 'MYJ'
          })
        ],
        trip: 'one-way',
        passengers: new Passengers({
          adults: 2,
          children: 1,
          infants_in_seat: 0,
          infants_on_lap: 0
        }),
        seat: 'economy',
        max_stops: 1
      });

      expect(filter.trip).toBe('one-way');
      expect(filter.seat).toBe('economy');
      expect(filter.max_stops).toBe(1);
      expect(filter.flight_data).toHaveLength(1);
      expect(filter.flight_data[0].from_airport).toBe('TPE');
      expect(filter.flight_data[0].to_airport).toBe('MYJ');
    });

    test('should handle round-trip flights like test_bright_data.py', () => {
      const filter = createFilter({
        flight_data: [
          new FlightData({
            date: '2025-08-06',
            from_airport: 'JFK',
            to_airport: 'LAX'
          }),
          new FlightData({
            date: '2025-08-10',
            from_airport: 'LAX',
            to_airport: 'JFK'
          })
        ],
        trip: 'round-trip',
        passengers: new Passengers({
          adults: 1,
          children: 0,
          infants_in_seat: 0,
          infants_on_lap: 0
        }),
        seat: 'economy',
        max_stops: undefined
      });

      expect(filter.trip).toBe('round-trip');
      expect(filter.flight_data).toHaveLength(2);
      expect(filter.flight_data[0].from_airport).toBe('JFK');
      expect(filter.flight_data[0].to_airport).toBe('LAX');
      expect(filter.flight_data[1].from_airport).toBe('LAX');
      expect(filter.flight_data[1].to_airport).toBe('JFK');
    });

    test('should handle one-way flights like test_jsdata.py', () => {
      const filter = createFilter({
        flight_data: [
          new FlightData({
            date: '2025-10-04',
            from_airport: 'SJC',
            to_airport: 'LAS'
          })
        ],
        trip: 'one-way',
        seat: 'economy',
        passengers: new Passengers({
          adults: 1,
          children: 1,
          infants_in_seat: 0,
          infants_on_lap: 0
        })
      });

      expect(filter.trip).toBe('one-way');
      expect(filter.flight_data).toHaveLength(1);
      expect(filter.flight_data[0].from_airport).toBe('SJC');
      expect(filter.flight_data[0].to_airport).toBe('LAS');
    });
  });

  describe('Airport Search Functionality', () => {
    test('should search airports by code like Python search_airport', () => {
      const jfkResults = searchAirport('JFK');
      expect(jfkResults.some(r => r.code === 'JFK')).toBe(true);
      expect(jfkResults.some(r => r.name.includes('Kennedy'))).toBe(true);

      const tpeResults = searchAirport('TPE');
      expect(tpeResults.some(r => r.code === 'TPE')).toBe(true);
      expect(tpeResults.some(r => r.name.includes('Taoyuan'))).toBe(true);
    });

    test('should search airports by city name', () => {
      const newYorkResults = searchAirport('new york');
      expect(newYorkResults.length).toBeGreaterThan(0);
      // Check if any result contains "new york" in city or name
      expect(newYorkResults.some(r => 
        r.city.toLowerCase().includes('new york') || 
        r.name.toLowerCase().includes('new york')
      )).toBe(true);

      const losAngelesResults = searchAirport('los angeles');
      expect(losAngelesResults.length).toBeGreaterThan(0);
      expect(losAngelesResults.some(r => r.code === 'LAX')).toBe(true);
    });

    test('should search airports by partial name', () => {
      const kennedyResults = searchAirport('kennedy');
      expect(kennedyResults.some(r => r.code === 'JFK')).toBe(true);

      const heathrowResults = searchAirport('heathrow');
      expect(heathrowResults.some(r => r.code === 'LHR')).toBe(true);
    });
  });

  describe('FlightData Validation (Based on Python implementation)', () => {
    test('should handle Airport enum values like Python', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT,
        to_airport: Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
      });

      expect(flightData.from_airport).toBe('TPE');
      expect(flightData.to_airport).toBe('JFK');
    });

    test('should handle string airport codes like Python', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      expect(flightData.from_airport).toBe('TPE');
      expect(flightData.to_airport).toBe('JFK');
    });

    test('should handle airline codes like Python AIRLINE_ALLIANCES', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        airlines: ['AA', 'UA', 'STAR_ALLIANCE', 'ONEWORLD']
      });

      expect(flightData.airlines).toEqual(['AA', 'UA', 'STAR_ALLIANCE', 'ONEWORLD']);
    });

    test('should reject invalid airline codes like Python', () => {
      expect(() => {
        new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK',
          airlines: ['INVALID_CODE', 'TOO_LONG_CODE']
        });
      }).toThrow('Invalid airline code: INVALID_CODE');
    });
  });

  describe('Passengers Validation (Based on Python implementation)', () => {
    test('should handle valid passenger combinations', () => {
      const passengers1 = new Passengers({
        adults: 1,
        children: 0,
        infants_in_seat: 0,
        infants_on_lap: 0
      });
      expect(passengers1.adults).toBe(1);

      const passengers2 = new Passengers({
        adults: 2,
        children: 1,
        infants_in_seat: 1,
        infants_on_lap: 1
      });
      expect(passengers2.adults).toBe(2);
      expect(passengers2.children).toBe(1);
      expect(passengers2.infants_in_seat).toBe(1);
      expect(passengers2.infants_on_lap).toBe(1);
    });

    test('should reject too many passengers like Python', () => {
      expect(() => {
        new Passengers({
          adults: 5,
          children: 3,
          infants_in_seat: 2,
          infants_on_lap: 1
        });
      }).toThrow('Too many passengers (> 9)');
    });

    test('should reject infants on lap without enough adults like Python', () => {
      expect(() => {
        new Passengers({
          adults: 1,
          infants_on_lap: 2
        });
      }).toThrow('You must have at least one adult per infant on lap');
    });
  });

  describe('Filter Creation (Based on Python create_filter)', () => {
    test('should create filter with all parameters like Python', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const passengers = new Passengers({ adults: 1 });
      const filter = createFilter({
        flight_data: [flightData],
        trip: 'one-way',
        passengers,
        seat: 'economy',
        max_stops: 1
      });

      expect(filter.trip).toBe('one-way');
      expect(filter.seat).toBe('economy');
      expect(filter.max_stops).toBe(1);
      expect(filter.flight_data).toHaveLength(1);
      expect(filter.passengers).toBe(passengers);
    });

    test('should apply max_stops to all flights like Python', () => {
      const flightData1 = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const flightData2 = new FlightData({
        date: '2025-01-02',
        from_airport: 'JFK',
        to_airport: 'LAX'
      });

      const filter = createFilter({
        flight_data: [flightData1, flightData2],
        trip: 'multi-city',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy',
        max_stops: 2
      });

      expect(filter.max_stops).toBe(2);
      // The max_stops should be applied to individual flights
      expect(flightData1.max_stops).toBe(2);
      expect(flightData2.max_stops).toBe(2);
    });
  });

  describe('Different Trip Types (Based on Python examples)', () => {
    test('should handle one-way trips', () => {
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

      expect(filter.trip).toBe('one-way');
    });

    test('should handle round-trip flights', () => {
      const filter = createFilter({
        flight_data: [
          new FlightData({
            date: '2025-01-01',
            from_airport: 'TPE',
            to_airport: 'JFK'
          }),
          new FlightData({
            date: '2025-01-15',
            from_airport: 'JFK',
            to_airport: 'TPE'
          })
        ],
        trip: 'round-trip',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      expect(filter.trip).toBe('round-trip');
      expect(filter.flight_data).toHaveLength(2);
    });

    test('should handle multi-city trips', () => {
      const filter = createFilter({
        flight_data: [
          new FlightData({
            date: '2025-01-01',
            from_airport: 'TPE',
            to_airport: 'JFK'
          }),
          new FlightData({
            date: '2025-01-05',
            from_airport: 'JFK',
            to_airport: 'LAX'
          }),
          new FlightData({
            date: '2025-01-10',
            from_airport: 'LAX',
            to_airport: 'TPE'
          })
        ],
        trip: 'multi-city',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy'
      });

      expect(filter.trip).toBe('multi-city');
      expect(filter.flight_data).toHaveLength(3);
    });
  });

  describe('Different Seat Types (Based on Python examples)', () => {
    const seatTypes: Array<'economy' | 'premium-economy' | 'business' | 'first'> = [
      'economy', 'premium-economy', 'business', 'first'
    ];

    seatTypes.forEach(seatType => {
      test(`should handle ${seatType} seat type`, () => {
        const filter = createFilter({
          flight_data: [new FlightData({
            date: '2025-01-01',
            from_airport: 'TPE',
            to_airport: 'JFK'
          })],
          trip: 'one-way',
          passengers: new Passengers({ adults: 1 }),
          seat: seatType
        });

        expect(filter.seat).toBe(seatType);
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty flight data array', () => {
      expect(() => {
        createFilter({
          flight_data: [],
          trip: 'one-way',
          passengers: new Passengers({ adults: 1 }),
          seat: 'economy'
        });
      }).not.toThrow();
    });

    test('should handle undefined max_stops', () => {
      const filter = createFilter({
        flight_data: [new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })],
        trip: 'one-way',
        passengers: new Passengers({ adults: 1 }),
        seat: 'economy',
        max_stops: undefined
      });

      expect(filter.max_stops).toBeUndefined();
    });

    test('should handle zero passengers', () => {
      expect(() => {
        new Passengers({
          adults: 0,
          children: 0,
          infants_in_seat: 0,
          infants_on_lap: 0
        });
      }).not.toThrow();
    });
  });
});