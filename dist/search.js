"use strict";
/**
 * Airport search functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAirport = searchAirport;
const airports_1 = require("./airports");
function searchAirport(query) {
    /**
     * Search for airports.
     *
     * @param query - The search query
     * @returns A list of airports matching the query
     */
    const results = [];
    const queryLower = query.toLowerCase().replace(/\s+/g, '_');
    for (const [name, code] of Object.entries(airports_1.Airport)) {
        const nameLower = name.toLowerCase();
        if (nameLower.includes(queryLower) ||
            nameLower.includes(query.toLowerCase().replace(/\s+/g, '')) ||
            code.toLowerCase().includes(query.toLowerCase())) {
            results.push(code);
        }
    }
    return results;
}
//# sourceMappingURL=search.js.map