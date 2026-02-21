import { pool } from './server/db.js';

async function checkSchema() {
    try {
        console.log('--- audit_logs columns ---');
        const auditCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'audit_logs'
            ORDER BY column_name
        `);
        console.table(auditCols.rows);

        console.log('\n--- users columns ---');
        const userCols = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY column_name
        `);
        console.table(userCols.rows);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkSchema();
