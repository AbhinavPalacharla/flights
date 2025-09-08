/**
 * Airport search functionality
 */

import { searchAirport as searchAirportFromData } from './airports';

export function searchAirport(query: string): Array<{code: string, name: string, city: string, country: string}> {
  /**
   * Search for airports.
   * 
   * @param query - The search query
   * @returns A list of airports matching the query with detailed information
   */
  return searchAirportFromData(query);
}