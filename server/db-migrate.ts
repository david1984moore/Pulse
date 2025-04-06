/**
 * Database migration script to add security-related columns to the users table
 * This can be run one time to upgrade the database schema safely without data loss
 */

import { Pool } from 'pg';
import { storage } from './storage';

async function migrateSecurityColumns() {
  console.log('Starting security columns migration');
  
  // Get the database pool from storage
  const db = (storage as any).pool as Pool;
  
  try {
    // Start a transaction so we can rollback if anything fails
    await db.query('BEGIN');
    
    // Check if columns exist before adding them to avoid errors
    const tableInfo = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    const existingColumns = tableInfo.rows.map(row => row.column_name);
    console.log('Existing columns:', existingColumns);
    
    // Add login_attempts column if it doesn't exist
    if (!existingColumns.includes('login_attempts')) {
      console.log('Adding login_attempts column');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN login_attempts INTEGER DEFAULT 0
      `);
    }
    
    // Add locked_until column if it doesn't exist
    if (!existingColumns.includes('locked_until')) {
      console.log('Adding locked_until column');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN locked_until TIMESTAMP
      `);
    }
    
    // Add reset_token column if it doesn't exist
    if (!existingColumns.includes('reset_token')) {
      console.log('Adding reset_token column');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN reset_token TEXT
      `);
    }
    
    // Add reset_token_expires column if it doesn't exist
    if (!existingColumns.includes('reset_token_expires')) {
      console.log('Adding reset_token_expires column');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN reset_token_expires TIMESTAMP
      `);
    }
    
    // Add last_login column if it doesn't exist
    if (!existingColumns.includes('last_login')) {
      console.log('Adding last_login column');
      await db.query(`
        ALTER TABLE users
        ADD COLUMN last_login TIMESTAMP
      `);
    }
    
    // Commit the transaction if everything succeeded
    await db.query('COMMIT');
    console.log('Security columns migration completed successfully');
  } catch (error) {
    // Rollback the transaction if anything failed
    await db.query('ROLLBACK');
    console.error('Error during security columns migration:', error);
  }
}

// If this file is run directly, execute the migration
if (require.main === module) {
  migrateSecurityColumns()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { migrateSecurityColumns };