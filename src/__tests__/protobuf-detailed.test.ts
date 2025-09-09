/**
 * Detailed protobuf tests based on original Python library
 * Tests the protobuf serialization and deserialization functionality
 */

import { 
  createInfoProto, 
  createCookiesProto, 
  createFlightDataProto,
  createPassengersProto,
  getSeatTypeProto,
  getTripTypeProto,
  serializeToBase64,
  deserializeFromBase64,
  loadProtobufDefinitions 
} from '../protobuf';
import { FlightData, Passengers } from '../index';

// Mock the protobuf module
jest.mock('protobufjs', () => ({
  parse: jest.fn(() => ({
    root: {
      lookupType: jest.fn((typeName: string) => {
        const mockMessage = {
          create: jest.fn((data: any) => data),
          encode: jest.fn((data: any) => ({
            finish: jest.fn(() => Buffer.from(JSON.stringify(data)))
          })),
          decode: jest.fn((buffer: Buffer) => JSON.parse(buffer.toString()))
        };
        return mockMessage;
      })
    }
  }))
}));

describe('Protobuf Detailed Tests (Based on Python Implementation)', () => {
  beforeAll(async () => {
    await loadProtobufDefinitions();
  });

  describe('FlightData Protobuf Serialization', () => {
    test('should create FlightData protobuf like Python flights_pb2', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        max_stops: 1,
        airlines: ['AA', 'UA']
      });

      const proto = createFlightDataProto(flightData);

      expect(proto).toBeDefined();
      expect(proto.date).toBe('2025-01-01');
      expect(proto.from_flight).toBeDefined();
      expect(proto.from_flight.airport).toBe('TPE');
      expect(proto.to_flight).toBeDefined();
      expect(proto.to_flight.airport).toBe('JFK');
      expect(proto.max_stops).toBe(1);
      expect(proto.airlines).toEqual(['AA', 'UA']);
    });

    test('should handle FlightData without optional fields', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const proto = createFlightDataProto(flightData);

      expect(proto).toBeDefined();
      expect(proto.date).toBe('2025-01-01');
      expect(proto.from_flight.airport).toBe('TPE');
      expect(proto.to_flight.airport).toBe('JFK');
      expect(proto.max_stops).toBeUndefined();
      expect(proto.airlines).toEqual([]);
    });
  });

  describe('Passengers Protobuf Serialization', () => {
    test('should create Passengers protobuf like Python', () => {
      const passengers = new Passengers({
        adults: 2,
        children: 1,
        infants_in_seat: 1,
        infants_on_lap: 1
      });

      const proto = createPassengersProto(passengers);

      expect(proto).toEqual([1, 1, 2, 3, 4]); // ADULT, ADULT, CHILD, INFANT_IN_SEAT, INFANT_ON_LAP
    });

    test('should handle Passengers with only adults', () => {
      const passengers = new Passengers({
        adults: 3,
        children: 0,
        infants_in_seat: 0,
        infants_on_lap: 0
      });

      const proto = createPassengersProto(passengers);

      expect(proto).toEqual([1, 1, 1]); // Three adults
    });

    test('should handle Passengers with mixed types', () => {
      const passengers = new Passengers({
        adults: 1,
        children: 2,
        infants_in_seat: 0,
        infants_on_lap: 1
      });

      const proto = createPassengersProto(passengers);

      expect(proto).toEqual([1, 2, 2, 4]); // ADULT, CHILD, CHILD, INFANT_ON_LAP
    });
  });

  describe('Seat Type Protobuf Conversion', () => {
    test('should convert seat types to protobuf enum like Python', () => {
      expect(getSeatTypeProto('economy')).toBe(1);
      expect(getSeatTypeProto('premium-economy')).toBe(2);
      expect(getSeatTypeProto('business')).toBe(3);
      expect(getSeatTypeProto('first')).toBe(4);
    });
  });

  describe('Trip Type Protobuf Conversion', () => {
    test('should convert trip types to protobuf enum like Python', () => {
      expect(getTripTypeProto('round-trip')).toBe(1);
      expect(getTripTypeProto('one-way')).toBe(2);
      expect(getTripTypeProto('multi-city')).toBe(3);
    });
  });

  describe('Info Protobuf Creation', () => {
    test('should create Info protobuf like Python', () => {
      const flightData1 = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const flightData2 = new FlightData({
        date: '2025-01-15',
        from_airport: 'JFK',
        to_airport: 'TPE'
      });

      const passengers = new Passengers({ adults: 1 });

      const info = createInfoProto(
        [flightData1, flightData2],
        'economy',
        'round-trip',
        passengers,
        1
      );

      expect(info).toBeDefined();
      expect(info.data).toHaveLength(2);
      expect(info.seat).toBe(1); // ECONOMY
      expect(info.passengers).toEqual([1]); // One adult
      expect(info.trip).toBe(1); // ROUND_TRIP
    });

    test('should apply max_stops to all flights like Python', () => {
      const flightData1 = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const flightData2 = new FlightData({
        date: '2025-01-15',
        from_airport: 'JFK',
        to_airport: 'TPE'
      });

      const passengers = new Passengers({ adults: 1 });

      const info = createInfoProto(
        [flightData1, flightData2],
        'economy',
        'round-trip',
        passengers,
        2
      );

      expect(info.data[0].max_stops).toBe(2);
      expect(info.data[1].max_stops).toBe(2);
    });
  });

  describe('Cookies Protobuf Creation', () => {
    test('should create Cookies protobuf like Python', () => {
      const cookies = createCookiesProto('gws_20250101-0_RC2', 'en', 1735689600);

      expect(cookies).toBeDefined();
      expect(cookies.info).toBeDefined();
      expect(cookies.info.gws).toBe('gws_20250101-0_RC2');
      expect(cookies.info.locale).toBe('en');
      expect(cookies.datetime).toBeDefined();
      expect(cookies.datetime.timestamp).toBe(1735689600);
    });
  });

  describe('Base64 Serialization', () => {
    test('should serialize to base64 like Python', () => {
      const mockMessage = {
        constructor: {
          encode: jest.fn(() => ({
            finish: jest.fn(() => Buffer.from('test data'))
          }))
        }
      };

      const result = serializeToBase64(mockMessage as any);
      expect(result).toBe('dGVzdCBkYXRh');
    });

    test('should deserialize from base64 like Python', () => {
      const mockMessageType = {
        decode: jest.fn((buffer: Buffer) => {
          // Return a mock object instead of trying to parse "test data" as JSON
          return { message: buffer.toString() };
        })
      };

      const result = deserializeFromBase64('dGVzdCBkYXRh', mockMessageType as any);
      expect(result).toEqual({ message: 'test data' });
    });
  });

  describe('Complex Flight Data Scenarios', () => {
    test('should handle multi-city trip with different airlines', () => {
      const flightData1 = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        airlines: ['AA', 'STAR_ALLIANCE']
      });

      const flightData2 = new FlightData({
        date: '2025-01-05',
        from_airport: 'JFK',
        to_airport: 'LAX',
        airlines: ['UA', 'ONEWORLD']
      });

      const flightData3 = new FlightData({
        date: '2025-01-10',
        from_airport: 'LAX',
        to_airport: 'TPE',
        airlines: ['DL', 'SKYTEAM']
      });

      const passengers = new Passengers({
        adults: 2,
        children: 1,
        infants_in_seat: 0,
        infants_on_lap: 1
      });

      const info = createInfoProto(
        [flightData1, flightData2, flightData3],
        'business',
        'multi-city',
        passengers,
        1
      );

      expect(info).toBeDefined();
      expect(info.data).toHaveLength(3);
      expect(info.seat).toBe(3); // BUSINESS
      expect(info.trip).toBe(3); // MULTI_CITY
      expect(info.passengers).toEqual([1, 1, 2, 4]); // Two adults, one child, one infant on lap
      expect(info.data[0].airlines).toEqual(['AA', 'STAR_ALLIANCE']);
      expect(info.data[1].airlines).toEqual(['UA', 'ONEWORLD']);
      expect(info.data[2].airlines).toEqual(['DL', 'SKYTEAM']);
    });

    test('should handle round-trip with no stops', () => {
      const flightData1 = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        max_stops: 0
      });

      const flightData2 = new FlightData({
        date: '2025-01-15',
        from_airport: 'JFK',
        to_airport: 'TPE',
        max_stops: 0
      });

      const passengers = new Passengers({ adults: 1 });

      const info = createInfoProto(
        [flightData1, flightData2],
        'first',
        'round-trip',
        passengers,
        0
      );

      expect(info).toBeDefined();
      expect(info.data).toHaveLength(2);
      expect(info.seat).toBe(4); // FIRST
      expect(info.trip).toBe(1); // ROUND_TRIP
      expect(info.data[0].max_stops).toBe(0);
      expect(info.data[1].max_stops).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty airlines array', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK',
        airlines: []
      });

      const proto = createFlightDataProto(flightData);
      expect(proto.airlines).toEqual([]);
    });

    test('should handle undefined max_stops', () => {
      const flightData = new FlightData({
        date: '2025-01-01',
        from_airport: 'TPE',
        to_airport: 'JFK'
      });

      const proto = createFlightDataProto(flightData);
      expect(proto.max_stops).toBeUndefined();
    });

    test('should handle zero passengers', () => {
      const passengers = new Passengers({
        adults: 0,
        children: 0,
        infants_in_seat: 0,
        infants_on_lap: 0
      });

      const proto = createPassengersProto(passengers);
      expect(proto).toEqual([]);
    });
  });
});