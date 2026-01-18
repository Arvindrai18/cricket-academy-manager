const express = require('express');
const { getDB } = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Create Announcement
router.post('/', authenticateToken, async (req, res) => {
    const { academy_id, batch_id, title, content, target_audience, priority, is_published } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO announcements (academy_id, batch_id, title, content, target_audience, priority, is_published)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, batch_id || null, title, content, target_audience || 'ALL', priority || 'NORMAL', is_published === undefined ? 1 : is_published]
        );

        res.status(201).json({ id: result.lastID, message: 'Announcement created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Announcements for Academy (or specific batch)
router.get('/:academyId', async (req, res) => {
    const { batch_id, audience } = req.query;

    try {
        const db = await getDB();
        let query = 'SELECT * FROM announcements WHERE academy_id = ? AND is_published = 1';
        let params = [req.params.academyId];

        if (batch_id) {
            query += ' AND (batch_id = ? OR batch_id IS NULL)';
            params.push(batch_id);
        }

        if (audience) {
            query += ' AND (target_audience = ? OR target_audience = "ALL")';
            params.push(audience);
        }

        query += ' ORDER BY created_at DESC';

        const announcements = await db.all(query, params);
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Announcement
router.put('/:id', authenticateToken, async (req, res) => {
    const { title, content, target_audience, priority, is_published, batch_id } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE announcements 
             SET title = ?, content = ?, target_audience = ?, priority = ?, is_published = ?, batch_id = ?
             WHERE id = ?`,
            [title, content, target_audience, priority, is_published, batch_id, req.params.id]
        );
        res.json({ message: 'Announcement updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Announcement
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
