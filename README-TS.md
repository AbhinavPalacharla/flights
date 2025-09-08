# ✈️ fast-flights-ts

The fast and strongly-typed Google Flights scraper (API) implemented in TypeScript. Based on Base64-encoded Protobuf string.

This is a TypeScript port of the original Python [fast-flights](https://github.com/AWeirdDev/flights) library.

## Installation

```bash
npm install fast-flights-ts
```

## Quick Start

```typescript
import { FlightData, Passengers, getFlights, Airport } from 'fast-flights-ts';

// Search for flights
const result = await getFlights({
  flight_data: [
    new FlightData({
      date: "2025-01-01",
      from_airport: Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT,
      to_airport: Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
    })
  ],
  trip: "one-way",
  seat: "economy",
  passengers: new Passengers({ adults: 2, children: 1 }),
  fetch_mode: "common"
});

console.log("Current price:", result.current_price);
console.log("Flights found:", result.flights.length);
```

## Features

- **Strongly Typed**: Full TypeScript support with comprehensive type definitions
- **Multiple Fetch Modes**: Support for common, fallback, local, and bright-data modes
- **Airport Search**: Search airports by name, code, or partial matches
- **Validation**: Built-in validation for passengers, airline codes, and flight data
- **Protobuf Integration**: Efficient serialization using Protocol Buffers
- **Comprehensive Testing**: Full test suite with 28 passing tests

## API Reference

### Core Classes

#### `FlightData`
Represents flight data for a single flight segment.

```typescript
const flightData = new FlightData({
  date: "2025-01-01",
  from_airport: "TPE", // or Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT
  to_airport: "JFK",   // or Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
  max_stops: 1,        // optional
  airlines: ["AA", "STAR_ALLIANCE"] // optional
});
```

#### `Passengers`
Represents passenger configuration.

```typescript
const passengers = new Passengers({
  adults: 2,
  children: 1,
  infants_in_seat: 0,
  infants_on_lap: 0
});
```

### Main Functions

#### `getFlights(params)`
Main function to search for flights.

**Parameters:**
- `flight_data`: Array of `FlightData` objects
- `trip`: Trip type - `"one-way"`, `"round-trip"`, or `"multi-city"`
- `seat`: Seat class - `"economy"`, `"premium-economy"`, `"business"`, or `"first"`
- `passengers`: `Passengers` object
- `fetch_mode`: Optional fetch mode - `"common"`, `"fallback"`, `"force-fallback"`, `"local"`, or `"bright-data"`
- `max_stops`: Optional maximum number of stops
- `data_source`: Optional data source - `"html"` or `"js"`

**Returns:** `Promise<Result | DecodedResult | null>`

#### `searchAirport(query)`
Search for airports by name or code.

```typescript
const airports = searchAirport("taipei");
// Returns: [Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT]

const airports = searchAirport("jfk");
// Returns: [Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT]
```

#### `createFilter(params)`
Create a filter for flight search.

```typescript
const filter = createFilter({
  flight_data: [flightData],
  trip: "one-way",
  passengers: passengers,
  seat: "economy",
  max_stops: 1
});
```

### Data Types

#### `Result`
Standard flight search result.

```typescript
interface Result {
  current_price: "low" | "typical" | "high";
  flights: Flight[];
}
```

#### `Flight`
Individual flight information.

```typescript
interface Flight {
  is_best: boolean;
  name: string;
  departure: string;
  arrival: string;
  arrival_time_ahead: string;
  duration: string;
  stops: number | "Unknown";
  delay?: string;
  price: string;
}
```

#### `DecodedResult`
Detailed flight search result with structured data.

```typescript
interface DecodedResult {
  raw: any[];
  best: Itinerary[];
  other: Itinerary[];
}
```

## Examples

### One-way Flight Search

```typescript
import { FlightData, Passengers, getFlights, Airport } from 'fast-flights-ts';

const result = await getFlights({
  flight_data: [
    new FlightData({
      date: "2025-01-01",
      from_airport: Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT,
      to_airport: Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
    })
  ],
  trip: "one-way",
  seat: "economy",
  passengers: new Passengers({ adults: 1 })
});

console.log("Price level:", result.current_price);
result.flights.forEach(flight => {
  console.log(`${flight.name}: ${flight.departure} - ${flight.arrival} (${flight.price})`);
});
```

### Round-trip Flight Search

```typescript
const result = await getFlights({
  flight_data: [
    new FlightData({
      date: "2025-01-01",
      from_airport: "JFK",
      to_airport: "LAX"
    }),
    new FlightData({
      date: "2025-01-05",
      from_airport: "LAX",
      to_airport: "JFK"
    })
  ],
  trip: "round-trip",
  seat: "economy",
  passengers: new Passengers({ adults: 2, children: 1 })
});
```

### Airport Search

```typescript
import { searchAirport, Airport } from 'fast-flights-ts';

// Search by city name
const taipeiAirports = searchAirport("taipei");
console.log(taipeiAirports); // [Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT]

// Search by airport code
const jfkAirports = searchAirport("jfk");
console.log(jfkAirports); // [Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT]

// Search by partial name
const newYorkAirports = searchAirport("new york");
console.log(newYorkAirports); // [Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT]
```

## Validation

The library includes built-in validation:

```typescript
// Too many passengers
try {
  new Passengers({
    adults: 5,
    children: 3,
    infants_in_seat: 2,
    infants_on_lap: 1
  });
} catch (error) {
  console.log("Error:", error.message); // "Too many passengers (> 9)"
}

// Invalid airline code
try {
  new FlightData({
    date: "2025-01-01",
    from_airport: "TPE",
    to_airport: "JFK",
    airlines: ["INVALID"]
  });
} catch (error) {
  console.log("Error:", error.message); // "Invalid airline code: INVALID"
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Running Example

```bash
npx ts-node example.ts
```

## Differences from Python Version

- **TypeScript**: Full type safety and IntelliSense support
- **Async/Await**: All network operations are asynchronous
- **Error Handling**: TypeScript error handling patterns
- **Module System**: ES modules with proper exports
- **Testing**: Jest-based test suite

## License

MIT License - see LICENSE file for details.

## Credits

Based on the original Python [fast-flights](https://github.com/AWeirdDev/flights) library by AWeirdDev.