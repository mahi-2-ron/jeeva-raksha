import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigration() {
    console.log('🚀 Starting Auth Migration...');

    try {
        const migrationPath = path.join(__dirname, 'migration_auth.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL by semicolons, but be careful with DO blocks
        // For simplicity, we can run the whole block if pg supports it
        // Or we can just use the pool to query the whole string.

        await pool.query(sql);
        console.log('✅ Auth migration applied successfully!');

        // Now run the seed script to ensure passwords are set
        console.log('🌱 Running password seeding...');
        // We'll just trigger the seed function logic here or run it via dynamic import
        const seedModule = await import('./seed-passwords.js');
        // seed-passwords.js runs automatically on import if it calls itself, 
        // but it might have pool.end() which we need to be careful with.

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applyMigration();
