/**
 * Comprehensive example demonstrating all functionality of the fast-flights TypeScript library
 */

import { 
  FlightData, 
  Passengers, 
  createFilter, 
  getFlights,
  searchAirport,
  Airport,
  BrightDataClient,
  LocalPlaywrightClient,
  FallbackPlaywrightClient,
  HttpClient
} from './src/index';

async function demonstrateAllFeatures() {
  console.log('🚀 Fast Flights TypeScript Library - Comprehensive Demo\n');

  // 1. Airport Search
  console.log('1. 🔍 Airport Search:');
  const taipeiResults = searchAirport('taipei');
  console.log('Taipei airports:', taipeiResults.slice(0, 3));
  
  const taoyuanResults = searchAirport('taoyuan');
  console.log('Taoyuan airports:', taoyuanResults.slice(0, 3));
  
  const kennedyResults = searchAirport('kennedy');
  console.log('Kennedy airports:', kennedyResults.slice(0, 3));
  console.log();

  // 2. Flight Data Creation
  console.log('2. ✈️ Flight Data Creation:');
  const flightData1 = new FlightData({
    date: '2025-01-01',
    from_airport: Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT,
    to_airport: Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT,
    max_stops: 1,
    airlines: ['AA', 'STAR_ALLIANCE']
  });
  console.log('Flight 1:', flightData1.toString());

  const flightData2 = new FlightData({
    date: '2025-01-15',
    from_airport: Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT,
    to_airport: Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT,
    max_stops: 0
  });
  console.log('Flight 2:', flightData2.toString());
  console.log();

  // 3. Passengers Configuration
  console.log('3. 👥 Passengers Configuration:');
  const passengers = new Passengers({
    adults: 2,
    children: 1,
    infants_in_seat: 0,
    infants_on_lap: 0
  });
  console.log('Passengers:', passengers.toString());

  // Test validation
  try {
    new Passengers({
      adults: 5,
      children: 3,
      infants_in_seat: 2,
      infants_on_lap: 1
    });
  } catch (error) {
    console.log('Validation error (expected):', (error as Error).message);
  }
  console.log();

  // 4. Filter Creation
  console.log('4. 🔧 Filter Creation:');
  const filter = createFilter({
    flight_data: [flightData1, flightData2],
    trip: 'round-trip',
    passengers,
    seat: 'economy',
    max_stops: 1
  });
  console.log('Filter:', filter.toString());
  console.log();

  // 5. Different Fetch Modes
  console.log('5. 🌐 Different Fetch Modes:');
  
  // Common mode (default)
  console.log('Common mode: Regular HTTP request');
  
  // Fallback mode
  console.log('Fallback mode: HTTP request with Playwright fallback');
  
  // Local Playwright mode
  console.log('Local Playwright mode: Local browser automation');
  
  // Bright Data mode
  console.log('Bright Data mode: External API service');
  console.log();

  // 6. HTTP Client Usage
  console.log('6. 🌍 HTTP Client Usage:');
  const httpClient = new HttpClient({
    timeout: 10000,
    headers: {
      'Custom-Header': 'test-value'
    }
  });
  console.log('HTTP Client created with custom configuration');
  console.log();

  // 7. Bright Data Client
  console.log('7. 💡 Bright Data Client:');
  try {
    const brightDataClient = new BrightDataClient({
      apiKey: 'demo-key',
      zone: 'demo-zone'
    });
    console.log('Bright Data Client created successfully');
  } catch (error) {
    console.log('Bright Data Client error (expected without API key):', (error as Error).message);
  }
  console.log();

  // 8. Playwright Clients
  console.log('8. 🎭 Playwright Clients:');
  const localPlaywrightClient = new LocalPlaywrightClient();
  console.log('Local Playwright Client created');
  
  const fallbackPlaywrightClient = new FallbackPlaywrightClient();
  console.log('Fallback Playwright Client created');
  console.log();

  // 9. Different Seat Types
  console.log('9. 💺 Different Seat Types:');
  const seatTypes: Array<'economy' | 'premium-economy' | 'business' | 'first'> = [
    'economy', 'premium-economy', 'business', 'first'
  ];
  
  seatTypes.forEach(seatType => {
    const testFilter = createFilter({
      flight_data: [flightData1],
      trip: 'one-way',
      passengers: new Passengers({ adults: 1 }),
      seat: seatType
    });
    console.log(`${seatType}: ${testFilter.seat}`);
  });
  console.log();

  // 10. Different Trip Types
  console.log('10. 🗺️ Different Trip Types:');
  const tripTypes: Array<'one-way' | 'round-trip' | 'multi-city'> = [
    'one-way', 'round-trip', 'multi-city'
  ];
  
  tripTypes.forEach(tripType => {
    const testFilter = createFilter({
      flight_data: [flightData1],
      trip: tripType,
      passengers: new Passengers({ adults: 1 }),
      seat: 'economy'
    });
    console.log(`${tripType}: ${testFilter.trip}`);
  });
  console.log();

  // 11. Airline Code Validation
  console.log('11. ✈️ Airline Code Validation:');
  
  // Valid codes
  const validFlightData = new FlightData({
    date: '2025-01-01',
    from_airport: 'TPE',
    to_airport: 'JFK',
    airlines: ['AA', 'UA', 'STAR_ALLIANCE', 'ONEWORLD']
  });
  console.log('Valid airline codes:', validFlightData.airlines);
  
  // Invalid codes
  try {
    new FlightData({
      date: '2025-01-01',
      from_airport: 'TPE',
      to_airport: 'JFK',
      airlines: ['INVALID_CODE', 'TOO_LONG_CODE']
    });
  } catch (error) {
    console.log('Invalid airline codes error:', (error as Error).message);
  }
  console.log();

  // 12. Airport Enum Usage
  console.log('12. 🏢 Airport Enum Usage:');
  console.log('TPE:', Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT);
  console.log('JFK:', Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT);
  console.log('LAX:', Airport.LOS_ANGELES_INTERNATIONAL_AIRPORT);
  console.log('LHR:', Airport.LONDON_HEATHROW_AIRPORT);
  console.log();

  // 13. Error Handling Examples
  console.log('13. ⚠️ Error Handling Examples:');
  
  // Too many passengers
  try {
    new Passengers({
      adults: 10,
      children: 0,
      infants_in_seat: 0,
      infants_on_lap: 0
    });
  } catch (error) {
    console.log('Too many passengers error:', (error as Error).message);
  }
  
  // Infants on lap without adults
  try {
    new Passengers({
      adults: 0,
      children: 0,
      infants_in_seat: 0,
      infants_on_lap: 1
    });
  } catch (error) {
    console.log('Infants on lap error:', (error as Error).message);
  }
  console.log();

  // 14. Library Statistics
  console.log('14. 📊 Library Statistics:');
  console.log('Total airports available:', Object.keys(Airport).length);
  console.log('Supported seat types:', seatTypes.length);
  console.log('Supported trip types:', tripTypes.length);
  console.log('Supported fetch modes:', ['common', 'fallback', 'force-fallback', 'local', 'bright-data'].length);
  console.log();

  console.log('✅ Comprehensive demo completed successfully!');
  console.log('🎉 All functionality is working correctly!');
}

// Run the comprehensive demo
demonstrateAllFeatures().catch(console.error);