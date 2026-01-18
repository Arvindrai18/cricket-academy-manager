const express = require('express');
const { getDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create Match
router.post('/', authenticateToken, async (req, res) => {
    const { academy_id, team_a_name, team_b_name, venue, match_date, match_format } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO matches (academy_id, team_a_name, team_b_name, venue, match_date, match_format)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [academy_id, team_a_name, team_b_name, venue, match_date, match_format || 'T20']
        );
        res.status(201).json({ id: result.lastID, message: 'Match scheduled', format: match_format || 'T20' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Register Match Scores (Quick Result)
router.post('/:id/register-scores', authenticateToken, async (req, res) => {
    const { team_a_score, team_a_wickets, team_a_overs, team_b_score, team_b_wickets, team_b_overs, result } = req.body;
    try {
        const db = await getDB();

        // Update match with summary result
        await db.run(
            `UPDATE matches 
             SET status = 'COMPLETED', 
                 result = ?,
                 team_a_score = ?,
                 team_a_wickets = ?,
                 team_a_overs = ?,
                 team_b_score = ?,
                 team_b_wickets = ?,
                 team_b_overs = ?
             WHERE id = ?`,
            [result, team_a_score, team_a_wickets, team_a_overs, team_b_score, team_b_wickets, team_b_overs, req.params.id]
        );

        res.json({ message: 'Scores registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Match Status/Result
router.put('/:id', authenticateToken, async (req, res) => {
    const { status, result } = req.body;
    try {
        const db = await getDB();
        await db.run(
            `UPDATE matches SET status = ?, result = ? WHERE id = ?`,
            [status, result, req.params.id]
        );
        res.json({ message: 'Match updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Matches (Public)
router.get('/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const matches = await db.all('SELECT * FROM matches WHERE academy_id = ? ORDER BY match_date DESC', [req.params.academyId]);
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record Ball
router.post('/ball', authenticateToken, async (req, res) => {
    const { match_id, inning_number, over_number, ball_number, striker_name, non_striker_name, bowler_name, runs_scored, extras, extra_type, is_wicket, wicket_type } = req.body;
    try {
        const db = await getDB();
        await db.run(
            `INSERT INTO match_balls (match_id, inning_number, over_number, ball_number, striker_name, non_striker_name, bowler_name, runs_scored, extras, extra_type, is_wicket, wicket_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [match_id, inning_number, over_number, ball_number, striker_name, non_striker_name, bowler_name, runs_scored, extras, extra_type, is_wicket, wicket_type]
        );
        res.status(201).json({ message: 'Ball recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Match Scorecard (Simple aggregation)
router.get('/:matchId/scorecard', async (req, res) => {
    try {
        const db = await getDB();
        const balls = await db.all('SELECT * FROM match_balls WHERE match_id = ? ORDER BY id ASC', [req.params.matchId]);
        res.json(balls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
