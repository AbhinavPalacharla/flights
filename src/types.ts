/**
 * Core type definitions for fast-flights TypeScript library
 */

export type TripType = "round-trip" | "one-way" | "multi-city";
export type SeatType = "economy" | "premium-economy" | "business" | "first";
export type FetchMode = "common" | "fallback" | "force-fallback" | "local" | "bright-data";
export type DataSource = "html" | "js";
export type PriceLevel = "low" | "typical" | "high";

export interface FlightData {
  date: string;
  from_airport: string;
  to_airport: string;
  max_stops?: number;
  airlines?: string[];
}

export interface Passengers {
  adults: number;
  children: number;
  infants_in_seat: number;
  infants_on_lap: number;
}

export interface Flight {
  is_best: boolean;
  name: string;
  departure: string;
  arrival: string;
  arrival_time_ahead: string;
  duration: string;
  stops: number | "Unknown";
  delay?: string;
  price: string;
}

export interface Result {
  current_price: PriceLevel;
  flights: Flight[];
}

// Decoder types for JS data source
export interface Codeshare {
  airline_code: string;
  flight_number: number;
  airline_name: string;
}

export interface FlightDetail {
  airline: string;
  airline_name: string;
  flight_number: string;
  operator: string;
  codeshares: Codeshare[];
  aircraft: string;
  departure_airport: string;
  departure_airport_name: string;
  arrival_airport: string;
  arrival_airport_name: string;
  departure_date: [number, number, number];
  arrival_date: [number, number, number];
  departure_time: [number, number];
  arrival_time: [number, number];
  travel_time: number;
  seat_pitch_short: string;
}

export interface Layover {
  minutes: number;
  departure_airport: string;
  departure_airport_name: string;
  departure_airport_city: string;
  arrival_airport: string;
  arrival_airport_name: string;
  arrival_airport_city: string;
}

export interface ItinerarySummary {
  flights: string;
  price: number;
  currency: string;
}

export interface Itinerary {
  airline_code: string;
  airline_names: string[];
  flights: FlightDetail[];
  layovers: Layover[];
  travel_time: number;
  departure_airport: string;
  arrival_airport: string;
  departure_date: [number, number, number];
  arrival_date: [number, number, number];
  departure_time: [number, number];
  arrival_time: [number, number];
  itinerary_summary: ItinerarySummary;
}

export interface DecodedResult {
  raw: any[];
  best: Itinerary[];
  other: Itinerary[];
}

export interface Cookies {
  gws: string;
  locale: string;
  timestamp: number;
}

export interface TFSData {
  flight_data: FlightData[];
  seat: SeatType;
  trip: TripType;
  passengers: Passengers;
  max_stops?: number;
}