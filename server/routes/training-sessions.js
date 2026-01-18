const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Training Session
router.post('/', async (req, res) => {
    const { academy_id, batch_id, coach_id, session_date, start_time, end_time, venue, focus_area, session_notes, drills } = req.body;

    try {
        const db = await getDB();

        // Create session
        const result = await db.run(
            `INSERT INTO training_sessions (academy_id, batch_id, coach_id, session_date, start_time, end_time, venue, focus_area, session_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, batch_id, coach_id, session_date, start_time, end_time, venue, focus_area, session_notes]
        );

        const sessionId = result.lastID;

        // Add drills if provided
        if (drills && drills.length > 0) {
            const stmt = await db.prepare(
                'INSERT INTO session_drills (session_id, drill_template_id, drill_name, duration_minutes, notes) VALUES (?, ?, ?, ?, ?)'
            );

            for (const drill of drills) {
                await stmt.run(sessionId, drill.drill_template_id, drill.drill_name, drill.duration_minutes, drill.notes);
            }

            await stmt.finalize();
        }

        res.status(201).json({ id: sessionId, message: 'Training session created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Training Sessions for Academy
router.get('/:academyId', async (req, res) => {
    const { from_date, to_date, batch_id } = req.query;

    try {
        const db = await getDB();

        let query = `
            SELECT ts.*, b.name as batch_name, c.first_name as coach_first_name, c.last_name as coach_last_name
            FROM training_sessions ts
            LEFT JOIN batches b ON ts.batch_id = b.id
            LEFT JOIN coaches c ON ts.coach_id = c.id
            WHERE ts.academy_id = ?
        `;
        let params = [req.params.academyId];

        if (from_date) {
            query += ' AND ts.session_date >= ?';
            params.push(from_date);
        }
        if (to_date) {
            query += ' AND ts.session_date <= ?';
            params.push(to_date);
        }
        if (batch_id) {
            query += ' AND ts.batch_id = ?';
            params.push(batch_id);
        }

        query += ' ORDER BY ts.session_date DESC, ts.start_time DESC';

        const sessions = await db.all(query, params);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Session Details with Drills
router.get('/detail/:sessionId', async (req, res) => {
    try {
        const db = await getDB();

        const session = await db.get('SELECT * FROM training_sessions WHERE id = ?', [req.params.sessionId]);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const drills = await db.all('SELECT * FROM session_drills WHERE session_id = ?', [req.params.sessionId]);

        res.json({ ...session, drills });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Training Session
router.put('/:id', async (req, res) => {
    const { session_date, start_time, end_time, venue, focus_area, session_notes } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE training_sessions 
             SET session_date = ?, start_time = ?, end_time = ?, venue = ?, focus_area = ?, session_notes = ?
             WHERE id = ?`,
            [session_date, start_time, end_time, venue, focus_area, session_notes, req.params.id]
        );
        res.json({ message: 'Session updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Training Session
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM session_drills WHERE session_id = ?', [req.params.id]);
        await db.run('DELETE FROM training_sessions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
