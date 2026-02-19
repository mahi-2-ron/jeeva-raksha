// ─── Jeeva Raksha — Auth Routes (JWT Login System) ───────────
// POST /api/auth/login    — email + password login
// POST /api/auth/demo     — instant demo login
// GET  /api/auth/me       — verify token & return user
// POST /api/auth/logout   — log logout event
// ─────────────────────────────────────────────────────────────
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'jeevaraksha-secret-key-change-in-production';
const JWT_EXPIRES = '8h';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINS = 15;

// ─── Helper: generate JWT ────────────────────────────────────
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            employee_id: user.employee_id,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

// ─── Helper: log login activity ──────────────────────────────
async function logLogin(userId, email, action, req) {
    try {
        await pool.query(
            `INSERT INTO login_logs (user_id, email, action, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                userId || null,
                email,
                action,
                req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown',
                req.headers['user-agent'] || 'unknown',
            ]
        );
    } catch (err) {
        console.error('[AUTH] Failed to log login activity:', err.message);
    }
}

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const result = await pool.query(
            `SELECT u.*, r.role_name as role, u.department as department_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.email = $1`,
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            await logLogin(null, email, 'login_failed', req);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check if account is active
        if (user.status === 'inactive' || user.status === 'deleted') {
            await logLogin(user.id, email, 'login_failed', req);
            return res.status(403).json({
                error: 'Account deactivated',
                message: 'Your account has been deactivated. Please contact the administrator.',
            });
        }

        // Check if account is locked
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const remainingMins = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
            await logLogin(user.id, email, 'locked', req);
            return res.status(423).json({
                error: 'Account locked',
                message: `Too many failed attempts. Account locked for ${remainingMins} more minute(s).`,
            });
        }

        // Verify password
        if (!user.password_hash) {
            return res.status(401).json({ error: 'Password not set. Please contact administrator.' });
        }

        const passwordValid = await bcrypt.compare(password, user.password_hash);

        if (!passwordValid) {
            // Increment login attempts
            const attempts = (user.login_attempts || 0) + 1;
            const updates = { login_attempts: attempts };

            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                const lockUntil = new Date(Date.now() + LOCK_DURATION_MINS * 60000);
                await pool.query(
                    'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
                    [attempts, lockUntil, user.id]
                );
                await logLogin(user.id, email, 'locked', req);
                return res.status(423).json({
                    error: 'Account locked',
                    message: `Too many failed attempts. Account locked for ${LOCK_DURATION_MINS} minutes.`,
                });
            }

            await pool.query(
                'UPDATE users SET login_attempts = $1 WHERE id = $2',
                [attempts, user.id]
            );
            await logLogin(user.id, email, 'login_failed', req);

            return res.status(401).json({
                error: 'Invalid email or password',
                remaining_attempts: MAX_LOGIN_ATTEMPTS - attempts,
            });
        }

        // ── Success ──
        // Reset login attempts, update last_login
        await pool.query(
            'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1',
            [user.id]
        );

        const token = generateToken(user);
        await logLogin(user.id, email, 'login_success', req);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                employee_id: user.employee_id,
                department: user.department_name,
                specialization: user.specialization,
            },
        });
    } catch (err) {
        console.error('[AUTH] Login error:', err);
        res.status(500).json({ error: 'Login failed', message: err.message });
    }
});

// ─── POST /api/auth/demo — instant demo login ───────────────
router.post('/demo', async (req, res) => {
    try {
        const { role } = req.body;
        const targetRole = role || 'demo';

        // Find a user with the requested role for demo purposes
        const result = await pool.query(
            `SELECT u.*, r.role_name as role, u.department as department_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE (r.role_name ILIKE $1 OR u.designation ILIKE $1) AND u.status = 'active'
             ORDER BY u.created_at ASC LIMIT 1`,
            [targetRole]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: `No ${targetRole} account available for demo` });
        }

        const user = result.rows[0];
        const token = generateToken({ ...user, role: 'demo' }); // Force demo role in token

        await logLogin(user.id, user.email, 'demo_login', req);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'demo',
                employee_id: user.employee_id,
                department: user.department_name,
                specialization: user.specialization,
                demo_as: targetRole, // what role they're demoing
            },
            isDemo: true,
        });
    } catch (err) {
        console.error('[AUTH] Demo login error:', err);
        res.status(500).json({ error: 'Demo login failed' });
    }
});

// ─── GET /api/auth/me — verify token & return user ──────────
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch fresh user data
        const result = await pool.query(
            `SELECT u.*, r.role_name as role, u.department as department_name
             FROM users u
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE u.id = $1 AND u.status != 'deleted'`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found or deactivated' });
        }

        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: decoded.role, // use role from token (may be 'demo')
                employee_id: user.employee_id,
                department: user.department_name,
                specialization: user.specialization,
            },
            isDemo: decoded.role === 'demo',
        });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', expired: true });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('[AUTH] /me error:', err);
        res.status(500).json({ error: 'Authentication check failed' });
    }
});

// ─── POST /api/auth/logout ───────────────────────────────────
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                await logLogin(decoded.id, decoded.email, 'logout', req);
            } catch {
                // Token might be expired, still log it
            }
        }
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// ─── Export JWT_SECRET for middleware ─────────────────────────
export { JWT_SECRET };
export default router;
