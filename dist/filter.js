"use strict";
/**
 * Filter creation and TFS data generation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFilter = createFilter;
const flight_data_1 = require("./flight-data");
function createFilter(params) {
    // Apply max_stops to all flight data entries
    if (params.max_stops !== undefined) {
        for (const fd of params.flight_data) {
            fd.max_stops = params.max_stops;
        }
    }
    return flight_data_1.TFSDataImpl.fromInterface({
        flight_data: params.flight_data,
        trip: params.trip,
        passengers: params.passengers,
        seat: params.seat,
        max_stops: params.max_stops
    });
}
//# sourceMappingURL=filter.js.map