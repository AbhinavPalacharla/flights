/**
 * Filter creation and TFS data generation
 */

import { FlightDataImpl, TFSDataImpl } from './flight-data';
import { FlightData, Passengers, TripType, SeatType } from './types';

export function createFilter(params: {
  flight_data: FlightDataImpl[];
  trip: TripType;
  passengers: PassengersImpl;
  seat: SeatType;
  max_stops?: number;
}): TFSDataImpl {
  // Apply max_stops to all flight data entries
  if (params.max_stops !== undefined) {
    for (const fd of params.flight_data) {
      (fd as any).max_stops = params.max_stops;
    }
  }

  return TFSDataImpl.fromInterface({
    flight_data: params.flight_data,
    trip: params.trip,
    passengers: params.passengers,
    seat: params.seat,
    max_stops: params.max_stops
  });
}