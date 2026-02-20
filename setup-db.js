
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get the connection string from environment variable or command line argument
const connectionString = process.env.DATABASE_URL || process.argv[2];

if (!connectionString) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    console.error('Usage: node setup-db.js "postgresql://user:pass@host:port/dbname"');
    process.exit(1);
}

// Create a new client
const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false } // Required for Railway/Heroku
});

async function runSetup() {
    try {
        console.log('🔌 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        // 1. Read the schema file
        console.log('📂 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'server', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // 2. Execute the schema
        console.log('🚀 Running schema migration...');
        await client.query(schemaSql);
        console.log('✅ Schema created successfully!');

        // 3. Read the auth migration file (optional but recommended)
        console.log('📂 Reading migration_auth.sql...');
        const migrationPath = path.join(__dirname, 'server', 'migration_auth.sql');
        if (fs.existsSync(migrationPath)) {
            const migrationSql = fs.readFileSync(migrationPath, 'utf8');
            console.log('🚀 Running auth migration...');
            await client.query(migrationSql);
            console.log('✅ Auth migration completed!');
        } else {
            console.warn('⚠️  migration_auth.sql not found, skipping.');
        }

        console.log('\n🎉 DATABASE SETUP COMPLETE! You can now use the app.');

    } catch (err) {
        console.error('❌ Database setup failed:', err);
    } finally {
        await client.end();
    }
}

runSetup();
