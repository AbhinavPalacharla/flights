"use strict";
/**
 * Protobuf definitions and serialization logic
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProtobufDefinitions = loadProtobufDefinitions;
exports.createFlightDataProto = createFlightDataProto;
exports.createPassengersProto = createPassengersProto;
exports.getSeatTypeProto = getSeatTypeProto;
exports.getTripTypeProto = getTripTypeProto;
exports.createInfoProto = createInfoProto;
exports.createCookiesProto = createCookiesProto;
exports.serializeToBase64 = serializeToBase64;
exports.deserializeFromBase64 = deserializeFromBase64;
const protobuf = __importStar(require("protobufjs"));
// Protobuf message definitions
const flightsProto = `
syntax = "proto3";

message Airport {
  string airport = 2;
}

message FlightData {
  string date = 2;
  Airport from_flight = 13;
  Airport to_flight = 14;
  optional int32 max_stops = 5;
  repeated string airlines = 6;
}

enum Seat {
  UNKNOWN_SEAT = 0;
  ECONOMY = 1;
  PREMIUM_ECONOMY = 2;
  BUSINESS = 3;
  FIRST = 4;
}

enum Trip {
  UNKNOWN_TRIP = 0;
  ROUND_TRIP = 1;
  ONE_WAY = 2;
  MULTI_CITY = 3;
}

enum Passenger {
  UNKNOWN_PASSENGER = 0;
  ADULT = 1;
  CHILD = 2;
  INFANT_IN_SEAT = 3;
  INFANT_ON_LAP = 4;
}

message Info {
  repeated FlightData data = 3;
  Seat seat = 9;
  repeated Passenger passengers = 8;
  Trip trip = 19;
}

message Price {
  int32 price = 1;
  string currency = 3;
}

message ItinerarySummary {
  string flights = 2;
  Price price = 3;
}
`;
const cookiesProto = `
syntax = "proto3";

message Information {
  string gws = 2;
  string locale = 3;
}

message Datetime {
  uint32 timestamp = 1;
}

message SOCS {
  Information info = 2;
  Datetime datetime = 3;
}
`;
// Load protobuf definitions
let FlightsRoot;
let CookiesRoot;
async function loadProtobufDefinitions() {
    FlightsRoot = protobuf.parse(flightsProto).root;
    CookiesRoot = protobuf.parse(cookiesProto).root;
}
// Helper functions for protobuf serialization
function createFlightDataProto(flightData) {
    const FlightDataMessage = FlightsRoot.lookupType('FlightData');
    const AirportMessage = FlightsRoot.lookupType('Airport');
    const fromAirport = AirportMessage.create({ airport: flightData.from_airport });
    const toAirport = AirportMessage.create({ airport: flightData.to_airport });
    const message = FlightDataMessage.create({
        date: flightData.date,
        from_flight: fromAirport,
        to_flight: toAirport,
        max_stops: flightData.max_stops,
        airlines: flightData.airlines || []
    });
    return message;
}
function createPassengersProto(passengers) {
    const passengerTypes = [];
    // Add adults
    for (let i = 0; i < passengers.adults; i++) {
        passengerTypes.push(1); // ADULT
    }
    // Add children
    for (let i = 0; i < passengers.children; i++) {
        passengerTypes.push(2); // CHILD
    }
    // Add infants in seat
    for (let i = 0; i < passengers.infants_in_seat; i++) {
        passengerTypes.push(3); // INFANT_IN_SEAT
    }
    // Add infants on lap
    for (let i = 0; i < passengers.infants_on_lap; i++) {
        passengerTypes.push(4); // INFANT_ON_LAP
    }
    return passengerTypes;
}
function getSeatTypeProto(seat) {
    const seatMap = {
        'economy': 1,
        'premium-economy': 2,
        'business': 3,
        'first': 4
    };
    return seatMap[seat];
}
function getTripTypeProto(trip) {
    const tripMap = {
        'round-trip': 1,
        'one-way': 2,
        'multi-city': 3
    };
    return tripMap[trip];
}
function createInfoProto(flightDataList, seat, trip, passengers, maxStops) {
    const InfoMessage = FlightsRoot.lookupType('Info');
    const flightDataProtos = flightDataList.map(fd => {
        const proto = createFlightDataProto(fd);
        // Apply max_stops to all flights if specified
        if (maxStops !== undefined) {
            proto.max_stops = maxStops;
        }
        return proto;
    });
    const message = InfoMessage.create({
        data: flightDataProtos,
        seat: getSeatTypeProto(seat),
        passengers: createPassengersProto(passengers),
        trip: getTripTypeProto(trip)
    });
    return message;
}
function createCookiesProto(gws, locale, timestamp) {
    const SOCSMessage = CookiesRoot.lookupType('SOCS');
    const InformationMessage = CookiesRoot.lookupType('Information');
    const DatetimeMessage = CookiesRoot.lookupType('Datetime');
    const info = InformationMessage.create({ gws, locale });
    const datetime = DatetimeMessage.create({ timestamp });
    const message = SOCSMessage.create({
        info,
        datetime
    });
    return message;
}
function serializeToBase64(message) {
    const buffer = message.constructor.encode(message).finish();
    return Buffer.from(buffer).toString('base64');
}
function deserializeFromBase64(base64, messageType) {
    const buffer = Buffer.from(base64, 'base64');
    return messageType.decode(buffer);
}
//# sourceMappingURL=protobuf.js.map