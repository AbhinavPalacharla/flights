/**
 * Core flight search logic and HTTP fetching
 */

import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { TFSDataImpl } from './flight-data';
import { Result, DecodedResult, DataSource, FetchMode } from './types';
import { createInfoProto, serializeToBase64, loadProtobufDefinitions } from './protobuf';
import { ResultDecoder } from './decoder';
import { brightDataFetch } from './bright-data';
import { localPlaywrightFetch } from './local-playwright';
import { fallbackPlaywrightFetch } from './fallback-playwright';
import { HttpResponse } from './http-client';

// Initialize protobuf definitions
let protobufInitialized = false;

async function ensureProtobufInitialized(): Promise<void> {
  if (!protobufInitialized) {
    await loadProtobufDefinitions();
    protobufInitialized = true;
  }
}

export async function fetch(params: Record<string, string>): Promise<AxiosResponse> {
  const response = await axios.get('https://www.google.com/travel/flights', {
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

export async function getFlightsFromFilter(
  filter: TFSDataImpl,
  currency: string = '',
  options: {
    mode?: FetchMode;
    data_source?: DataSource;
  } = {}
): Promise<Result | DecodedResult | null> {
  const { mode = 'common', data_source = 'html' } = options;

  await ensureProtobufInitialized();

  const infoProto = createInfoProto(
    filter.flight_data,
    filter.seat,
    filter.trip,
    filter.passengers,
    filter.max_stops
  );

  const data = serializeToBase64(infoProto);

  const params = {
    tfs: data,
    hl: 'en',
    tfu: 'EgQIABABIgA',
    curr: currency,
  };

  let response: AxiosResponse | HttpResponse;

  try {
    if (mode === 'common') {
      response = await fetch(params);
    } else if (mode === 'fallback') {
      try {
        response = await fetch(params);
      } catch (error) {
        // Try fallback Playwright
        response = await fallbackPlaywrightFetch(params);
      }
    } else if (mode === 'force-fallback') {
      response = await fallbackPlaywrightFetch(params);
    } else if (mode === 'local') {
      response = await localPlaywrightFetch(params);
    } else if (mode === 'bright-data') {
      response = await brightDataFetch(params);
    } else {
      // Default to common
      response = await fetch(params);
    }
  } catch (error) {
    if (mode === 'fallback') {
      // Try force-fallback
      return getFlightsFromFilter(filter, currency, { mode: 'force-fallback', data_source });
    }
    throw error;
  }

  try {
    return parseResponse(response, data_source);
  } catch (error) {
    if (mode === 'fallback') {
      return getFlightsFromFilter(filter, currency, { mode: 'force-fallback', data_source });
    }
    throw error;
  }
}

export async function getFlights(params: {
  flight_data: TFSDataImpl['flight_data'];
  trip: TFSDataImpl['trip'];
  passengers: TFSDataImpl['passengers'];
  seat: TFSDataImpl['seat'];
  fetch_mode?: FetchMode;
  max_stops?: number;
  data_source?: DataSource;
}): Promise<Result | DecodedResult | null> {
  const filter = new TFSDataImpl({
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

export function parseResponse(
  response: AxiosResponse | HttpResponse,
  dataSource: DataSource,
  options: {
    dangerously_allow_looping_last_item?: boolean;
  } = {}
): Result | DecodedResult | null {
  const { dangerously_allow_looping_last_item = false } = options;

  if (dataSource === 'js') {
    const $ = cheerio.load(response.data);
    const script = $('script.ds\\:1').text();
    
    const match = script.match(/^.*?\{.*?data:(\[.*\]).*\}/);
    if (!match) {
      throw new Error('Malformed js data, cannot find script data');
    }
    
    const data = JSON.parse(match[1]);
    return data ? ResultDecoder.decode(data) : null;
  }

  // HTML parsing
  const $ = cheerio.load(response.data);
  const flights: any[] = [];

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
      let stopsFmt: number | 'Unknown';
      try {
        stopsFmt = stops === 'Nonstop' ? 0 : parseInt(stops.split(' ', 1)[0]);
      } catch {
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

  const currentPrice = $('span.gOatQ').text() as 'low' | 'typical' | 'high';

  if (flights.length === 0) {
    throw new Error(`No flights found:\n${response.data}`);
  }

  return {
    current_price: currentPrice,
    flights
  } as Result;
}