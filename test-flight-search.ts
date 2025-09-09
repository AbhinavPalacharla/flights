/**
 * Test script to search for flights from San Diego to Amsterdam
 * November 21st, 2025 with < 2hr layover
 */

import { 
  getFlights, 
  FlightData, 
  Passengers, 
  Airport,
  searchAirport 
} from './src/index';

async function searchAmsterdamFlights() {
  console.log('🔍 Searching for flights from San Diego to Amsterdam...');
  console.log('📅 Date: November 21st, 2025');
  console.log('✈️  Max layover: < 2 hours');
  console.log('💰 Looking for cheap options\n');

  try {
    // Search for San Diego airports
    console.log('Searching for San Diego airports...');
    const sanDiegoAirports = searchAirport('san diego');
    console.log('Found San Diego airports:', sanDiegoAirports.map(a => `${a.name} (${a.code})`));
    
    // Search for Amsterdam airports
    console.log('\nSearching for Amsterdam airports...');
    const amsterdamAirports = searchAirport('amsterdam');
    console.log('Found Amsterdam airports:', amsterdamAirports.map(a => `${a.name} (${a.code})`));

    // Use the main airports
    const sanDiegoAirport = sanDiegoAirports.find(a => a.code === 'SAN') || sanDiegoAirports[0];
    const amsterdamAirport = amsterdamAirports.find(a => a.code === 'AMS') || amsterdamAirports[0];

    console.log(`\nUsing airports: ${sanDiegoAirport.name} (${sanDiegoAirport.code}) → ${amsterdamAirport.name} (${amsterdamAirport.code})`);

    // Create flight data
    const flightData = new FlightData({
      date: '2025-11-21',
      from_airport: sanDiegoAirport.code,
      to_airport: amsterdamAirport.code,
      max_stops: 1, // Allow 1 stop for layover
      airlines: [] // No specific airline preference
    });

    // Create passengers (1 adult, economy)
    const passengers = new Passengers({
      adults: 1,
      children: 0,
      infants_in_seat: 0,
      infants_on_lap: 0
    });

    console.log('\n🚀 Searching for flights...');
    console.log('This may take a moment as we fetch real-time data...\n');

    // Search for flights using different modes
    const searchModes = ['common', 'bright-data', 'local', 'fallback'] as const;
    
    for (const mode of searchModes) {
      try {
        console.log(`\n--- Trying ${mode} mode ---`);
        
        const result = await getFlights({
          flight_data: [flightData],
          seat: 'economy',
          trip: 'one-way',
          passengers: passengers,
          max_stops: 1,
          fetch_mode: mode,
          data_source: 'html'
        });

        if (result) {
          console.log(`✅ ${mode} mode succeeded!`);
          
          if ('flights' in result) {
            // HTML result format
            console.log(`Found ${result.flights.length} flights:`);
            result.flights.forEach((flight, index) => {
              console.log(`\n${index + 1}. ${flight.name}`);
              console.log(`   Departure: ${flight.departure}`);
              console.log(`   Arrival: ${flight.arrival}`);
              console.log(`   Duration: ${flight.duration}`);
              console.log(`   Stops: ${flight.stops}`);
              console.log(`   Price: $${flight.price}`);
              if (flight.delay) {
                console.log(`   Delay: ${flight.delay}`);
              }
            });
            console.log(`\nPrice level: ${result.current_price}`);
          } else if ('best' in result) {
            // Decoded result format
            console.log(`Found ${result.best.length} best flights and ${result.other.length} other options`);
            result.best.forEach((itinerary, index) => {
              console.log(`\n${index + 1}. Best Option:`);
              console.log(`   Airlines: ${itinerary.airline_names.join(', ')}`);
              console.log(`   Flights: ${itinerary.flights.length} segments`);
              console.log(`   Travel time: ${itinerary.travel_time} minutes`);
              console.log(`   Price: ${itinerary.itinerary_summary.currency} ${itinerary.itinerary_summary.price}`);
            });
          }
          
          // If we found results, we can break out of the loop
          break;
        } else {
          console.log(`❌ ${mode} mode returned no results`);
        }
      } catch (error) {
        console.log(`❌ ${mode} mode failed:`, error instanceof Error ? error.message : String(error));
      }
    }

  } catch (error) {
    console.error('❌ Error searching for flights:', error);
  }
}

// Run the search
searchAmsterdamFlights().catch(console.error);