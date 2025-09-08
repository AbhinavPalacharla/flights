"use strict";
/**
 * Decoder logic for parsing flight data from JavaScript responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultDecoder = exports.ItineraryDecoder = exports.LayoverDecoder = exports.FlightDecoder = exports.CodeshareDecoder = exports.NLData = void 0;
class NLData {
    constructor(data) {
        this.data = data;
    }
    get(decodePath) {
        if (typeof decodePath === 'number') {
            return this.data[decodePath];
        }
        let it = this.data;
        for (const index of decodePath) {
            if (!Array.isArray(it)) {
                throw new Error(`Found non list type while trying to decode ${decodePath}`);
            }
            if (index >= it.length) {
                throw new Error(`Trying to traverse to index out of range when decoding ${decodePath}`);
            }
            it = it[index];
        }
        return it;
    }
    get length() {
        return this.data.length;
    }
}
exports.NLData = NLData;
class Decoder {
    static decodeEl(el, fields) {
        const decoded = {};
        for (const [fieldName, keyDecoder] of Object.entries(fields)) {
            const value = keyDecoder.decode(el);
            decoded[fieldName.toLowerCase()] = value;
        }
        return decoded;
    }
}
class DecoderKey {
    constructor(decodePath, decoder) {
        this.decodePath = decodePath;
        this.decoder = decoder;
    }
    decode(root) {
        const data = root.get(this.decodePath);
        if (Array.isArray(data) && this.decoder) {
            return this.decoder(new NLData(data));
        }
        return data;
    }
}
class CodeshareDecoder extends Decoder {
    static decode(root) {
        const fields = {
            AIRLINE_CODE: CodeshareDecoder.AIRLINE_CODE,
            FLIGHT_NUMBER: CodeshareDecoder.FLIGHT_NUMBER,
            AIRLINE_NAME: CodeshareDecoder.AIRLINE_NAME
        };
        return root.data.map((el) => {
            const decoded = Decoder.decodeEl(new NLData(el), fields);
            return {
                airline_code: decoded.airline_code,
                flight_number: parseInt(decoded.flight_number),
                airline_name: decoded.airline_name[0] || ''
            };
        });
    }
}
exports.CodeshareDecoder = CodeshareDecoder;
CodeshareDecoder.AIRLINE_CODE = new DecoderKey([0]);
CodeshareDecoder.FLIGHT_NUMBER = new DecoderKey([1]);
CodeshareDecoder.AIRLINE_NAME = new DecoderKey([3]);
class FlightDecoder extends Decoder {
    static decode(root) {
        const fields = {
            OPERATOR: FlightDecoder.OPERATOR,
            DEPARTURE_AIRPORT: FlightDecoder.DEPARTURE_AIRPORT,
            DEPARTURE_AIRPORT_NAME: FlightDecoder.DEPARTURE_AIRPORT_NAME,
            ARRIVAL_AIRPORT: FlightDecoder.ARRIVAL_AIRPORT,
            ARRIVAL_AIRPORT_NAME: FlightDecoder.ARRIVAL_AIRPORT_NAME,
            DEPARTURE_TIME: FlightDecoder.DEPARTURE_TIME,
            ARRIVAL_TIME: FlightDecoder.ARRIVAL_TIME,
            TRAVEL_TIME: FlightDecoder.TRAVEL_TIME,
            SEAT_PITCH_SHORT: FlightDecoder.SEAT_PITCH_SHORT,
            AIRCRAFT: FlightDecoder.AIRCRAFT,
            DEPARTURE_DATE: FlightDecoder.DEPARTURE_DATE,
            ARRIVAL_DATE: FlightDecoder.ARRIVAL_DATE,
            AIRLINE: FlightDecoder.AIRLINE,
            AIRLINE_NAME: FlightDecoder.AIRLINE_NAME,
            FLIGHT_NUMBER: FlightDecoder.FLIGHT_NUMBER,
            CODESHARES: FlightDecoder.CODESHARES
        };
        return root.data.map((el) => {
            const decoded = Decoder.decodeEl(new NLData(el), fields);
            return {
                airline: decoded.airline,
                airline_name: decoded.airline_name,
                flight_number: decoded.flight_number,
                operator: decoded.operator,
                codeshares: decoded.codeshares || [],
                aircraft: decoded.aircraft || '',
                departure_airport: decoded.departure_airport,
                departure_airport_name: decoded.departure_airport_name,
                arrival_airport: decoded.arrival_airport,
                arrival_airport_name: decoded.arrival_airport_name,
                departure_date: decoded.departure_date,
                arrival_date: decoded.arrival_date,
                departure_time: decoded.departure_time,
                arrival_time: decoded.arrival_time,
                travel_time: decoded.travel_time,
                seat_pitch_short: decoded.seat_pitch_short || ''
            };
        });
    }
}
exports.FlightDecoder = FlightDecoder;
FlightDecoder.OPERATOR = new DecoderKey([2]);
FlightDecoder.DEPARTURE_AIRPORT = new DecoderKey([3]);
FlightDecoder.DEPARTURE_AIRPORT_NAME = new DecoderKey([4]);
FlightDecoder.ARRIVAL_AIRPORT = new DecoderKey([5]);
FlightDecoder.ARRIVAL_AIRPORT_NAME = new DecoderKey([6]);
FlightDecoder.DEPARTURE_TIME = new DecoderKey([8]);
FlightDecoder.ARRIVAL_TIME = new DecoderKey([10]);
FlightDecoder.TRAVEL_TIME = new DecoderKey([11]);
FlightDecoder.SEAT_PITCH_SHORT = new DecoderKey([14]);
FlightDecoder.AIRCRAFT = new DecoderKey([17]);
FlightDecoder.DEPARTURE_DATE = new DecoderKey([20]);
FlightDecoder.ARRIVAL_DATE = new DecoderKey([21]);
FlightDecoder.AIRLINE = new DecoderKey([22, 0]);
FlightDecoder.AIRLINE_NAME = new DecoderKey([22, 3]);
FlightDecoder.FLIGHT_NUMBER = new DecoderKey([22, 1]);
FlightDecoder.CODESHARES = new DecoderKey([15], CodeshareDecoder.decode);
class LayoverDecoder extends Decoder {
    static decode(root) {
        const fields = {
            MINUTES: LayoverDecoder.MINUTES,
            DEPARTURE_AIRPORT: LayoverDecoder.DEPARTURE_AIRPORT,
            DEPARTURE_AIRPORT_NAME: LayoverDecoder.DEPARTURE_AIRPORT_NAME,
            DEPARTURE_AIRPORT_CITY: LayoverDecoder.DEPARTURE_AIRPORT_CITY,
            ARRIVAL_AIRPORT: LayoverDecoder.ARRIVAL_AIRPORT,
            ARRIVAL_AIRPORT_NAME: LayoverDecoder.ARRIVAL_AIRPORT_NAME,
            ARRIVAL_AIRPORT_CITY: LayoverDecoder.ARRIVAL_AIRPORT_CITY
        };
        return root.data.map((el) => {
            const decoded = Decoder.decodeEl(new NLData(el), fields);
            return {
                minutes: decoded.minutes,
                departure_airport: decoded.departure_airport,
                departure_airport_name: decoded.departure_airport_name,
                departure_airport_city: decoded.departure_airport_city,
                arrival_airport: decoded.arrival_airport,
                arrival_airport_name: decoded.arrival_airport_name,
                arrival_airport_city: decoded.arrival_airport_city
            };
        });
    }
}
exports.LayoverDecoder = LayoverDecoder;
LayoverDecoder.MINUTES = new DecoderKey([0]);
LayoverDecoder.DEPARTURE_AIRPORT = new DecoderKey([1]);
LayoverDecoder.DEPARTURE_AIRPORT_NAME = new DecoderKey([4]);
LayoverDecoder.DEPARTURE_AIRPORT_CITY = new DecoderKey([5]);
LayoverDecoder.ARRIVAL_AIRPORT = new DecoderKey([2]);
LayoverDecoder.ARRIVAL_AIRPORT_NAME = new DecoderKey([6]);
LayoverDecoder.ARRIVAL_AIRPORT_CITY = new DecoderKey([7]);
class ItineraryDecoder extends Decoder {
    static decode(root) {
        const fields = {
            AIRLINE_CODE: ItineraryDecoder.AIRLINE_CODE,
            AIRLINE_NAMES: ItineraryDecoder.AIRLINE_NAMES,
            FLIGHTS: ItineraryDecoder.FLIGHTS,
            DEPARTURE_AIRPORT: ItineraryDecoder.DEPARTURE_AIRPORT,
            DEPARTURE_DATE: ItineraryDecoder.DEPARTURE_DATE,
            DEPARTURE_TIME: ItineraryDecoder.DEPARTURE_TIME,
            ARRIVAL_AIRPORT: ItineraryDecoder.ARRIVAL_AIRPORT,
            ARRIVAL_DATE: ItineraryDecoder.ARRIVAL_DATE,
            ARRIVAL_TIME: ItineraryDecoder.ARRIVAL_TIME,
            TRAVEL_TIME: ItineraryDecoder.TRAVEL_TIME,
            LAYOVERS: ItineraryDecoder.LAYOVERS,
            ITINERARY_SUMMARY: ItineraryDecoder.ITINERARY_SUMMARY
        };
        return root.data.map((el) => {
            const decoded = Decoder.decodeEl(new NLData(el), fields);
            return {
                airline_code: decoded.airline_code,
                airline_names: decoded.airline_names || [],
                flights: decoded.flights || [],
                layovers: decoded.layovers || [],
                travel_time: decoded.travel_time,
                departure_airport: decoded.departure_airport,
                arrival_airport: decoded.arrival_airport,
                departure_date: decoded.departure_date,
                arrival_date: decoded.arrival_date,
                departure_time: decoded.departure_time,
                arrival_time: decoded.arrival_time,
                itinerary_summary: decoded.itinerary_summary
            };
        });
    }
}
exports.ItineraryDecoder = ItineraryDecoder;
ItineraryDecoder.AIRLINE_CODE = new DecoderKey([0, 0]);
ItineraryDecoder.AIRLINE_NAMES = new DecoderKey([0, 1]);
ItineraryDecoder.FLIGHTS = new DecoderKey([0, 2], FlightDecoder.decode);
ItineraryDecoder.DEPARTURE_AIRPORT = new DecoderKey([0, 3]);
ItineraryDecoder.DEPARTURE_DATE = new DecoderKey([0, 4]);
ItineraryDecoder.DEPARTURE_TIME = new DecoderKey([0, 5]);
ItineraryDecoder.ARRIVAL_AIRPORT = new DecoderKey([0, 6]);
ItineraryDecoder.ARRIVAL_DATE = new DecoderKey([0, 7]);
ItineraryDecoder.ARRIVAL_TIME = new DecoderKey([0, 8]);
ItineraryDecoder.TRAVEL_TIME = new DecoderKey([0, 9]);
ItineraryDecoder.LAYOVERS = new DecoderKey([0, 13], LayoverDecoder.decode);
ItineraryDecoder.ITINERARY_SUMMARY = new DecoderKey([1], (data) => {
    // This would need proper protobuf deserialization
    // For now, return a placeholder
    return {
        flights: '',
        price: 0,
        currency: 'USD'
    };
});
class ResultDecoder extends Decoder {
    static decode(root) {
        if (!Array.isArray(root)) {
            throw new Error('Root data must be list type');
        }
        const nlRoot = new NLData(root);
        const fields = {
            BEST: ResultDecoder.BEST,
            OTHER: ResultDecoder.OTHER
        };
        const decoded = Decoder.decodeEl(nlRoot, fields);
        return {
            raw: root,
            best: decoded.best || [],
            other: decoded.other || []
        };
    }
}
exports.ResultDecoder = ResultDecoder;
ResultDecoder.BEST = new DecoderKey([2, 0], ItineraryDecoder.decode);
ResultDecoder.OTHER = new DecoderKey([3, 0], ItineraryDecoder.decode);
//# sourceMappingURL=decoder.js.map