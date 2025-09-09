# Airport Porting Scripts

This directory contains scripts for porting airport data from the original Python library to the TypeScript library.

## Scripts

### `port-airports.ts`

This script reads the airports.csv file from the git history and generates a complete TypeScript enum with all airports.

**Usage:**
```bash
npx ts-node scripts/port-airports.ts
```

**What it does:**
1. Reads the airports.csv file from git history (commit HEAD~10)
2. Parses the CSV data to extract airport information
3. Generates a TypeScript enum with sanitized names
4. Handles duplicate names by appending airport codes
5. Creates a search function for finding airports
6. Writes the complete airports.ts file

**Features:**
- Handles 9,766+ airports from the original Python library
- Sanitizes airport names for valid TypeScript enum identifiers
- Prevents duplicate enum names
- Includes airport search functionality
- Generates comprehensive comments with full airport names

**Output:**
- `src/airports.ts` - Complete TypeScript enum with all airports
- File size: ~3.6MB
- All airports from the original Python library are included

## Data Source

The script uses the airports.csv file from the git history, which contains:
- Airport codes (IATA)
- Airport names
- City information
- Country codes
- Geographic coordinates
- ICAO codes
- And more metadata

## Notes

- The script automatically handles edge cases like names starting with numbers
- Duplicate airport names are resolved by appending the airport code
- The generated enum is fully compatible with TypeScript
- All airports from the original Python library are preserved