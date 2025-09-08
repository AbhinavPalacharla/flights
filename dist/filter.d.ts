/**
 * Filter creation and TFS data generation
 */
import { FlightDataImpl, TFSDataImpl, PassengersImpl } from './flight-data';
import { TripType, SeatType } from './types';
export declare function createFilter(params: {
    flight_data: FlightDataImpl[];
    trip: TripType;
    passengers: PassengersImpl;
    seat: SeatType;
    max_stops?: number;
}): TFSDataImpl;
//# sourceMappingURL=filter.d.ts.map