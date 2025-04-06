#!/usr/bin/env node

/**
 * This script runs the migration to add security columns to the database
 */

// Compile and run the TypeScript migration file
require('esbuild').buildSync({
  entryPoints: ['server/db-migrate.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'dist/db-migrate.js',
});

console.log('Running security columns migration...');
require('./dist/db-migrate.js');