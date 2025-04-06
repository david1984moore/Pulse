/**
 * Standalone script to run database migrations for security columns
 * Run this with: npx tsx server/run-migration.ts
 */

import { migrateSecurityColumns } from './db-migrate';

console.log('Starting security columns migration');

migrateSecurityColumns()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });