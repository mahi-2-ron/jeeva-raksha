// ─── Jeeva Raksha — Database Service Layer ────────────────────
// Enhanced PostgreSQL connection pool with transaction support,
// health checks, and structured error handling.
// ──────────────────────────────────────────────────────────────
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const connectionConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isProduction ? { rejectUnauthorized: false } : false
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'jeeva_raksha',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
    };

const pool = new pg.Pool({
    ...connectionConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err);
});

pool.on('connect', () => {
    console.log('[DB] New client connected to pool');
});

// ─── Query wrapper with logging ──────────────────────────────
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`[DB] Slow query (${duration}ms):`, text.substring(0, 100));
        }
        return result;
    } catch (err) {
        console.error('[DB] Query error:', err.message);
        console.error('[DB] Query text:', text.substring(0, 200));
        throw err;
    }
}

// ─── Transaction helper ──────────────────────────────────────
// Usage:
//   const client = await getClient();
//   try {
//       await client.query('BEGIN');
//       // ... do work ...
//       await client.query('COMMIT');
//   } catch (err) {
//       await client.query('ROLLBACK');
//       throw err;
//   } finally {
//       client.release();
//   }
async function getClient() {
    const client = await pool.connect();
    return client;
}

/**
 * Run a function within a database transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK.
 *
 * Usage:
 *   const result = await withTransaction(async (client) => {
 *       await client.query('INSERT INTO ...');
 *       return { success: true };
 *   });
 */
async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// ─── Health check ────────────────────────────────────────────
async function healthCheck() {
    try {
        const result = await pool.query('SELECT NOW() as time, current_database() as database');
        return {
            status: 'connected',
            database: result.rows[0].database,
            time: result.rows[0].time,
            pool: {
                total: pool.totalCount,
                idle: pool.idleCount,
                waiting: pool.waitingCount,
            },
        };
    } catch (err) {
        return {
            status: 'disconnected',
            error: err.message,
        };
    }
}

// ─── Exports ─────────────────────────────────────────────────
export default pool;
export { pool, query, getClient, withTransaction, healthCheck };
