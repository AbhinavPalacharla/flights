/**
 * Tests for decoder functionality
 */

import { NLData, CodeshareDecoder, FlightDecoder, ResultDecoder } from '../decoder';

describe('NLData', () => {
  test('should access data by index', () => {
    const data = new NLData([1, 2, 3]);
    expect(data.get(0)).toBe(1);
    expect(data.get(1)).toBe(2);
    expect(data.get(2)).toBe(3);
  });

  test('should access nested data by path', () => {
    const data = new NLData([[1, 2], [3, 4]]);
    expect(data.get([0, 0])).toBe(1);
    expect(data.get([0, 1])).toBe(2);
    expect(data.get([1, 0])).toBe(3);
    expect(data.get([1, 1])).toBe(4);
  });

  test('should throw error for invalid path', () => {
    const data = new NLData([1, 2, 3]);
    expect(() => data.get([0, 0])).toThrow('Found non list type');
    expect(() => data.get([10])).toThrow('Trying to traverse to index out of range');
  });
});

describe('CodeshareDecoder', () => {
  test('should decode codeshare data', () => {
    const data = new NLData([
      ['AA', '123', null, ['American Airlines']],
      ['UA', '456', null, ['United Airlines']]
    ]);

    const result = CodeshareDecoder.decode(data);
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      airline_code: 'AA',
      flight_number: 123,
      airline_name: 'American Airlines'
    });
    expect(result[1]).toEqual({
      airline_code: 'UA',
      flight_number: 456,
      airline_name: 'United Airlines'
    });
  });
});

describe('FlightDecoder', () => {
  test('should decode flight data', () => {
    const data = new NLData([
      [
        null, null, 'American Airlines', 'JFK', 'John F. Kennedy International Airport',
        'LAX', 'Los Angeles International Airport', null, [10, 30], null, [14, 45],
        255, null, null, '32"', null, null, null, 'Boeing 737',
        null, [2025, 1, 1], [2025, 1, 1], ['AA', '123', null, 'American Airlines']
      ]
    ]);

    const result = FlightDecoder.decode(data);
    
    expect(result).toHaveLength(1);
    expect(result[0].airline).toBe('AA');
    expect(result[0].airline_name).toBe('American Airlines');
    expect(result[0].flight_number).toBe('123');
    expect(result[0].operator).toBe('American Airlines');
    expect(result[0].departure_airport).toBe('JFK');
    expect(result[0].arrival_airport).toBe('LAX');
  });
});

describe('ResultDecoder', () => {
  test('should decode complete result data', () => {
    const mockData = [
      null, // unknown_1
      null, // airport_details
      [ // best - simplified structure
        []
      ],
      [ // other - simplified structure
        []
      ]
    ];

    const result = ResultDecoder.decode(mockData);
    
    expect(result.raw).toBe(mockData);
    expect(result.best).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });

  test('should throw error for non-array root', () => {
    expect(() => ResultDecoder.decode({} as any)).toThrow('Root data must be list type');
  });
});