/**
 * Tests for protobuf serialization
 */

import { 
  createInfoProto, 
  createCookiesProto, 
  serializeToBase64,
  loadProtobufDefinitions 
} from '../protobuf';
import { FlightData, Passengers } from '../index';

// Mock the protobuf module
jest.mock('protobufjs', () => ({
  parse: jest.fn(() => ({
    root: {
      lookupType: jest.fn(() => ({
        create: jest.fn((data) => data),
        encode: jest.fn((data) => ({
          finish: jest.fn(() => Buffer.from(JSON.stringify(data)))
        }))
      }))
    }
  }))
}));

describe('Protobuf Serialization', () => {
  beforeAll(async () => {
    await loadProtobufDefinitions();
  });

  test('createInfoProto should create correct structure', () => {
    const flightData = new FlightData({
      date: '2025-01-01',
      from_airport: 'TPE',
      to_airport: 'JFK'
    });

    const passengers = new Passengers({ adults: 1 });

    const info = createInfoProto(
      [flightData],
      'economy',
      'one-way',
      passengers
    );

    expect(info).toBeDefined();
  });

  test('createCookiesProto should create correct structure', () => {
    const cookies = createCookiesProto('gws_20250101-0_RC2', 'en', 1735689600);
    expect(cookies).toBeDefined();
  });

  test('serializeToBase64 should encode data', () => {
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
});