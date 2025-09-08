/**
 * Decoder logic for parsing flight data from JavaScript responses
 */

import { 
  Codeshare, 
  FlightDetail, 
  Layover, 
  ItinerarySummary, 
  Itinerary, 
  DecodedResult 
} from './types';
import { ItinerarySummaryImpl } from './flight-data';

type NLBaseType = number | string | null | NLBaseType[];

class NLData {
  constructor(public data: NLBaseType[]) {}

  get(decodePath: number | number[]): NLBaseType {
    if (typeof decodePath === 'number') {
      return this.data[decodePath];
    }
    
    let it: NLBaseType = this.data;
    for (const index of decodePath) {
      if (!Array.isArray(it)) {
        throw new Error(`Found non list type while trying to decode ${decodePath}`);
      }
      if (index >= it.length) {
        throw new Error(`Trying to traverse to index out of range when decoding ${decodePath}`);
      }
      it = it[index];
    }
    return it;
  }

  get length(): number {
    return this.data.length;
  }
}

abstract class Decoder {
  static decodeEl(el: NLData, fields: Record<string, DecoderKey>): Record<string, any> {
    const decoded: Record<string, any> = {};
    for (const [fieldName, keyDecoder] of Object.entries(fields)) {
      const value = keyDecoder.decode(el);
      decoded[fieldName.toLowerCase()] = value;
    }
    return decoded;
  }
}

class DecoderKey<T = any> {
  constructor(
    public decodePath: number[],
    public decoder?: (data: NLData) => T
  ) {}

  decode(root: NLData): T | NLBaseType {
    const data = root.get(this.decodePath);
    if (Array.isArray(data) && this.decoder) {
      return this.decoder(new NLData(data));
    }
    return data as T;
  }
}

export class CodeshareDecoder extends Decoder {
  static AIRLINE_CODE = new DecoderKey<string>([0]);
  static FLIGHT_NUMBER = new DecoderKey<string>([1]);
  static AIRLINE_NAME = new DecoderKey<string[]>([3]);

  static decode(root: NLData): Codeshare[] {
    const fields = {
      AIRLINE_CODE: CodeshareDecoder.AIRLINE_CODE,
      FLIGHT_NUMBER: CodeshareDecoder.FLIGHT_NUMBER,
      AIRLINE_NAME: CodeshareDecoder.AIRLINE_NAME
    };

    return root.data.map((el: any) => {
      const decoded = Decoder.decodeEl(new NLData(el), fields);
      return {
        airline_code: decoded.airline_code,
        flight_number: parseInt(decoded.flight_number),
        airline_name: decoded.airline_name[0] || ''
      };
    });
  }
}

export class FlightDecoder extends Decoder {
  static OPERATOR = new DecoderKey<string>([2]);
  static DEPARTURE_AIRPORT = new DecoderKey<string>([3]);
  static DEPARTURE_AIRPORT_NAME = new DecoderKey<string>([4]);
  static ARRIVAL_AIRPORT = new DecoderKey<string>([5]);
  static ARRIVAL_AIRPORT_NAME = new DecoderKey<string>([6]);
  static DEPARTURE_TIME = new DecoderKey<[number, number]>([8]);
  static ARRIVAL_TIME = new DecoderKey<[number, number]>([10]);
  static TRAVEL_TIME = new DecoderKey<number>([11]);
  static SEAT_PITCH_SHORT = new DecoderKey<string>([14]);
  static AIRCRAFT = new DecoderKey<string>([17]);
  static DEPARTURE_DATE = new DecoderKey<[number, number, number]>([20]);
  static ARRIVAL_DATE = new DecoderKey<[number, number, number]>([21]);
  static AIRLINE = new DecoderKey<string>([22, 0]);
  static AIRLINE_NAME = new DecoderKey<string>([22, 3]);
  static FLIGHT_NUMBER = new DecoderKey<string>([22, 1]);
  static CODESHARES = new DecoderKey<Codeshare[]>([15], CodeshareDecoder.decode);

  static decode(root: NLData): FlightDetail[] {
    const fields = {
      OPERATOR: FlightDecoder.OPERATOR,
      DEPARTURE_AIRPORT: FlightDecoder.DEPARTURE_AIRPORT,
      DEPARTURE_AIRPORT_NAME: FlightDecoder.DEPARTURE_AIRPORT_NAME,
      ARRIVAL_AIRPORT: FlightDecoder.ARRIVAL_AIRPORT,
      ARRIVAL_AIRPORT_NAME: FlightDecoder.ARRIVAL_AIRPORT_NAME,
      DEPARTURE_TIME: FlightDecoder.DEPARTURE_TIME,
      ARRIVAL_TIME: FlightDecoder.ARRIVAL_TIME,
      TRAVEL_TIME: FlightDecoder.TRAVEL_TIME,
      SEAT_PITCH_SHORT: FlightDecoder.SEAT_PITCH_SHORT,
      AIRCRAFT: FlightDecoder.AIRCRAFT,
      DEPARTURE_DATE: FlightDecoder.DEPARTURE_DATE,
      ARRIVAL_DATE: FlightDecoder.ARRIVAL_DATE,
      AIRLINE: FlightDecoder.AIRLINE,
      AIRLINE_NAME: FlightDecoder.AIRLINE_NAME,
      FLIGHT_NUMBER: FlightDecoder.FLIGHT_NUMBER,
      CODESHARES: FlightDecoder.CODESHARES
    };

    return root.data.map((el: any) => {
      const decoded = Decoder.decodeEl(new NLData(el), fields);
      return {
        airline: decoded.airline,
        airline_name: decoded.airline_name,
        flight_number: decoded.flight_number,
        operator: decoded.operator,
        codeshares: decoded.codeshares || [],
        aircraft: decoded.aircraft || '',
        departure_airport: decoded.departure_airport,
        departure_airport_name: decoded.departure_airport_name,
        arrival_airport: decoded.arrival_airport,
        arrival_airport_name: decoded.arrival_airport_name,
        departure_date: decoded.departure_date,
        arrival_date: decoded.arrival_date,
        departure_time: decoded.departure_time,
        arrival_time: decoded.arrival_time,
        travel_time: decoded.travel_time,
        seat_pitch_short: decoded.seat_pitch_short || ''
      };
    });
  }
}

export class LayoverDecoder extends Decoder {
  static MINUTES = new DecoderKey<number>([0]);
  static DEPARTURE_AIRPORT = new DecoderKey<string>([1]);
  static DEPARTURE_AIRPORT_NAME = new DecoderKey<string>([4]);
  static DEPARTURE_AIRPORT_CITY = new DecoderKey<string>([5]);
  static ARRIVAL_AIRPORT = new DecoderKey<string>([2]);
  static ARRIVAL_AIRPORT_NAME = new DecoderKey<string>([6]);
  static ARRIVAL_AIRPORT_CITY = new DecoderKey<string>([7]);

  static decode(root: NLData): Layover[] {
    const fields = {
      MINUTES: LayoverDecoder.MINUTES,
      DEPARTURE_AIRPORT: LayoverDecoder.DEPARTURE_AIRPORT,
      DEPARTURE_AIRPORT_NAME: LayoverDecoder.DEPARTURE_AIRPORT_NAME,
      DEPARTURE_AIRPORT_CITY: LayoverDecoder.DEPARTURE_AIRPORT_CITY,
      ARRIVAL_AIRPORT: LayoverDecoder.ARRIVAL_AIRPORT,
      ARRIVAL_AIRPORT_NAME: LayoverDecoder.ARRIVAL_AIRPORT_NAME,
      ARRIVAL_AIRPORT_CITY: LayoverDecoder.ARRIVAL_AIRPORT_CITY
    };

    return root.data.map((el: any) => {
      const decoded = Decoder.decodeEl(new NLData(el), fields);
      return {
        minutes: decoded.minutes,
        departure_airport: decoded.departure_airport,
        departure_airport_name: decoded.departure_airport_name,
        departure_airport_city: decoded.departure_airport_city,
        arrival_airport: decoded.arrival_airport,
        arrival_airport_name: decoded.arrival_airport_name,
        arrival_airport_city: decoded.arrival_airport_city
      };
    });
  }
}

export class ItineraryDecoder extends Decoder {
  static AIRLINE_CODE = new DecoderKey<string>([0, 0]);
  static AIRLINE_NAMES = new DecoderKey<string[]>([0, 1]);
  static FLIGHTS = new DecoderKey<FlightDetail[]>([0, 2], FlightDecoder.decode);
  static DEPARTURE_AIRPORT = new DecoderKey<string>([0, 3]);
  static DEPARTURE_DATE = new DecoderKey<[number, number, number]>([0, 4]);
  static DEPARTURE_TIME = new DecoderKey<[number, number]>([0, 5]);
  static ARRIVAL_AIRPORT = new DecoderKey<string>([0, 6]);
  static ARRIVAL_DATE = new DecoderKey<[number, number, number]>([0, 7]);
  static ARRIVAL_TIME = new DecoderKey<[number, number]>([0, 8]);
  static TRAVEL_TIME = new DecoderKey<number>([0, 9]);
  static LAYOVERS = new DecoderKey<Layover[]>([0, 13], LayoverDecoder.decode);
  static ITINERARY_SUMMARY = new DecoderKey<ItinerarySummary>([1], (data: NLData) => {
    // This would need proper protobuf deserialization
    // For now, return a placeholder
    return {
      flights: '',
      price: 0,
      currency: 'USD'
    };
  });

  static decode(root: NLData): Itinerary[] {
    const fields = {
      AIRLINE_CODE: ItineraryDecoder.AIRLINE_CODE,
      AIRLINE_NAMES: ItineraryDecoder.AIRLINE_NAMES,
      FLIGHTS: ItineraryDecoder.FLIGHTS,
      DEPARTURE_AIRPORT: ItineraryDecoder.DEPARTURE_AIRPORT,
      DEPARTURE_DATE: ItineraryDecoder.DEPARTURE_DATE,
      DEPARTURE_TIME: ItineraryDecoder.DEPARTURE_TIME,
      ARRIVAL_AIRPORT: ItineraryDecoder.ARRIVAL_AIRPORT,
      ARRIVAL_DATE: ItineraryDecoder.ARRIVAL_DATE,
      ARRIVAL_TIME: ItineraryDecoder.ARRIVAL_TIME,
      TRAVEL_TIME: ItineraryDecoder.TRAVEL_TIME,
      LAYOVERS: ItineraryDecoder.LAYOVERS,
      ITINERARY_SUMMARY: ItineraryDecoder.ITINERARY_SUMMARY
    };

    return root.data.map((el: any) => {
      const decoded = Decoder.decodeEl(new NLData(el), fields);
      return {
        airline_code: decoded.airline_code,
        airline_names: decoded.airline_names || [],
        flights: decoded.flights || [],
        layovers: decoded.layovers || [],
        travel_time: decoded.travel_time,
        departure_airport: decoded.departure_airport,
        arrival_airport: decoded.arrival_airport,
        departure_date: decoded.departure_date,
        arrival_date: decoded.arrival_date,
        departure_time: decoded.departure_time,
        arrival_time: decoded.arrival_time,
        itinerary_summary: decoded.itinerary_summary
      };
    });
  }
}

export class ResultDecoder extends Decoder {
  static BEST = new DecoderKey<Itinerary[]>([2, 0], ItineraryDecoder.decode);
  static OTHER = new DecoderKey<Itinerary[]>([3, 0], ItineraryDecoder.decode);

  static decode(root: any[]): DecodedResult {
    if (!Array.isArray(root)) {
      throw new Error('Root data must be list type');
    }

    const nlRoot = new NLData(root);
    const fields = {
      BEST: ResultDecoder.BEST,
      OTHER: ResultDecoder.OTHER
    };

    const decoded = Decoder.decodeEl(nlRoot, fields);
    return {
      raw: root,
      best: decoded.best || [],
      other: decoded.other || []
    };
  }
}