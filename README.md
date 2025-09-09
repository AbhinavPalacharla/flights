# ✈️ fast-flights-ts

The fast and strongly-typed Google Flights scraper (API) implemented in TypeScript. Based on Base64-encoded Protobuf string.

[![npm version](https://badge.fury.io/js/fast-flights-ts.svg)](https://badge.fury.io/js/fast-flights-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install fast-flights-ts
```

## Quick Start

```typescript
import { FlightData, Passengers, getFlights, Airport } from 'fast-flights-ts';

// Create flight data
const flightData = new FlightData({
  date: "2025-01-01",
  from_airport: Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT,
  to_airport: Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
});

// Create passengers
const passengers = new Passengers({
  adults: 2,
  children: 1,
  infants_in_seat: 0,
  infants_on_lap: 0
});

// Search for flights
const result = await getFlights({
  flight_data: [flightData],
  trip: "one-way",
  seat: "economy",
  passengers,
  fetch_mode: "fallback"
});

console.log("Current price level:", result.current_price);
console.log("Available flights:", result.flights);
```

## API Reference

### Core Classes

#### `FlightData`

Represents a single flight search criteria.

```typescript
const flightData = new FlightData({
  date: "2025-01-01",           // YYYY-MM-DD format
  from_airport: "TPE",          // IATA airport code or Airport enum
  to_airport: "JFK",            // IATA airport code or Airport enum
  max_stops?: 1,                // Optional: maximum number of stops
  airlines?: ["AA", "UA"]       // Optional: preferred airlines
});
```

#### `Passengers`

Defines passenger counts for the search.

```typescript
const passengers = new Passengers({
  adults: 2,                    // Number of adults (1-9)
  children: 1,                  // Number of children (0-8)
  infants_in_seat: 0,           // Infants with seats (0-8)
  infants_on_lap: 0             // Infants on lap (0-8)
});
```

### Main Functions

#### `getFlights(options)`

Main function to search for flights.

```typescript
const result = await getFlights({
  flight_data: FlightData[],    // Array of flight data
  trip: "one-way",              // "one-way" | "round-trip" | "multi-city"
  seat: "economy",              // "economy" | "premium-economy" | "business" | "first"
  passengers: Passengers,       // Passenger configuration
  fetch_mode?: "common",        // "common" | "fallback" | "force-fallback" | "local" | "bright-data"
  currency?: "USD"              // Optional currency code
});
```

#### `createFilter(options)`

Create a filter object for advanced usage.

```typescript
import { createFilter } from 'fast-flights-ts';

const filter = createFilter({
  flight_data: [flightData],
  trip: "one-way",
  passengers,
  seat: "economy",
  max_stops: 1
});
```

#### `searchAirport(query)`

Search for airports by name or code.

```typescript
import { searchAirport } from 'fast-flights-ts';

const airports = searchAirport("taipei");
// Returns array of matching airports with codes and names
```

### Airport Enum

Use the `Airport` enum for type-safe airport codes:

```typescript
import { Airport } from 'fast-flights-ts';

// Examples
Airport.TAIPEI_TAOYUAN_INTERNATIONAL_AIRPORT  // "TPE"
Airport.NEW_YORK_JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT  // "JFK"
Airport.LONDON_HEATHROW_AIRPORT  // "LHR"
```

### Result Object

The `getFlights` function returns a `Result` object:

```typescript
interface Result {
  current_price: "low" | "typical" | "high";
  flights: Flight[];
}

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

## Advanced Usage

### Using Different Fetch Modes

```typescript
// Common mode (default)
const result1 = await getFlights({...}, { mode: "common" });

// Fallback mode for better reliability
const result2 = await getFlights({...}, { mode: "fallback" });

// Force fallback mode
const result3 = await getFlights({...}, { mode: "force-fallback" });

// Local mode (requires local setup)
const result4 = await getFlights({...}, { mode: "local" });

// Bright Data mode (requires Bright Data setup)
const result5 = await getFlights({...}, { mode: "bright-data" });
```

### Multi-City Trips

```typescript
const flightData1 = new FlightData({
  date: "2025-01-01",
  from_airport: "TPE",
  to_airport: "JFK"
});

const flightData2 = new FlightData({
  date: "2025-01-15",
  from_airport: "JFK",
  to_airport: "TPE"
});

const result = await getFlights({
  flight_data: [flightData1, flightData2],
  trip: "multi-city",
  seat: "economy",
  passengers: new Passengers({ adults: 1 })
});
```

### Error Handling

```typescript
try {
  const result = await getFlights({
    flight_data: [flightData],
    trip: "one-way",
    seat: "economy",
    passengers
  });
  
  if (result) {
    console.log("Found flights:", result.flights);
  } else {
    console.log("No flights found");
  }
} catch (error) {
  console.error("Search failed:", error.message);
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

### Development Mode

```bash
npm run dev
```

## How It Works

This library works by:

1. **Creating Flight Data**: You define your search criteria using the `FlightData` class
2. **Generating Protobuf**: The library converts your search into Google's internal Protobuf format
3. **Base64 Encoding**: The Protobuf data is encoded as a Base64 string for the URL
4. **Making Requests**: HTTP requests are made to Google Flights with the encoded parameters
5. **Parsing Results**: The HTML/JS response is parsed to extract flight information

The library supports multiple data sources:
- **HTML parsing**: Extracts data from Google Flights HTML responses
- **JS parsing**: Decodes JavaScript data embedded in the page (more reliable)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial TypeScript port from Python
- Full type safety with TypeScript
- Support for all original features
- Improved error handling
- Better documentation

---

<div align="center">

**Made with ❤️ by AWeirdDev**

[GitHub](https://github.com/AWeirdDev/flights) • [NPM](https://www.npmjs.com/package/fast-flights-ts)

</div>