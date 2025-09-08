"use strict";
/**
 * Core flight search logic and HTTP fetching
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = fetch;
exports.getFlightsFromFilter = getFlightsFromFilter;
exports.getFlights = getFlights;
exports.parseResponse = parseResponse;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const flight_data_1 = require("./flight-data");
const protobuf_1 = require("./protobuf");
const decoder_1 = require("./decoder");
const bright_data_1 = require("./bright-data");
const local_playwright_1 = require("./local-playwright");
const fallback_playwright_1 = require("./fallback-playwright");
// Initialize protobuf definitions
let protobufInitialized = false;
async function ensureProtobufInitialized() {
    if (!protobufInitialized) {
        await (0, protobuf_1.loadProtobufDefinitions)();
        protobufInitialized = true;
    }
}
async function fetch(params) {
    const response = await axios_1.default.get('https://www.google.com/travel/flights', {
        params,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }
    });
    if (response.status !== 200) {
        throw new Error(`${response.status} Result: ${response.data}`);
    }
    return response;
}
async function getFlightsFromFilter(filter, currency = '', options = {}) {
    const { mode = 'common', data_source = 'html' } = options;
    await ensureProtobufInitialized();
    const infoProto = (0, protobuf_1.createInfoProto)(filter.flight_data, filter.seat, filter.trip, filter.passengers, filter.max_stops);
    const data = (0, protobuf_1.serializeToBase64)(infoProto);
    const params = {
        tfs: data,
        hl: 'en',
        tfu: 'EgQIABABIgA',
        curr: currency,
    };
    let response;
    try {
        if (mode === 'common') {
            response = await fetch(params);
        }
        else if (mode === 'fallback') {
            try {
                response = await fetch(params);
            }
            catch (error) {
                // Try fallback Playwright
                response = await (0, fallback_playwright_1.fallbackPlaywrightFetch)(params);
            }
        }
        else if (mode === 'force-fallback') {
            response = await (0, fallback_playwright_1.fallbackPlaywrightFetch)(params);
        }
        else if (mode === 'local') {
            response = await (0, local_playwright_1.localPlaywrightFetch)(params);
        }
        else if (mode === 'bright-data') {
            response = await (0, bright_data_1.brightDataFetch)(params);
        }
        else {
            // Default to common
            response = await fetch(params);
        }
    }
    catch (error) {
        if (mode === 'fallback') {
            // Try force-fallback
            return getFlightsFromFilter(filter, currency, { mode: 'force-fallback', data_source });
        }
        throw error;
    }
    try {
        return parseResponse(response, data_source);
    }
    catch (error) {
        if (mode === 'fallback') {
            return getFlightsFromFilter(filter, currency, { mode: 'force-fallback', data_source });
        }
        throw error;
    }
}
async function getFlights(params) {
    const filter = new flight_data_1.TFSDataImpl({
        flight_data: params.flight_data,
        seat: params.seat,
        trip: params.trip,
        passengers: params.passengers,
        max_stops: params.max_stops
    });
    return getFlightsFromFilter(filter, '', {
        mode: params.fetch_mode,
        data_source: params.data_source
    });
}
function parseResponse(response, dataSource, options = {}) {
    const { dangerously_allow_looping_last_item = false } = options;
    if (dataSource === 'js') {
        const $ = cheerio.load(response.data);
        const script = $('script.ds\\:1').text();
        const match = script.match(/^.*?\{.*?data:(\[.*\]).*\}/);
        if (!match) {
            throw new Error('Malformed js data, cannot find script data');
        }
        const data = JSON.parse(match[1]);
        return data ? decoder_1.ResultDecoder.decode(data) : null;
    }
    // HTML parsing
    const $ = cheerio.load(response.data);
    const flights = [];
    $('div[jsname="IWWDBc"], div[jsname="YdtKid"]').each((i, fl) => {
        const isBestFlight = i === 0;
        const $fl = $(fl);
        $fl.find('ul.Rk10dc li').each((j, item) => {
            if (!dangerously_allow_looping_last_item && i !== 0 && j === $fl.find('ul.Rk10dc li').length - 1) {
                return; // Skip last item unless allowed
            }
            const $item = $(item);
            // Flight name
            const name = $item.find('div.sSHqwe.tPgKwe.ogfYpf span').text().trim();
            // Get departure & arrival time
            const dpArNode = $item.find('span.mv1WYe div');
            let departureTime = '';
            let arrivalTime = '';
            if (dpArNode.length >= 2) {
                departureTime = dpArNode.eq(0).text().trim();
                arrivalTime = dpArNode.eq(1).text().trim();
            }
            // Get arrival time ahead
            const timeAhead = $item.find('span.bOzv6').text();
            // Get duration
            const duration = $item.find('li div.Ak5kof div').text();
            // Get flight stops
            const stops = $item.find('.BbR8Ec .ogfYpf').text();
            // Get delay
            const delay = $item.find('.GsCCve').text() || undefined;
            // Get prices
            const price = $item.find('.YMlIz.FpEdX').text() || '0';
            // Stops formatting
            let stopsFmt;
            try {
                stopsFmt = stops === 'Nonstop' ? 0 : parseInt(stops.split(' ', 1)[0]);
            }
            catch {
                stopsFmt = 'Unknown';
            }
            flights.push({
                is_best: isBestFlight,
                name,
                departure: departureTime.split(/\s+/).join(' '),
                arrival: arrivalTime.split(/\s+/).join(' '),
                arrival_time_ahead: timeAhead,
                duration,
                stops: stopsFmt,
                delay,
                price: price.replace(/,/g, ''),
            });
        });
    });
    const currentPrice = $('span.gOatQ').text();
    if (flights.length === 0) {
        throw new Error(`No flights found:\n${response.data}`);
    }
    return {
        current_price: currentPrice,
        flights
    };
}
//# sourceMappingURL=core.js.map