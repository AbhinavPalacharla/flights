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
  const queryLower = query.toLowerCase().replace(/\s+/g, '_');
  
  for (const [name, code] of Object.entries(Airport)) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes(queryLower) || 
        nameLower.includes(query.toLowerCase().replace(/\s+/g, '')) ||
        code.toLowerCase().includes(query.toLowerCase())) {
      results.push(code as Airport);
    }
  }
  
  return results;
}