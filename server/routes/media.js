const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDB } = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Configure multer for media uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/media'));
    },
    filename: (req, file, cb) => {
        const uniqueName = `media_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload Media Asset
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    const { academy_id, student_id, match_id, session_id, description, tags, asset_type } = req.body;

    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const url = `/uploads/media/${req.file.filename}`;
        const db = await getDB();

        const result = await db.run(
            `INSERT INTO media_assets (academy_id, student_id, match_id, session_id, asset_type, url, description, tags)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, student_id || null, match_id || null, session_id || null, asset_type || 'IMAGE', url, description, tags]
        );

        res.status(201).json({ id: result.lastID, url, message: 'Media uploaded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Media for student/match/session
router.get('/', authenticateToken, async (req, res) => {
    const { academy_id, student_id, match_id, session_id } = req.query;

    try {
        const db = await getDB();
        let query = 'SELECT * FROM media_assets WHERE academy_id = ?';
        let params = [academy_id];

        if (student_id) { query += ' AND student_id = ?'; params.push(student_id); }
        if (match_id) { query += ' AND match_id = ?'; params.push(match_id); }
        if (session_id) { query += ' AND session_id = ?'; params.push(session_id); }

        query += ' ORDER BY uploaded_at DESC';

        const assets = await db.all(query, params);
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Media
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        // Option: we should also delete the physical file here
        await db.run('DELETE FROM media_assets WHERE id = ?', [req.params.id]);
        res.json({ message: 'Media asset deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
