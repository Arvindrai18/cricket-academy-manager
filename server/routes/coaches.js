const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Add Coach
router.post('/', async (req, res) => {
    const {
        academy_id, first_name, last_name, email, phone,
        specialization, certifications, experience_years, salary, joining_date
    } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO coaches 
             (academy_id, first_name, last_name, email, phone, specialization, certifications, experience_years, salary, joining_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, first_name, last_name, email, phone, specialization, certifications, experience_years, salary, joining_date]
        );
        res.status(201).json({ id: result.lastID, message: 'Coach added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Coaches for Academy
router.get('/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const coaches = await db.all(
            'SELECT * FROM coaches WHERE academy_id = ? AND is_active = 1 ORDER BY first_name',
            [req.params.academyId]
        );
        res.json(coaches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Coach Details with Assigned Batches
router.get('/detail/:coachId', async (req, res) => {
    try {
        const db = await getDB();

        const coach = await db.get('SELECT * FROM coaches WHERE id = ?', [req.params.coachId]);
        if (!coach) return res.status(404).json({ error: 'Coach not found' });

        const batches = await db.all(
            `SELECT b.*, COUNT(s.id) as student_count
             FROM coach_batch_assignments cba
             JOIN batches b ON cba.batch_id = b.id
             LEFT JOIN students s ON b.id = s.batch_id
             WHERE cba.coach_id = ? AND cba.is_active = 1
             GROUP BY b.id`,
            [req.params.coachId]
        );

        res.json({ ...coach, batches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign Coach to Batch
router.post('/assign', async (req, res) => {
    const { coach_id, batch_id } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `INSERT OR REPLACE INTO coach_batch_assignments (coach_id, batch_id)
             VALUES (?, ?)`,
            [coach_id, batch_id]
        );
        res.json({ message: 'Coach assigned to batch' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove Coach from Batch
router.delete('/assign/:coachId/:batchId', async (req, res) => {
    try {
        const db = await getDB();
        await db.run(
            'UPDATE coach_batch_assignments SET is_active = 0 WHERE coach_id = ? AND batch_id = ?',
            [req.params.coachId, req.params.batchId]
        );
        res.json({ message: 'Coach removed from batch' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Coach
router.put('/:id', async (req, res) => {
    const { first_name, last_name, email, phone, specialization, certifications, experience_years, salary } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE coaches 
             SET first_name = ?, last_name = ?, email = ?, phone = ?, specialization = ?, 
                 certifications = ?, experience_years = ?, salary = ?
             WHERE id = ?`,
            [first_name, last_name, email, phone, specialization, certifications, experience_years, salary, req.params.id]
        );
        res.json({ message: 'Coach updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deactivate Coach
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('UPDATE coaches SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Coach deactivated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
