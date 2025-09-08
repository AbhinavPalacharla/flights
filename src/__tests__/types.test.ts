/**
 * Tests for type definitions and basic functionality
 */

import { Airport, FlightData, Passengers, createFilter, searchAirport } from '../index';

describe('Type Definitions', () => {
  test('Airport enum should contain expected airports', () => {
    expect(Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT).toBe('TPE');
    expect(Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT).toBe('JFK');
    expect(Airport.LOS_ANGELES_INTERNATIONAL_AIRPORT).toBe('LAX');
  });

  test('FlightData should create correctly', () => {
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: 'TPE',
      to_airport: 'JFK'
    });

    expect(flightData.date).toBe('2025-01-01');
    expect(flightData.from_airport).toBe('TPE');
    expect(flightData.to_airport).toBe('JFK');
  });

  test('FlightData should work with Airport enum', () => {
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT,
      to_airport: Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
    });

    expect(flightData.from_airport).toBe('TPE');
    expect(flightData.to_airport).toBe('JFK');
  });

  test('Passengers should create correctly', () => {
    const passengers = new Passengers({
      adults: 2,
      children: 1,
      infants_in_seat: 0,
      infants_on_lap: 0
    });

    expect(passengers.adults).toBe(2);
    expect(passengers.children).toBe(1);
    expect(passengers.infants_in_seat).toBe(0);
    expect(passengers.infants_on_lap).toBe(0);
  });

  test('Passengers should validate constraints', () => {
    expect(() => {
      new Passengers({
        adults: 5,
        children: 3,
        infants_in_seat: 2,
        infants_on_lap: 1
      });
    }).toThrow('Too many passengers (> 9)');

    expect(() => {
      new Passengers({
        adults: 1,
        infants_on_lap: 2
      });
    }).toThrow('You must have at least one adult per infant on lap');
  });

  test('FlightData should validate airline codes', () => {
    expect(() => {
      new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        airlines: ['INVALID_CODE']
      });
    }).toThrow('Invalid airline code: INVALID_CODE');

    // Valid airline codes should work
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: 'TPE',
      to_airport: 'JFK',
      airlines: ['AA', 'STAR_ALLIANCE']
    });

    expect(flightData.airlines).toEqual(['AA', 'STAR_ALLIANCE']);
  });
});

describe('Filter Creation', () => {
  test('createFilter should work correctly', () => {
    const filter = createFilter({
      flight_data: [
        new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })
      ],
      trip: 'one-way',
      passengers: new Passengers({ adults: 1 }),
      seat: 'economy'
    });

    expect(filter.trip).toBe('one-way');
    expect(filter.seat).toBe('economy');
    expect(filter.flight_data).toHaveLength(1);
  });

  test('createFilter should apply max_stops to all flights', () => {
    const filter = createFilter({
      flight_data: [
        new FlightData({
          date: '2025-01-01',
          from_airport: 'TPE',
          to_airport: 'JFK'
        })
      ],
      trip: 'one-way',
      passengers: new Passengers({ adults: 1 }),
      seat: 'economy',
      max_stops: 1
    });

    expect(filter.max_stops).toBe(1);
  });
});

describe('Airport Search', () => {
  test('searchAirport should find airports by name', () => {
    const results = searchAirport('taipei');
    expect(results.some(r => r.code === 'TSA')).toBe(true);
    
    const taoyuanResults = searchAirport('taoyuan');
    expect(taoyuanResults.some(r => r.code === 'TPE')).toBe(true);
  });

  test('searchAirport should be case insensitive', () => {
    const results1 = searchAirport('NEW YORK');
    const results2 = searchAirport('new york');
    expect(results1).toEqual(results2);
  });

  test('searchAirport should return empty array for no matches', () => {
    const results = searchAirport('nonexistent');
    expect(results).toEqual([]);
  });
});