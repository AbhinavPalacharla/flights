/**
 * Example usage of the fast-flights TypeScript library
 */

import { 
  FlightData, 
  Passengers, 
  createFilter, 
  getFlightsFromFilter,
  searchAirport,
  Airport 
} from './src/index';

async function main() {
  console.log('=== Fast Flights TypeScript Library Example ===\n');

  // 1. Search for airports
  console.log('1. Searching for airports:');
  const taipeiResults = searchAirport('taipei');
  console.log('Taipei airports:', taipeiResults);
  
  const newYorkResults = searchAirport('new york');
  console.log('New York airports:', newYorkResults);
  
  const jfkResults = searchAirport('jfk');
  console.log('JFK airports:', jfkResults);
  console.log();

  // 2. Create flight data
  console.log('2. Creating flight data:');
  const flightData = new FlightData({
    date: '2025-01-01',
    from_airport: Airport.TAIWAN_TAOYUAN_INTERNATIONAL_AIRPORT,
    to_airport: Airport.JOHN_F_KENNEDY_INTERNATIONAL_AIRPORT
  });
  console.log('Flight data:', flightData.toString());
  console.log();

  // 3. Create passengers
  console.log('3. Creating passengers:');
  const passengers = new Passengers({
    adults: 2,
    children: 1,
    infants_in_seat: 0,
    infants_on_lap: 0
  });
  console.log('Passengers:', passengers.toString());
  console.log();

  // 4. Create filter
  console.log('4. Creating filter:');
  const filter = createFilter({
    flight_data: [flightData],
    trip: 'one-way',
    passengers,
    seat: 'economy',
    max_stops: 1
  });
  console.log('Filter:', filter.toString());
  console.log();

  // 5. Test validation
  console.log('5. Testing validation:');
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

  try {
    new FlightData({
      date: '2025-01-01',
      from_airport: 'TPE',
      to_airport: 'JFK',
      airlines: ['INVALID_CODE']
    });
  } catch (error) {
    console.log('Validation error (expected):', (error as Error).message);
  }
  console.log();

  // 6. Test airline codes
  console.log('6. Testing airline codes:');
  const validFlightData = new FlightData({
    date: '2025-01-01',
    from_airport: 'TPE',
    to_airport: 'JFK',
    airlines: ['AA', 'STAR_ALLIANCE']
  });
  console.log('Valid airline codes:', validFlightData.airlines);
  console.log();

  console.log('=== Example completed successfully! ===');
  console.log('Note: Actual flight search requires network access and may be rate-limited.');
}

// Run the example
main().catch(console.error);