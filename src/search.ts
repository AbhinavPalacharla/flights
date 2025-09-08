/**
 * Airport search functionality
 */

import { Airport } from './airports';

export function searchAirport(query: string): Airport[] {
  /**
   * Search for airports.
   * 
   * @param query - The search query
   * @returns A list of airports matching the query
   */
  const results: Airport[] = [];
  const queryLower = query.toLowerCase();
  
  for (const [name, code] of Object.entries(Airport)) {
    if (name.toLowerCase().includes(queryLower)) {
      results.push(code as Airport);
    }
  }
  
  return results;
}