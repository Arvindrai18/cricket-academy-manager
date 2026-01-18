const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Drill Template
router.post('/', async (req, res) => {
    const { academy_id, name, description, focus_area, duration_minutes, difficulty_level, equipment_needed } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO drill_templates (academy_id, name, description, focus_area, duration_minutes, difficulty_level, equipment_needed)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, name, description, focus_area, duration_minutes, difficulty_level, equipment_needed]
        );
        res.status(201).json({ id: result.lastID, message: 'Drill template created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Drill Templates for Academy
router.get('/:academyId', async (req, res) => {
    const { focus_area, difficulty_level } = req.query;

    try {
        const db = await getDB();

        let query = 'SELECT * FROM drill_templates WHERE academy_id = ?';
        let params = [req.params.academyId];

        if (focus_area) {
            query += ' AND focus_area = ?';
            params.push(focus_area);
        }
        if (difficulty_level) {
            query += ' AND difficulty_level = ?';
            params.push(difficulty_level);
        }

        query += ' ORDER BY name';

        const drills = await db.all(query, params);
        res.json(drills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Drill Template
router.put('/:id', async (req, res) => {
    const { name, description, focus_area, duration_minutes, difficulty_level, equipment_needed } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE drill_templates 
             SET name = ?, description = ?, focus_area = ?, duration_minutes = ?, difficulty_level = ?, equipment_needed = ?
             WHERE id = ?`,
            [name, description, focus_area, duration_minutes, difficulty_level, equipment_needed, req.params.id]
        );
        res.json({ message: 'Drill template updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Drill Template
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM drill_templates WHERE id = ?', [req.params.id]);
        res.json({ message: 'Drill template deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
