"use strict";
/**
 * Flight data classes and implementations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItinerarySummaryImpl = exports.TFSDataImpl = exports.PassengersImpl = exports.FlightDataImpl = void 0;
const AIRLINE_ALLIANCES = ["SKYTEAM", "STAR_ALLIANCE", "ONEWORLD"];
class FlightDataImpl {
    constructor(params) {
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
                    throw new Error(`Invalid airline code: ${airline}. ` +
                        `Airline codes should be 2 characters long or in the list of airline alliances: ${AIRLINE_ALLIANCES}`);
                }
                this.airlines.push(airlineUpper);
            }
        }
    }
    toString() {
        return `FlightData(date=${this.date}, from_airport=${this.from_airport}, to_airport=${this.to_airport}, max_stops=${this.max_stops}, airlines=${this.airlines})`;
    }
}
exports.FlightDataImpl = FlightDataImpl;
class PassengersImpl {
    constructor(params = {}) {
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
    toString() {
        return `Passengers(adults=${this.adults}, children=${this.children}, infants_in_seat=${this.infants_in_seat}, infants_on_lap=${this.infants_on_lap})`;
    }
}
exports.PassengersImpl = PassengersImpl;
class TFSDataImpl {
    constructor(params) {
        this.flight_data = params.flight_data;
        this.seat = params.seat;
        this.trip = params.trip;
        this.passengers = params.passengers;
        this.max_stops = params.max_stops;
    }
    static fromInterface(params) {
        return new TFSDataImpl(params);
    }
    toString() {
        return `TFSData(flight_data=${this.flight_data}, max_stops=${this.max_stops})`;
    }
}
exports.TFSDataImpl = TFSDataImpl;
class ItinerarySummaryImpl {
    constructor(flights, price, currency) {
        this.flights = flights;
        this.price = price;
        this.currency = currency;
    }
    static fromBase64(base64String) {
        // This would need to be implemented with proper protobuf deserialization
        // For now, return a placeholder
        throw new Error("ItinerarySummary.fromBase64 not yet implemented");
    }
}
exports.ItinerarySummaryImpl = ItinerarySummaryImpl;
//# sourceMappingURL=flight-data.js.map