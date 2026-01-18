const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db');
const { SECRET_KEY } = require('../middleware/auth');
const router = express.Router();

// Parent Registration
router.post('/register', async (req, res) => {
    const { academy_id, first_name, last_name, email, password, phone, student_ids, relationship } = req.body;

    try {
        const db = await getDB();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create parent
        const result = await db.run(
            `INSERT INTO parents (academy_id, first_name, last_name, email, password, phone)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [academy_id, first_name, last_name, email, hashedPassword, phone]
        );

        const parentId = result.lastID;

        // Link to students
        if (student_ids && student_ids.length > 0) {
            const stmt = await db.prepare(
                'INSERT INTO parent_student_links (parent_id, student_id, relationship) VALUES (?, ?, ?)'
            );

            for (const studentId of student_ids) {
                await stmt.run(parentId, studentId, relationship || 'GUARDIAN');
            }

            await stmt.finalize();
        }

        res.status(201).json({ id: parentId, message: 'Parent registered successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Parent Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = await getDB();
        const parent = await db.get('SELECT * FROM parents WHERE email = ?', [email]);

        if (!parent) return res.status(404).json({ error: 'Parent not found' });

        const valid = await bcrypt.compare(password, parent.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: parent.id, type: 'PARENT', email: parent.email },
            SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            parent: { id: parent.id, first_name: parent.first_name, last_name: parent.last_name, email: parent.email }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Parent Dashboard (Children Info)
router.get('/dashboard/:parentId', async (req, res) => {
    try {
        const db = await getDB();

        // Get all linked students
        const students = await db.all(
            `SELECT s.*, psl.relationship, b.name as batch_name
             FROM students s
             JOIN parent_student_links psl ON s.id = psl.student_id
             LEFT JOIN batches b ON s.batch_id = b.id
             WHERE psl.parent_id = ?`,
            [req.params.parentId]
        );

        // For each student, get latest stats
        const studentsWithData = await Promise.all(students.map(async (student) => {
            // Attendance last 30 days
            const attendance = await db.get(
                `SELECT 
                    COUNT(*) as total_days,
                    SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as present_days
                 FROM attendance 
                 WHERE student_id = ? AND date >= DATE('now', '-30 days')`,
                [student.id]
            );

            // Pending fees
            const fees = await db.all(
                `SELECT * FROM fee_payments 
                 WHERE student_id = ? AND status = 'PENDING'
                 ORDER BY due_date ASC`,
                [student.id]
            );

            // Performance stats
            const performance = await db.get(
                `SELECT 
                    COUNT(*) as matches_played,
                    SUM(runs_scored) as total_runs,
                    SUM(wickets_taken) as total_wickets
                 FROM student_match_performances
                 WHERE student_id = ?`,
                [student.id]
            );

            return {
                ...student,
                attendance: attendance || { total_days: 0, present_days: 0 },
                pending_fees: fees,
                performance: performance || { matches_played: 0, total_runs: 0, total_wickets: 0 }
            };
        }));

        res.json(studentsWithData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Child's Detailed Performance
router.get('/student/:studentId/performance', async (req, res) => {
    try {
        const db = await getDB();

        const performances = await db.all(
            `SELECT p.*, m.team_a_name, m.team_b_name, m.venue, m.match_date
             FROM student_match_performances p
             JOIN matches m ON p.match_id = m.id
             WHERE p.student_id = ?
             ORDER BY m.match_date DESC`,
            [req.params.studentId]
        );

        res.json(performances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Child's Attendance History
router.get('/student/:studentId/attendance', async (req, res) => {
    const { from_date, to_date } = req.query;

    try {
        const db = await getDB();

        let query = 'SELECT * FROM attendance WHERE student_id = ?';
        let params = [req.params.studentId];

        if (from_date) {
            query += ' AND date >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND date <= ?';
            params.push(to_date);
        }

        query += ' ORDER BY date DESC LIMIT 100';

        const attendance = await db.all(query, params);
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Link Additional Child
router.post('/link-student', async (req, res) => {
    const { parent_id, student_id, relationship } = req.body;

    try {
        const db = await getDB();
        await db.run(
            'INSERT INTO parent_student_links (parent_id, student_id, relationship) VALUES (?, ?, ?)',
            [parent_id, student_id, relationship || 'GUARDIAN']
        );
        res.json({ message: 'Student linked successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Student already linked' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
