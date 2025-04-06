#!/bin/bash

# This script runs the migration to add security columns to the database

# Create dist directory if it doesn't exist
mkdir -p dist

# Compile the TypeScript file
echo "Compiling the migration script..."
npx esbuild server/db-migrate.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/db-migrate.cjs

# Run the compiled script
echo "Running the migration script..."
node dist/db-migrate.cjs

echo "Migration process complete."