import { pool } from './server/db.js';

async function checkSchema() {
    try {
        console.log('Checking audit_logs schema...');
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'audit_logs'
        `);
        console.table(res.rows);

        console.log('\nChecking first row...');
        const first = await pool.query('SELECT * FROM audit_logs LIMIT 1');
        console.log(first.rows);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkSchema();
