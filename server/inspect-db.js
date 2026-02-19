import pool from './db.js';

async function inspectTable() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log('--- Columns in "users" table ---');
        res.rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

        const tables = await pool.query(`
            SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
        `);
        console.log('\n--- All Tables ---');
        tables.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectTable();
