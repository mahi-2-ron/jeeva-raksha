// ─── Jeeva Raksha — Seed Passwords ───────────────────────────
// Hashes demo account passwords using bcryptjs and updates the DB.
// Run: node server/seed-passwords.js
// ─────────────────────────────────────────────────────────────
import bcrypt from 'bcryptjs';
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

const DEMO_ACCOUNTS = [
    { email: 'rajesh.kumar@jeevaraksha.in', password: 'admin123' },
    { email: 'aditi.sharma@jeevaraksha.in', password: 'doctor123' },
    { email: 'karthik.iyer@jeevaraksha.in', password: 'pharma123' },
    { email: 'meera.nair@jeevaraksha.in', password: 'patient123' },
];

async function seed() {
    console.log('🔐 Seeding password hashes...\n');

    for (const account of DEMO_ACCOUNTS) {
        const hash = await bcrypt.hash(account.password, 10);
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING employee_id, name',
            [hash, account.email]
        );
        if (result.rows.length > 0) {
            const u = result.rows[0];
            console.log(`  ✅ ${u.name} — ${account.email} / ${account.password}`);
        } else {
            console.log(`  ⚠️  No user found for ${account.email}`);
        }
    }

    console.log('\n✨ Done! Demo accounts ready.\n');
    console.log('Login credentials:');
    console.log('─────────────────────────────────────────────');
    console.log('  Admin:      admin@jeevaraksha.in / admin123');
    console.log('  Doctor:     aditi.sharma@jeevaraksha.in / doctor123');
    console.log('  Pharmacist: pharmacist@jeevaraksha.in / pharma123');
    console.log('  Patient:    patient@jeevaraksha.in / patient123');
    console.log('  Demo:       demo@jeevaraksha.in / demo123');
    console.log('─────────────────────────────────────────────\n');

    await pool.end();
}

seed().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
