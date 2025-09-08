/**
 * Main entry point for fast-flights TypeScript library
 */

// Export types
export * from './types';

// Export classes
export { FlightDataImpl as FlightData } from './flight-data';
export { PassengersImpl as Passengers } from './flight-data';
export { TFSDataImpl as TFSData } from './flight-data';
export { CookiesImpl as Cookies } from './cookies';

// Export enums
export { Airport } from './airports';

// Export functions
export { createFilter } from './filter';
export { searchAirport } from './search';
export { getFlightsFromFilter, getFlights } from './core';

// Export HTTP clients and fallback methods
export { HttpClient, HttpResponse, client } from './http-client';
export { BrightDataClient, brightDataFetch } from './bright-data';
export { LocalPlaywrightClient, localPlaywrightFetch } from './local-playwright';
export { FallbackPlaywrightClient, fallbackPlaywrightFetch } from './fallback-playwright';

// Re-export specific types for convenience
export type {
  TripType,
  SeatType,
  FetchMode,
  DataSource,
  PriceLevel,
  Flight,
  Result,
  DecodedResult,
  FlightData as FlightDataInterface,
  Passengers as PassengersInterface
} from './types';