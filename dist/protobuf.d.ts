/**
 * Protobuf definitions and serialization logic
 */
import { FlightData, Passengers, TripType, SeatType } from './types';
export declare function loadProtobufDefinitions(): Promise<void>;
export declare function createFlightDataProto(flightData: FlightData): any;
export declare function createPassengersProto(passengers: Passengers): number[];
export declare function getSeatTypeProto(seat: SeatType): number;
export declare function getTripTypeProto(trip: TripType): number;
export declare function createInfoProto(flightDataList: FlightData[], seat: SeatType, trip: TripType, passengers: Passengers, maxStops?: number): any;
export declare function createCookiesProto(gws: string, locale: string, timestamp: number): any;
export declare function serializeToBase64(message: any): string;
export declare function deserializeFromBase64<T>(base64: string, messageType: any): T;
//# sourceMappingURL=protobuf.d.ts.map