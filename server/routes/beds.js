import { Router } from 'express';
import pool, { withTransaction } from '../db.js';
import { authorize } from '../middleware/authMiddleware.js';
import { logAudit, getClientIP } from '../middleware/auditMiddleware.js';

const router = Router();
const adminOnly = authorize('admin');

// ─── WARDS ───────────────────────────────────────────────────

// GET /api/wards
router.get('/wards', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT w.*,
        (SELECT COUNT(*) FROM beds b WHERE b.ward_id = w.id) as total_beds,
        (SELECT COUNT(*) FROM beds b WHERE b.ward_id = w.id AND b.status = 'Available') as available_beds,
        (SELECT COUNT(*) FROM beds b WHERE b.ward_id = w.id AND b.status = 'Occupied') as occupied_beds
      FROM wards w
      WHERE w.status != 'deleted'
      ORDER BY w.name ASC
    `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/wards — admin only
router.post('/wards', adminOnly, async (req, res) => {
    try {
        const { name, code, ward_type, floor, total_capacity } = req.body;
        const result = await pool.query(
            `INSERT INTO wards (name, code, ward_type, floor, total_capacity)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, code, ward_type, floor, total_capacity || 0]
        );

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'CREATE',
            entityType: 'ward',
            entityId: result.rows[0].id,
            module: 'wards',
            details: `Created ward: ${name} (${code})`,
            newValues: result.rows[0],
            ipAddress: getClientIP(req)
        });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/wards/:id — admin only
router.patch('/wards/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;
        const keys = Object.keys(fields).filter(k => !['id', 'created_at'].includes(k));
        if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

        const old = await pool.query('SELECT * FROM wards WHERE id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ error: 'Ward not found' });

        const sets = keys.map((k, i) => `${k} = $${i + 2}`);
        const values = keys.map(k => fields[k]);

        const result = await pool.query(
            `UPDATE wards SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'UPDATE',
            entityType: 'ward',
            entityId: id,
            module: 'wards',
            details: `Updated ward: ${result.rows[0].name}`,
            oldValues: old.rows[0],
            newValues: result.rows[0],
            ipAddress: getClientIP(req)
        });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/wards/:id — soft delete
router.delete('/wards/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Count beds
        const beds = await pool.query('SELECT COUNT(*) FROM beds WHERE ward_id = $1 AND status != $2', [id, 'deleted']);
        if (parseInt(beds.rows[0].count) > 0) {
            return res.status(409).json({ error: 'Cannot delete ward with active beds' });
        }

        const old = await pool.query('SELECT * FROM wards WHERE id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ error: 'Ward not found' });

        await pool.query("UPDATE wards SET status = 'deleted', updated_at = NOW() WHERE id = $1", [id]);

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'SOFT_DELETE',
            entityType: 'ward',
            entityId: id,
            module: 'wards',
            details: `Soft-deleted ward: ${old.rows[0].name}`,
            oldValues: old.rows[0],
            ipAddress: getClientIP(req)
        });

        res.json({ message: 'Ward deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── BEDS ────────────────────────────────────────────────────

// GET /api/beds
router.get('/beds', async (req, res) => {
    try {
        const { ward_id, status } = req.query;
        let query = `
      SELECT b.*, w.name as ward_name, w.ward_type,
        (SELECT json_build_object('patient_name', p.name, 'uhid', p.uhid)
         FROM admissions a JOIN patients p ON a.patient_id = p.id
         WHERE a.bed_id = b.id AND a.status = 'admitted'
         LIMIT 1) as current_patient
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      WHERE b.status != 'deleted'
    `;
        const params = [];
        if (ward_id) { params.push(ward_id); query += ` AND b.ward_id = $${params.length}`; }
        if (status) { params.push(status); query += ` AND b.status = $${params.length}`; }
        query += ' ORDER BY w.name, b.bed_number ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/beds — admin only
router.post('/beds', adminOnly, async (req, res) => {
    try {
        const { ward_id, bed_number, status = 'Available' } = req.body;
        const result = await pool.query(
            `INSERT INTO beds (ward_id, bed_number, status)
             VALUES ($1, $2, $3) RETURNING *`,
            [ward_id, bed_number, status]
        );

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'CREATE',
            entityType: 'bed',
            entityId: result.rows[0].id,
            module: 'beds',
            details: `Created bed: ${bed_number}`,
            newValues: result.rows[0],
            ipAddress: getClientIP(req)
        });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/beds/:id — update status or details
router.patch('/beds/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;

        // Non-admins can only update status
        if (req.user.role !== 'admin') {
            const forbiddenKeys = Object.keys(fields).filter(k => k !== 'status');
            if (forbiddenKeys.length > 0) {
                return res.status(403).json({ error: 'Only admins can update bed details (ward/number)' });
            }
        }

        const keys = Object.keys(fields).filter(k => !['id', 'created_at'].includes(k));
        if (keys.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

        const old = await pool.query('SELECT * FROM beds WHERE id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ error: 'Bed not found' });

        const sets = keys.map((k, i) => `${k} = $${i + 2}`);
        const values = keys.map(k => fields[k]);

        const result = await pool.query(
            `UPDATE beds SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...values]
        );

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'UPDATE',
            entityType: 'bed',
            entityId: id,
            module: 'beds',
            details: `Updated bed: ${result.rows[0].bed_number}`,
            oldValues: old.rows[0],
            newValues: result.rows[0],
            ipAddress: getClientIP(req)
        });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/beds/:id — admin only
router.delete('/beds/:id', adminOnly, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if occupied
        const old = await pool.query('SELECT * FROM beds WHERE id = $1', [id]);
        if (old.rows.length === 0) return res.status(404).json({ error: 'Bed not found' });

        if (old.rows[0].status === 'Occupied') {
            return res.status(409).json({ error: 'Cannot delete an occupied bed' });
        }

        await pool.query("UPDATE beds SET status = 'deleted', updated_at = NOW() WHERE id = $1", [id]);

        await logAudit({
            userId: req.user.id,
            userName: req.user.name,
            action: 'SOFT_DELETE',
            entityType: 'bed',
            entityId: id,
            module: 'beds',
            details: `Soft-deleted bed: ${old.rows[0].bed_number}`,
            oldValues: old.rows[0],
            ipAddress: getClientIP(req)
        });

        res.json({ message: 'Bed deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
