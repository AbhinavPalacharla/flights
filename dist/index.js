"use strict";
/**
 * Main entry point for fast-flights TypeScript library
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackPlaywrightFetch = exports.FallbackPlaywrightClient = exports.localPlaywrightFetch = exports.LocalPlaywrightClient = exports.brightDataFetch = exports.BrightDataClient = exports.client = exports.HttpResponse = exports.HttpClient = exports.getFlights = exports.getFlightsFromFilter = exports.searchAirport = exports.createFilter = exports.Airport = exports.Cookies = exports.TFSData = exports.Passengers = exports.FlightData = void 0;
// Export types
__exportStar(require("./types"), exports);
// Export classes
var flight_data_1 = require("./flight-data");
Object.defineProperty(exports, "FlightData", { enumerable: true, get: function () { return flight_data_1.FlightDataImpl; } });
var flight_data_2 = require("./flight-data");
Object.defineProperty(exports, "Passengers", { enumerable: true, get: function () { return flight_data_2.PassengersImpl; } });
var flight_data_3 = require("./flight-data");
Object.defineProperty(exports, "TFSData", { enumerable: true, get: function () { return flight_data_3.TFSDataImpl; } });
var cookies_1 = require("./cookies");
Object.defineProperty(exports, "Cookies", { enumerable: true, get: function () { return cookies_1.CookiesImpl; } });
// Export enums
var airports_1 = require("./airports");
Object.defineProperty(exports, "Airport", { enumerable: true, get: function () { return airports_1.Airport; } });
// Export functions
var filter_1 = require("./filter");
Object.defineProperty(exports, "createFilter", { enumerable: true, get: function () { return filter_1.createFilter; } });
var search_1 = require("./search");
Object.defineProperty(exports, "searchAirport", { enumerable: true, get: function () { return search_1.searchAirport; } });
var core_1 = require("./core");
Object.defineProperty(exports, "getFlightsFromFilter", { enumerable: true, get: function () { return core_1.getFlightsFromFilter; } });
Object.defineProperty(exports, "getFlights", { enumerable: true, get: function () { return core_1.getFlights; } });
// Export HTTP clients and fallback methods
var http_client_1 = require("./http-client");
Object.defineProperty(exports, "HttpClient", { enumerable: true, get: function () { return http_client_1.HttpClient; } });
Object.defineProperty(exports, "HttpResponse", { enumerable: true, get: function () { return http_client_1.HttpResponse; } });
Object.defineProperty(exports, "client", { enumerable: true, get: function () { return http_client_1.client; } });
var bright_data_1 = require("./bright-data");
Object.defineProperty(exports, "BrightDataClient", { enumerable: true, get: function () { return bright_data_1.BrightDataClient; } });
Object.defineProperty(exports, "brightDataFetch", { enumerable: true, get: function () { return bright_data_1.brightDataFetch; } });
var local_playwright_1 = require("./local-playwright");
Object.defineProperty(exports, "LocalPlaywrightClient", { enumerable: true, get: function () { return local_playwright_1.LocalPlaywrightClient; } });
Object.defineProperty(exports, "localPlaywrightFetch", { enumerable: true, get: function () { return local_playwright_1.localPlaywrightFetch; } });
var fallback_playwright_1 = require("./fallback-playwright");
Object.defineProperty(exports, "FallbackPlaywrightClient", { enumerable: true, get: function () { return fallback_playwright_1.FallbackPlaywrightClient; } });
Object.defineProperty(exports, "fallbackPlaywrightFetch", { enumerable: true, get: function () { return fallback_playwright_1.fallbackPlaywrightFetch; } });
//# sourceMappingURL=index.js.map