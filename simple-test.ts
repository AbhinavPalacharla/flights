/**
 * Simple test to demonstrate the TypeScript library working
 */

import { 
  getFlights, 
  FlightData, 
  Passengers, 
  searchAirport 
} from './src/index';

async function simpleTest() {
  console.log('🚀 Testing the TypeScript Fast Flights Library\n');

  // Test 1: Airport Search
  console.log('1. Testing Airport Search:');
  const sanDiegoResults = searchAirport('san diego');
  console.log(`   Found ${sanDiegoResults.length} San Diego airports:`);
  sanDiegoResults.slice(0, 3).forEach(airport => {
    console.log(`   - ${airport.name} (${airport.code})`);
  });

  const amsterdamResults = searchAirport('amsterdam');
  console.log(`   Found ${amsterdamResults.length} Amsterdam airports:`);
  amsterdamResults.slice(0, 3).forEach(airport => {
    console.log(`   - ${airport.name} (${airport.code})`);
  });

  // Test 2: Flight Data Creation
  console.log('\n2. Testing Flight Data Creation:');
  const flightData = new FlightData({
    date: '2025-11-21',
    from_airport: 'SAN',
    to_airport: 'AMS',
    max_stops: 1
  });
  console.log(`   Created flight data: ${flightData.from_airport} → ${flightData.to_airport} on ${flightData.date}`);

  // Test 3: Passengers Configuration
  console.log('\n3. Testing Passengers Configuration:');
  const passengers = new Passengers({
    adults: 1,
    children: 0,
    infants_in_seat: 0,
    infants_on_lap: 0
  });
  console.log(`   Created passengers: ${passengers.adults} adult(s)`);

  // Test 4: Flight Search (Common Mode)
  console.log('\n4. Testing Flight Search (Common Mode):');
  console.log('   Searching for flights from San Diego to Amsterdam...');
  
  try {
    const result = await getFlights({
      flight_data: [flightData],
      seat: 'economy',
      trip: 'one-way',
      passengers: passengers,
      max_stops: 1,
      fetch_mode: 'common',
      data_source: 'html'
    });

    if (result) {
      console.log('   ✅ Flight search successful!');
      
      if ('flights' in result) {
        console.log(`   Found ${result.flights.length} flights:`);
        result.flights.slice(0, 3).forEach((flight, index) => {
          console.log(`   ${index + 1}. ${flight.name} - ${flight.departure} to ${flight.arrival} - $${flight.price}`);
        });
        console.log(`   Price level: ${result.current_price}`);
      } else if ('best' in result) {
        console.log(`   Found ${result.best.length} best flights and ${result.other.length} other options`);
        result.best.slice(0, 2).forEach((itinerary, index) => {
          console.log(`   ${index + 1}. ${itinerary.airline_names.join(', ')} - ${itinerary.itinerary_summary.currency} ${itinerary.itinerary_summary.price}`);
        });
      }
    } else {
      console.log('   ❌ No flights found');
    }
  } catch (error) {
    console.log(`   ❌ Flight search failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n🎉 Library test completed!');
}

// Run the test
simpleTest().catch(console.error);