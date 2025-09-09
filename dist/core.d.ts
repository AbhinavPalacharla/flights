/**
 * Core flight search logic and HTTP fetching
 */
import { AxiosResponse } from 'axios';
import { TFSDataImpl } from './flight-data';
import { Result, DecodedResult, DataSource, FetchMode } from './types';
import { HttpResponse } from './http-client';
export declare function fetch(params: Record<string, string>): Promise<AxiosResponse>;
export declare function getFlightsFromFilter(filter: TFSDataImpl, currency?: string, options?: {
    mode?: FetchMode;
    data_source?: DataSource;
}): Promise<Result | DecodedResult | null>;
export declare function getFlights(params: {
    flight_data: TFSDataImpl['flight_data'];
    trip: TFSDataImpl['trip'];
    passengers: TFSDataImpl['passengers'];
    seat: TFSDataImpl['seat'];
    fetch_mode?: FetchMode;
    max_stops?: number;
    data_source?: DataSource;
}): Promise<Result | DecodedResult | null>;
export declare function parseResponse(response: AxiosResponse | HttpResponse, dataSource: DataSource, options?: {
    dangerously_allow_looping_last_item?: boolean;
}): Result | DecodedResult | null;
//# sourceMappingURL=core.d.ts.map