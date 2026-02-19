import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'jeeva_raksha',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
});

async function run() {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();
        console.log('Connected to:', client.database);

        const res = await client.query('SELECT id, name, status, created_at FROM patients ORDER BY created_at DESC LIMIT 5');
        console.log('Recent patients in DB:');
        res.rows.forEach(r => {
            console.log(`- ${r.name} (${r.status}) ${r.created_at}`);
        });

        const audit = await client.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 5');
        console.log('Recent audit logs in DB:');
        audit.rows.forEach(r => {
            console.log(`- ${r.action} ${r.entity_type} ${r.created_at}`);
        });

        client.release();
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

run();
