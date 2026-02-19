// ─── Jeeva Raksha — Patient CRUD Routes (Production-Grade) ───
// Full CRUD with duplicate detection, soft-delete, UHID lookup,
// audit logging, transactions, and input validation.
// ─────────────────────────────────────────────────────────────
import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { authorize } from '../middleware/authMiddleware.js';
import { validateRequired } from '../middleware/validate.js';
import { logAudit, getClientIP } from '../middleware/auditMiddleware.js';

const router = Router();

// ─── GET /api/patients — list + search (excludes deleted) ────
router.get('/', async (req, res) => {
    try {
        const { search, status, page = 1, limit = 100 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = `
            SELECT p.*,
              (SELECT json_agg(json_build_object(
                'date', v.visit_date, 'reason', v.chief_complaint,
                'doctor', u.name, 'type', v.visit_type
              ) ORDER BY v.visit_date DESC)
              FROM visits v JOIN users u ON v.doctor_id = u.id
              WHERE v.patient_id = p.id
              ) as history
            FROM patients p WHERE p.status != 'deleted'
        `;
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (p.name ILIKE $${params.length} OR p.uhid ILIKE $${params.length} OR p.phone ILIKE $${params.length})`;
        }
        if (status && status !== 'all') {
            params.push(status);
            query += ` AND p.status = $${params.length}`;
        }

        // Count total
        const countQuery = query.replace(
            /SELECT p\.\*,[\s\S]*?FROM patients p/,
            'SELECT COUNT(*) as total FROM patients p'
        );
        const countResult = await pool.query(countQuery, params);

        query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);
        res.json({
            data: result.rows,
            total: parseInt(countResult.rows[0].total),
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (err) {
        console.error('[patients] list error:', err);
        res.status(500).json({ error: 'Failed to fetch patients', message: err.message });
    }
});

// ─── GET /api/patients/uhid/:uhid — lookup by UHID ──────────
router.get('/uhid/:uhid', async (req, res) => {
    try {
        const { uhid } = req.params;
        const result = await pool.query(
            'SELECT * FROM patients WHERE uhid = $1 AND status != $2',
            [uhid, 'deleted']
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found', uhid });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[patients] uhid lookup error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/patients/:id — single patient + full history ───
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const patient = await pool.query(
            'SELECT * FROM patients WHERE id = $1 AND status != $2',
            [id, 'deleted']
        );
        if (patient.rows.length === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const [visits, admissions, appointments] = await Promise.all([
            pool.query(
                `SELECT v.*, u.name as doctor_name FROM visits v
                 JOIN users u ON v.doctor_id = u.id
                 WHERE v.patient_id = $1 ORDER BY v.visit_date DESC`, [id]
            ),
            pool.query(
                `SELECT a.*, w.name as ward_name, b.bed_number
                 FROM admissions a
                 JOIN wards w ON a.ward_id = w.id
                 JOIN beds b ON a.bed_id = b.id
                 WHERE a.patient_id = $1 ORDER BY a.admit_date DESC`, [id]
            ),
            pool.query(
                `SELECT a.*, u.name as doctor_name FROM appointments a
                 JOIN users u ON a.doctor_id = u.id
                 WHERE a.patient_id = $1 ORDER BY a.slot_time DESC LIMIT 10`, [id]
            ),
        ]);

        res.json({
            ...patient.rows[0],
            visits: visits.rows,
            admissions: admissions.rows,
            appointments: appointments.rows,
        });
    } catch (err) {
        console.error('[patients] detail error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ─── POST /api/patients — register new patient ──────────────
router.post('/',
    authorize('admin'),
    validateRequired(['name', 'date_of_birth', 'gender']),
    async (req, res) => {
        try {
            const result = await withTransaction(async (client) => {
                const {
                    name, date_of_birth, gender, blood_group, phone, email,
                    address, city, state, pincode,
                    emergency_contact_name, emergency_contact_phone,
                    allergies, chronic_conditions, insurance_provider, insurance_policy_no
                } = req.body;

                // ── Duplicate check (name + DOB + phone) ──
                if (phone) {
                    const dup = await client.query(
                        `SELECT id, uhid, name FROM patients
                         WHERE name ILIKE $1 AND date_of_birth = $2 AND phone = $3 AND status != 'deleted'`,
                        [name, date_of_birth, phone]
                    );
                    if (dup.rows.length > 0) {
                        const existing = dup.rows[0];
                        return {
                            duplicate: true,
                            existing,
                        };
                    }
                }

                // ── Auto-generate UHID ──
                const countResult = await client.query('SELECT COUNT(*) FROM patients');
                const nextId = parseInt(countResult.rows[0].count) + 1;
                const uhid = `UHID-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;

                // ── Insert ──
                const insertResult = await client.query(
                    `INSERT INTO patients (
                        uhid, name, date_of_birth, gender, blood_group, phone, email,
                        address, city, state, pincode,
                        emergency_contact_name, emergency_contact_phone,
                        allergies, chronic_conditions, insurance_provider, insurance_policy_no
                    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
                    RETURNING *`,
                    [
                        uhid, name, date_of_birth, gender,
                        blood_group || null, phone || null, email || null,
                        address || null, city || null, state || null, pincode || null,
                        emergency_contact_name || null, emergency_contact_phone || null,
                        allergies || '{}', chronic_conditions || '{}',
                        insurance_provider || null, insurance_policy_no || null,
                    ]
                );

                // ── Audit log ──
                await logAudit({
                    userId: req.user.id,
                    userName: req.user.name,
                    action: 'CREATE',
                    entityType: 'patient',
                    entityId: insertResult.rows[0].id,
                    module: 'patients',
                    details: `Registered patient: ${name} (${uhid})`,
                    newValues: insertResult.rows[0],
                    ipAddress: getClientIP(req),
                }, client);

                return { patient: insertResult.rows[0] };
            });

            // Handle duplicate response
            if (result.duplicate) {
                return res.status(409).json({
                    error: 'Duplicate patient detected',
                    message: `Patient "${result.existing.name}" (${result.existing.uhid}) already exists with same name, DOB, and phone.`,
                    existing_patient: result.existing,
                });
            }

            res.status(201).json(result.patient);
        } catch (err) {
            console.error('[patients] create error:', err);
            res.status(500).json({ error: 'Failed to register patient', message: err.message });
        }
    }
);

// ─── PATCH /api/patients/:id — update patient ────────────────
router.patch('/:id',
    authorize('admin'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const fields = req.body;
            const keys = Object.keys(fields).filter(k => !['id', 'uhid', 'created_at'].includes(k));
            if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

            // Fetch old values for audit
            const old = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
            if (old.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

            const sets = keys.map((k, i) => `${k} = $${i + 2}`);
            const values = keys.map(k => fields[k]);

            const result = await pool.query(
                `UPDATE patients SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`,
                [id, ...values]
            );

            // Audit log
            await logAudit({
                userId: req.user.id,
                userName: req.user.name,
                action: 'UPDATE',
                entityType: 'patient',
                entityId: id,
                module: 'patients',
                details: `Updated fields: ${keys.join(', ')}`,
                oldValues: old.rows[0],
                newValues: result.rows[0],
                ipAddress: getClientIP(req),
            });

            res.json(result.rows[0]);
        } catch (err) {
            console.error('[patients] update error:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

// ─── DELETE /api/patients/:id — soft delete (or hard for admin) ─
router.delete('/:id',
    authorize('admin'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const hardDelete = req.query.hard === 'true' && req.user.role === 'admin';

            // Fetch patient before delete
            const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [id]);
            if (patient.rows.length === 0) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            const patientData = patient.rows[0];

            if (patientData.status === 'deleted') {
                return res.status(410).json({ error: 'Patient is already deleted' });
            }

            if (hardDelete) {
                // ── Hard delete (admin only) ──
                await pool.query('DELETE FROM patients WHERE id = $1', [id]);

                await logAudit({
                    userId: req.user.id,
                    userName: req.user.name,
                    action: 'HARD_DELETE',
                    entityType: 'patient',
                    entityId: id,
                    module: 'patients',
                    details: `Permanently deleted patient: ${patientData.name} (${patientData.uhid})`,
                    oldValues: patientData,
                    ipAddress: getClientIP(req),
                });

                res.json({ message: 'Patient permanently deleted', uhid: patientData.uhid });
            } else {
                // ── Soft delete ──
                await pool.query(
                    "UPDATE patients SET status = 'inactive', updated_at = NOW() WHERE id = $1",
                    [id]
                );

                await logAudit({
                    userId: req.user.id,
                    userName: req.user.name,
                    action: 'SOFT_DELETE',
                    entityType: 'patient',
                    entityId: id,
                    module: 'patients',
                    details: `Soft-deleted patient: ${patientData.name} (${patientData.uhid})`,
                    oldValues: { status: patientData.status },
                    newValues: { status: 'inactive' },
                    ipAddress: getClientIP(req),
                });

                res.json({ message: 'Patient deactivated (soft delete)', uhid: patientData.uhid, status: 'inactive' });
            }
        } catch (err) {
            console.error('[patients] delete error:', err);
            res.status(500).json({ error: err.message });
        }
    }
);

export default router;
