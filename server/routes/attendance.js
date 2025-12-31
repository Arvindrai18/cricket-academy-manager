const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Mark Attendance (Bulk)
router.post('/', async (req, res) => {
    const { batch_id, date, records } = req.body;
    // records: [{ student_id: 1, status: 'PRESENT' }, ...]

    try {
        const db = await getDB();
        await db.exec('BEGIN TRANSACTION');

        const stmt = await db.prepare(
            `INSERT INTO attendance (student_id, batch_id, date, status) 
             VALUES (?, ?, ?, ?)
             ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status`
        );

        for (const record of records) {
            await stmt.run(record.student_id, batch_id, date, record.status);
        }

        await stmt.finalize();
        await db.exec('COMMIT');
        res.status(200).json({ message: 'Attendance recorded' });
    } catch (error) {
        await db.exec('ROLLBACK'); // Requires db instance to have exec method? sqlite generic yes.
        res.status(500).json({ error: error.message });
    }
});

// Get Attendance for a Batch on a Date
router.get('/:batchId/:date', async (req, res) => {
    try {
        const db = await getDB();
        const attendance = await db.all(
            `SELECT student_id, status FROM attendance WHERE batch_id = ? AND date = ?`,
            [req.params.batchId, req.params.date]
        );
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
