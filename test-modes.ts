import { FlightData, Passengers, getFlights, Airport, searchAirport, FetchMode, DataSource } from './src';

async function testMode(mode: FetchMode, dataSource: DataSource) {
  console.log(`\n🔍 Testing ${mode} mode with ${dataSource} data source...`);
  
  try {
    // Create flight data for San Diego to Amsterdam
    const flightData = new FlightData({
      date: '2025-11-21',
      from_airport: Airport.SAN_DIEGO_INTERNATIONAL_AIRPORT,
      to_airport: Airport.AMSTERDAM_AIRPORT_SCHIPHOL
    });

    const passengers = new Passengers({
      adults: 1,
      children: 0,
      infants_in_seat: 0,
      infants_on_lap: 0
    });

    const result = await getFlights({
      flight_data: [flightData],
      seat: 'economy',
      trip: 'one-way',
      passengers: passengers,
      max_stops: 1,
      fetch_mode: mode,
      data_source: dataSource
    });

    if (result) {
      console.log(`✅ ${mode} mode with ${dataSource} - SUCCESS`);
      if ('current_price' in result) {
        console.log(`   Found ${result.flights.length} flights`);
        console.log(`   Price level: ${result.current_price}`);
        if (result.flights.length > 0) {
          console.log(`   First flight: ${result.flights[0].name} - ${result.flights[0].price}`);
        }
      } else if ('raw' in result) {
        console.log(`   Found ${result.raw.length} raw flights`);
        console.log(`   Best flights: ${result.best.length}`);
        console.log(`   Other flights: ${result.other.length}`);
      }
    } else {
      console.log(`⚠️  ${mode} mode with ${dataSource} - No results`);
    }
  } catch (error) {
    console.log(`❌ ${mode} mode with ${dataSource} - FAILED:`, error instanceof Error ? error.message : String(error));
  }
}

async function testAllModes() {
  console.log('🚀 Testing all fetch modes and data sources...\n');
  
  const modes: FetchMode[] = ['common', 'bright-data', 'local', 'fallback', 'force-fallback'];
  const dataSources: DataSource[] = ['html', 'js'];
  
  for (const mode of modes) {
    for (const dataSource of dataSources) {
      await testMode(mode, dataSource);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('✅ = Working mode');
  console.log('⚠️  = No results (but no error)');
  console.log('❌ = Failed with error');
}

testAllModes().catch(console.error);