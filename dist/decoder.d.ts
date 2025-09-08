/**
 * Decoder logic for parsing flight data from JavaScript responses
 */
import { Codeshare, FlightDetail, Layover, ItinerarySummary, Itinerary, DecodedResult } from './types';
type NLBaseType = number | string | null | NLBaseType[];
export declare class NLData {
    data: NLBaseType[];
    constructor(data: NLBaseType[]);
    get(decodePath: number | number[]): NLBaseType;
    get length(): number;
}
declare abstract class Decoder {
    static decodeEl(el: NLData, fields: Record<string, DecoderKey>): Record<string, any>;
}
declare class DecoderKey<T = any> {
    decodePath: number[];
    decoder?: ((data: NLData) => T) | undefined;
    constructor(decodePath: number[], decoder?: ((data: NLData) => T) | undefined);
    decode(root: NLData): T | NLBaseType;
}
export declare class CodeshareDecoder extends Decoder {
    static AIRLINE_CODE: DecoderKey<string>;
    static FLIGHT_NUMBER: DecoderKey<string>;
    static AIRLINE_NAME: DecoderKey<string[]>;
    static decode(root: NLData): Codeshare[];
}
export declare class FlightDecoder extends Decoder {
    static OPERATOR: DecoderKey<string>;
    static DEPARTURE_AIRPORT: DecoderKey<string>;
    static DEPARTURE_AIRPORT_NAME: DecoderKey<string>;
    static ARRIVAL_AIRPORT: DecoderKey<string>;
    static ARRIVAL_AIRPORT_NAME: DecoderKey<string>;
    static DEPARTURE_TIME: DecoderKey<[number, number]>;
    static ARRIVAL_TIME: DecoderKey<[number, number]>;
    static TRAVEL_TIME: DecoderKey<number>;
    static SEAT_PITCH_SHORT: DecoderKey<string>;
    static AIRCRAFT: DecoderKey<string>;
    static DEPARTURE_DATE: DecoderKey<[number, number, number]>;
    static ARRIVAL_DATE: DecoderKey<[number, number, number]>;
    static AIRLINE: DecoderKey<string>;
    static AIRLINE_NAME: DecoderKey<string>;
    static FLIGHT_NUMBER: DecoderKey<string>;
    static CODESHARES: DecoderKey<Codeshare[]>;
    static decode(root: NLData): FlightDetail[];
}
export declare class LayoverDecoder extends Decoder {
    static MINUTES: DecoderKey<number>;
    static DEPARTURE_AIRPORT: DecoderKey<string>;
    static DEPARTURE_AIRPORT_NAME: DecoderKey<string>;
    static DEPARTURE_AIRPORT_CITY: DecoderKey<string>;
    static ARRIVAL_AIRPORT: DecoderKey<string>;
    static ARRIVAL_AIRPORT_NAME: DecoderKey<string>;
    static ARRIVAL_AIRPORT_CITY: DecoderKey<string>;
    static decode(root: NLData): Layover[];
}
export declare class ItineraryDecoder extends Decoder {
    static AIRLINE_CODE: DecoderKey<string>;
    static AIRLINE_NAMES: DecoderKey<string[]>;
    static FLIGHTS: DecoderKey<FlightDetail[]>;
    static DEPARTURE_AIRPORT: DecoderKey<string>;
    static DEPARTURE_DATE: DecoderKey<[number, number, number]>;
    static DEPARTURE_TIME: DecoderKey<[number, number]>;
    static ARRIVAL_AIRPORT: DecoderKey<string>;
    static ARRIVAL_DATE: DecoderKey<[number, number, number]>;
    static ARRIVAL_TIME: DecoderKey<[number, number]>;
    static TRAVEL_TIME: DecoderKey<number>;
    static LAYOVERS: DecoderKey<Layover[]>;
    static ITINERARY_SUMMARY: DecoderKey<ItinerarySummary>;
    static decode(root: NLData): Itinerary[];
}
export declare class ResultDecoder extends Decoder {
    static BEST: DecoderKey<Itinerary[]>;
    static OTHER: DecoderKey<Itinerary[]>;
    static decode(root: any[]): DecodedResult;
}
export {};
//# sourceMappingURL=decoder.d.ts.map