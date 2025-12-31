const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Add Student
router.post('/', async (req, res) => {
    const { academy_id, batch_id, first_name, last_name, dob, batting_style, bowling_style, parent_phone } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO students (academy_id, batch_id, first_name, last_name, dob, batting_style, bowling_style, parent_phone) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, batch_id, first_name, last_name, dob, batting_style, bowling_style, parent_phone]
        );
        res.status(201).json({ id: result.lastID, message: 'Student added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Students by Academy
router.get('/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        // Optional: Join with Batches to get batch name
        const students = await db.all(
            `SELECT s.*, b.name as batch_name 
             FROM students s 
             LEFT JOIN batches b ON s.batch_id = b.id 
             WHERE s.academy_id = ?`,
            [req.params.academyId]
        );
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
