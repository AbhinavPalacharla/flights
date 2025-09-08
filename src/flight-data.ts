/**
 * Flight data classes and implementations
 */

import { Airport } from './airports';
import { FlightData, Passengers, TripType, SeatType } from './types';

const AIRLINE_ALLIANCES = ["SKYTEAM", "STAR_ALLIANCE", "ONEWORLD"];

export class FlightDataImpl implements FlightData {
  public readonly date: string;
  public readonly from_airport: string;
  public readonly to_airport: string;
  public readonly max_stops?: number;
  public readonly airlines?: string[];

  constructor(params: {
    date: string;
    from_airport: Airport | string;
    to_airport: Airport | string;
    max_stops?: number;
    airlines?: string[];
  }) {
    this.date = params.date;
    this.from_airport = typeof params.from_airport === 'string' 
      ? params.from_airport 
      : params.from_airport;
    this.to_airport = typeof params.to_airport === 'string' 
      ? params.to_airport 
      : params.to_airport;
    this.max_stops = params.max_stops;
    
    if (params.airlines) {
      this.airlines = [];
      for (const airline of params.airlines) {
        const airlineUpper = airline.toUpperCase();
        if (!(airlineUpper.length === 2 || AIRLINE_ALLIANCES.includes(airlineUpper))) {
          throw new Error(
            `Invalid airline code: ${airline}. ` +
            `Airline codes should be 2 characters long or in the list of airline alliances: ${AIRLINE_ALLIANCES}`
          );
        }
        this.airlines.push(airlineUpper);
      }
    }
  }

  toString(): string {
    return `FlightData(date=${this.date}, from_airport=${this.from_airport}, to_airport=${this.to_airport}, max_stops=${this.max_stops}, airlines=${this.airlines})`;
  }
}

export class PassengersImpl implements Passengers {
  public readonly adults: number;
  public readonly children: number;
  public readonly infants_in_seat: number;
  public readonly infants_on_lap: number;

  constructor(params: {
    adults?: number;
    children?: number;
    infants_in_seat?: number;
    infants_on_lap?: number;
  } = {}) {
    const { adults = 0, children = 0, infants_in_seat = 0, infants_on_lap = 0 } = params;
    
    const total = adults + children + infants_in_seat + infants_on_lap;
    if (total > 9) {
      throw new Error("Too many passengers (> 9)");
    }
    
    if (infants_on_lap > adults) {
      throw new Error("You must have at least one adult per infant on lap");
    }

    this.adults = adults;
    this.children = children;
    this.infants_in_seat = infants_in_seat;
    this.infants_on_lap = infants_on_lap;
  }

  toString(): string {
    return `Passengers(adults=${this.adults}, children=${this.children}, infants_in_seat=${this.infants_in_seat}, infants_on_lap=${this.infants_on_lap})`;
  }
}

export class TFSDataImpl {
  public readonly flight_data: FlightDataImpl[];
  public readonly seat: SeatType;
  public readonly trip: TripType;
  public readonly passengers: PassengersImpl;
  public readonly max_stops?: number;

  constructor(params: {
    flight_data: FlightDataImpl[];
    seat: SeatType;
    trip: TripType;
    passengers: PassengersImpl;
    max_stops?: number;
  }) {
    this.flight_data = params.flight_data;
    this.seat = params.seat;
    this.trip = params.trip;
    this.passengers = params.passengers;
    this.max_stops = params.max_stops;
  }

  static fromInterface(params: {
    flight_data: FlightDataImpl[];
    trip: TripType;
    passengers: PassengersImpl;
    seat: SeatType;
    max_stops?: number;
  }): TFSDataImpl {
    return new TFSDataImpl(params);
  }

  toString(): string {
    return `TFSData(flight_data=${this.flight_data}, max_stops=${this.max_stops})`;
  }
}

export class ItinerarySummaryImpl {
  public readonly flights: string;
  public readonly price: number;
  public readonly currency: string;

  constructor(flights: string, price: number, currency: string) {
    this.flights = flights;
    this.price = price;
    this.currency = currency;
  }

  static fromBase64(base64String: string): ItinerarySummaryImpl {
    try {
      // Decode base64 string
      const buffer = Buffer.from(base64String, 'base64');
      
      // For now, we'll create a simple implementation
      // In a full implementation, this would use proper protobuf deserialization
      // based on the ItinerarySummary protobuf definition
      
      // Parse the buffer as a simple structure
      // This is a simplified implementation - in reality, you'd need to
      // properly deserialize the protobuf message
      const data = JSON.parse(buffer.toString('utf8'));
      
      return new ItinerarySummaryImpl(
        data.flights || '',
        data.price || 0,
        data.currency || 'USD'
      );
    } catch (error) {
      // Fallback to default values if parsing fails
      return new ItinerarySummaryImpl('', 0, 'USD');
    }
  }
}