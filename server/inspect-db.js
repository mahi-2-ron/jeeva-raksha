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

        const users = await pool.query(`
            SELECT u.email, u.name, r.role_name 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
        `);
        console.log('--- Users ---');
        users.rows.forEach(row => {
            console.log(`- ${row.email} (${row.role_name})`);
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

inspectTable();
