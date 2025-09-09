#!/usr/bin/env ts-node

/**
 * Script to port airports from CSV to TypeScript enum
 * This script reads the airports.csv file and generates a complete TypeScript enum
 */

import * as fs from 'fs';
import * as path from 'path';

interface AirportData {
  code: string;
  time_zone_id: string;
  name: string;
  city_code: string;
  country_id: string;
  location: string;
  elevation: string;
  url: string;
  icao: string;
  city: string;
  county: string;
  state: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseAirportsCSV(csvContent: string): AirportData[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const airports: AirportData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const airport: AirportData = {
        code: values[0] || '',
        time_zone_id: values[1] || '',
        name: values[2] || '',
        city_code: values[3] || '',
        country_id: values[4] || '',
        location: values[5] || '',
        elevation: values[6] || '',
        url: values[7] || '',
        icao: values[8] || '',
        city: values[9] || '',
        county: values[10] || '',
        state: values[11] || ''
      };
      
      // Only include airports with valid codes and names
      if (airport.code && airport.name) {
        airports.push(airport);
      }
    }
  }
  
  return airports;
}

function sanitizeEnumName(name: string): string {
  let sanitized = name
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .substring(0, 100); // Limit length to prevent extremely long names
  
  // If the name starts with a number, prefix it with "AIRPORT_"
  if (/^[0-9]/.test(sanitized)) {
    sanitized = 'AIRPORT_' + sanitized;
  }
  
  return sanitized;
}

function generateTypeScriptEnum(airports: AirportData[]): string {
  let enumContent = `/**
 * Airport enum - Complete list of airports from the original Python library
 * Generated from airports.csv with ${airports.length} airports
 */

export enum Airport {\n`;

  // Sort airports by code for better organization
  const sortedAirports = airports.sort((a, b) => a.code.localeCompare(b.code));
  const usedNames = new Set<string>();
  
  for (const airport of sortedAirports) {
    let enumName = sanitizeEnumName(airport.name);
    const code = airport.code;
    
    // Skip if we couldn't create a valid enum name
    if (!enumName || enumName.length < 3) {
      continue;
    }
    
    // Handle duplicates by appending the airport code
    let originalName = enumName;
    let counter = 1;
    while (usedNames.has(enumName)) {
      enumName = `${originalName}_${code}`;
      counter++;
    }
    
    usedNames.add(enumName);
    
    // Add comment with full airport name for reference
    const comment = airport.name.length > 50 
      ? `// ${airport.name.substring(0, 47)}...`
      : `// ${airport.name}`;
    
    enumContent += `  ${enumName} = "${code}", ${comment}\n`;
  }
  
  enumContent += '}\n';
  
  return enumContent;
}

function generateAirportSearchFunction(airports: AirportData[]): string {
  return `
/**
 * Search for airports by name, city, or code
 */
export function searchAirport(query: string): Array<{code: string, name: string, city: string, country: string}> {
  const searchTerm = query.toLowerCase();
  
  return airports
    .filter(airport => 
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.code.toLowerCase().includes(searchTerm) ||
      airport.icao.toLowerCase().includes(searchTerm)
    )
    .map(airport => ({
      code: airport.code,
      name: airport.name,
      city: airport.city || '',
      country: airport.country_id || ''
    }))
    .slice(0, 20); // Limit results to 20
}

// Airport data for search function
const airports: AirportData[] = ${JSON.stringify(airports, null, 2)};

interface AirportData {
  code: string;
  time_zone_id: string;
  name: string;
  city_code: string;
  country_id: string;
  location: string;
  elevation: string;
  url: string;
  icao: string;
  city: string;
  county: string;
  state: string;
}
`;
}

async function main() {
  try {
    console.log('🚀 Starting airport porting process...');
    
    // Read the CSV file
    const csvPath = '/tmp/airports.csv';
    if (!fs.existsSync(csvPath)) {
      console.error('❌ airports.csv file not found. Please ensure the file exists.');
      process.exit(1);
    }
    
    console.log('📖 Reading airports.csv...');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('🔄 Parsing CSV data...');
    const airports = parseAirportsCSV(csvContent);
    console.log(`✅ Parsed ${airports.length} airports`);
    
    // Generate TypeScript enum
    console.log('🔨 Generating TypeScript enum...');
    const enumContent = generateTypeScriptEnum(airports);
    
    // Generate search function
    console.log('🔍 Generating search function...');
    const searchFunction = generateAirportSearchFunction(airports);
    
    // Combine everything
    const fullContent = enumContent + searchFunction;
    
    // Write to airports.ts
    const outputPath = path.join(__dirname, '..', 'src', 'airports.ts');
    console.log(`💾 Writing to ${outputPath}...`);
    fs.writeFileSync(outputPath, fullContent, 'utf-8');
    
    console.log('✅ Successfully ported all airports to TypeScript!');
    console.log(`📊 Statistics:`);
    console.log(`   - Total airports: ${airports.length}`);
    console.log(`   - Output file: ${outputPath}`);
    console.log(`   - File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
    // Show some examples
    console.log('\n🔍 Example airports:');
    const examples = airports.slice(0, 5);
    examples.forEach(airport => {
      console.log(`   ${airport.code}: ${airport.name} (${airport.city || 'N/A'})`);
    });
    
  } catch (error) {
    console.error('❌ Error during porting process:', error);
    process.exit(1);
  }
}

// Run the script
main();