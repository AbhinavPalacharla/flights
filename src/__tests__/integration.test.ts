/**
 * Integration tests for the complete library functionality
 */

import { 
  FlightData, 
  Passengers, 
  createFilter, 
  getFlightsFromFilter,
  searchAirport,
  Airport 
} from '../index';

// Mock axios to avoid actual HTTP requests
jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a complete flight search workflow', () => {
    // Create flight data
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT,
      to_airport: Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
    });

    // Create passengers
    const passengers = new Passengers({
      adults: 2,
      children: 1,
      infants_in_seat: 0,
      infants_on_lap: 0
    });

    // Create filter
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
  });

  test('should handle round-trip flights', () => {
    const outboundFlight = new FlightData({
      date: '2025-01-01',
      from_airport: 'JFK',
      to_airport: 'LAX'
    });

    const returnFlight = new FlightData({
      date: '2025-01-05',
      from_airport: 'LAX',
      to_airport: 'JFK'
    });

    const passengers = new Passengers({ adults: 1 });

    const filter = createFilter({
      flight_data: [outboundFlight, returnFlight],
      trip: 'round-trip',
      passengers,
      seat: 'economy'
    });

    expect(filter.trip).toBe('round-trip');
    expect(filter.flight_data).toHaveLength(2);
  });

  test('should handle different seat types', () => {
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: 'JFK',
      to_airport: 'LAX'
    });

    const passengers = new Passengers({ adults: 1 });

    const seatTypes: Array<'economy' | 'premium-economy' | 'business' | 'first'> = [
      'economy', 'premium-economy', 'business', 'first'
    ];

    seatTypes.forEach(seatType => {
      const filter = createFilter({
        flight_data: [flightData],
        trip: 'one-way',
        passengers,
        seat: seatType
      });

      expect(filter.seat).toBe(seatType);
    });
  });

  test('should handle different trip types', () => {
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: 'JFK',
      to_airport: 'LAX'
    });

    const passengers = new Passengers({ adults: 1 });

    const tripTypes: Array<'one-way' | 'round-trip' | 'multi-city'> = [
      'one-way', 'round-trip', 'multi-city'
    ];

    tripTypes.forEach(tripType => {
      const filter = createFilter({
        flight_data: [flightData],
        trip: tripType,
        passengers,
        seat: 'economy'
      });

      expect(filter.trip).toBe(tripType);
    });
  });

  test('should validate passenger constraints', () => {
    // Test valid passengers
    expect(() => {
      new Passengers({
        adults: 1,
        children: 2,
        infants_in_seat: 1,
        infants_on_lap: 1
      });
    }).not.toThrow();

    // Test too many passengers
    expect(() => {
      new Passengers({
        adults: 5,
        children: 3,
        infants_in_seat: 2,
        infants_on_lap: 1
      });
    }).toThrow('Too many passengers (> 9)');

    // Test infants on lap without enough adults
    expect(() => {
      new Passengers({
        adults: 1,
        infants_on_lap: 2
      });
    }).toThrow('You must have at least one adult per infant on lap');
  });

  test('should search airports correctly', () => {
    const taipeiResults = searchAirport('taipei');
    expect(taipeiResults).toContain(Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT);

    const newYorkResults = searchAirport('new york');
    expect(newYorkResults.length).toBeGreaterThan(0);
    expect(newYorkResults).toContain(Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT);

    const emptyResults = searchAirport('nonexistent');
    expect(emptyResults).toEqual([]);
  });

  test('should handle airline codes correctly', () => {
    // Valid 2-character codes
    const flightData1 = new FlightData({
      date: '2025-01-01',
      from_airport: 'JFK',
      to_airport: 'LAX',
      airlines: ['AA', 'UA']
    });
    expect(flightData1.airlines).toEqual(['AA', 'UA']);

    // Valid alliance codes
    const flightData2 = new FlightData({
      date: '2025-01-01',
      from_airport: 'JFK',
      to_airport: 'LAX',
      airlines: ['STAR_ALLIANCE', 'ONEWORLD']
    });
    expect(flightData2.airlines).toEqual(['STAR_ALLIANCE', 'ONEWORLD']);

    // Invalid codes should throw
    expect(() => {
      new FlightData({
        date: '2025-01-01',
        from_airport: 'JFK',
        to_airport: 'LAX',
        airlines: ['INVALID']
      });
    }).toThrow('Invalid airline code: INVALID');
  });
});