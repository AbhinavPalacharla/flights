/**
 * Flight data classes and implementations
 */
import { Airport } from './airports';
import { FlightData, Passengers, TripType, SeatType } from './types';
export declare class FlightDataImpl implements FlightData {
    readonly date: string;
    readonly from_airport: string;
    readonly to_airport: string;
    readonly max_stops?: number;
    readonly airlines?: string[];
    constructor(params: {
        date: string;
        from_airport: Airport | string;
        to_airport: Airport | string;
        max_stops?: number;
        airlines?: string[];
    });
    toString(): string;
}
export declare class PassengersImpl implements Passengers {
    readonly adults: number;
    readonly children: number;
    readonly infants_in_seat: number;
    readonly infants_on_lap: number;
    constructor(params?: {
        adults?: number;
        children?: number;
        infants_in_seat?: number;
        infants_on_lap?: number;
    });
    toString(): string;
}
export declare class TFSDataImpl {
    readonly flight_data: FlightDataImpl[];
    readonly seat: SeatType;
    readonly trip: TripType;
    readonly passengers: PassengersImpl;
    readonly max_stops?: number;
    constructor(params: {
        flight_data: FlightDataImpl[];
        seat: SeatType;
        trip: TripType;
        passengers: PassengersImpl;
        max_stops?: number;
    });
    static fromInterface(params: {
        flight_data: FlightDataImpl[];
        trip: TripType;
        passengers: PassengersImpl;
        seat: SeatType;
        max_stops?: number;
    }): TFSDataImpl;
    toString(): string;
}
export declare class ItinerarySummaryImpl {
    readonly flights: string;
    readonly price: number;
    readonly currency: string;
    constructor(flights: string, price: number, currency: string);
    static fromBase64(base64String: string): ItinerarySummaryImpl;
}
//# sourceMappingURL=flight-data.d.ts.map