const express = require('express');
const { getDB } = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Add Skill to Registry
router.post('/registry', authenticateToken, async (req, res) => {
    const { academy_id, category, skill_name, description } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            'INSERT INTO skill_registry (academy_id, category, skill_name, description) VALUES (?, ?, ?, ?)',
            [academy_id, category, skill_name, description]
        );
        res.status(201).json({ id: result.lastID, message: 'Skill registered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Academy Skills
router.get('/registry/:academyId', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const skills = await db.all('SELECT * FROM skill_registry WHERE academy_id = ?', [req.params.academyId]);
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record Student Skill Score
router.post('/score', authenticateToken, async (req, res) => {
    const { student_id, skill_id, coach_id, score, assessment_date, notes } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO student_skill_scores (student_id, skill_id, coach_id, score, assessment_date, notes)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, skill_id, coach_id, score, assessment_date || new Date().toISOString().split('T')[0], notes]
        );
        res.status(201).json({ id: result.lastID, message: 'Skill score recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Student Progress (Historical Scores)
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const scores = await db.all(
            `SELECT sr.skill_name, sr.category, sss.* 
             FROM student_skill_scores sss
             JOIN skill_registry sr ON sss.skill_id = sr.id
             WHERE sss.student_id = ?
             ORDER BY sss.assessment_date DESC`,
            [req.params.studentId]
        );
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Latest Skill Profile for Student
router.get('/student/:studentId/profile', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const profile = await db.all(
            `SELECT sr.skill_name, sr.category, MAX(sss.assessment_date) as last_assessed, sss.score 
             FROM student_skill_scores sss
             JOIN skill_registry sr ON sss.skill_id = sr.id
             WHERE sss.student_id = ?
             GROUP BY sr.id`,
            [req.params.studentId]
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
