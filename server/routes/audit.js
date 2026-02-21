import { Router } from 'express';
import pool from '../db.js';

const router = Router();

// GET /api/audit-logs — paginated
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, user_id, action, entity_type } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const conditions = [];
        const params = [];

        if (user_id) {
            params.push(user_id);
            conditions.push(`al.user_id = $${params.length}`);
        }
        if (action) {
            params.push(action);
            conditions.push(`al.action = $${params.length}`);
        }
        if (entity_type) {
            params.push(entity_type);
            conditions.push(`al.entity_type = $${params.length}`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM audit_logs al ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Fetch paginated data
        const query = `
            SELECT al.*, u.name as user_display_name
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ${whereClause}
            ORDER BY al.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        params.push(parseInt(limit), offset);
        const result = await pool.query(query, params);

        res.json({
            data: result.rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('[AUDIT ROUTE ERROR]', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/audit-logs — create entry
router.post('/', async (req, res) => {
    try {
        const { user_id, user_name, session_id, action, entity_type, entity_id, module, details } = req.body;
        const result = await pool.query(
            `INSERT INTO audit_logs (user_id, user_name, session_id, action, entity_type, entity_id, module, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [user_id || null, user_name || null, session_id || null, action, entity_type, entity_id || null, module || null, details || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
