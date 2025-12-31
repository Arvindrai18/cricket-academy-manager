const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Batch
router.post('/', async (req, res) => {
    const { academy_id, name, schedule_time, coach_name } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO batches (academy_id, name, schedule_time, coach_name) VALUES (?, ?, ?, ?)`,
            [academy_id, name, schedule_time, coach_name]
        );
        res.status(201).json({ id: result.lastID, message: 'Batch created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Batches for an Academy
router.get('/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const batches = await db.all('SELECT * FROM batches WHERE academy_id = ?', [req.params.academyId]);
        res.json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
