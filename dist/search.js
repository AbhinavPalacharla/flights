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
     * @returns A list of airports matching the query with detailed information
     */
    return (0, airports_1.searchAirport)(query);
}
//# sourceMappingURL=search.js.map