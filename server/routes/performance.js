const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Record Student Performance in a Match
router.post('/', async (req, res) => {
    const {
        student_id, match_id, runs_scored, balls_faced, fours, sixes,
        wickets_taken, overs_bowled, runs_conceded, catches, run_outs
    } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO student_match_performances 
             (student_id, match_id, runs_scored, balls_faced, fours, sixes, wickets_taken, overs_bowled, runs_conceded, catches, run_outs)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [student_id, match_id, runs_scored, balls_faced, fours, sixes, wickets_taken, overs_bowled, runs_conceded, catches, run_outs]
        );
        res.status(201).json({ id: result.lastID, message: 'Performance recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Student's Overall Statistics
router.get('/student/:studentId/stats', async (req, res) => {
    try {
        const db = await getDB();
        const stats = await db.get(
            `SELECT 
                COUNT(DISTINCT match_id) as matches_played,
                SUM(runs_scored) as total_runs,
                SUM(balls_faced) as total_balls,
                SUM(fours) as total_fours,
                SUM(sixes) as total_sixes,
                SUM(wickets_taken) as total_wickets,
                SUM(overs_bowled) as total_overs,
                SUM(runs_conceded) as total_runs_conceded,
                SUM(catches) as total_catches,
                SUM(run_outs) as total_run_outs,
                ROUND(CAST(SUM(runs_scored) AS FLOAT) / NULLIF(SUM(balls_faced), 0) * 100, 2) as strike_rate,
                ROUND(CAST(SUM(runs_conceded) AS FLOAT) / NULLIF(SUM(overs_bowled), 0), 2) as economy_rate,
                MAX(runs_scored) as highest_score
             FROM student_match_performances 
             WHERE student_id = ?`,
            [req.params.studentId]
        );
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Performance History for a Student
router.get('/student/:studentId/history', async (req, res) => {
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

// Academy Leaderboard (Top Batsmen)
router.get('/leaderboard/:academyId/batting', async (req, res) => {
    try {
        const db = await getDB();
        const limit = req.query.limit || 10;
        const leaderboard = await db.all(
            `SELECT 
                s.id, s.first_name, s.last_name, s.profile_picture,
                COUNT(DISTINCT p.match_id) as matches,
                SUM(p.runs_scored) as total_runs,
                MAX(p.runs_scored) as highest_score,
                ROUND(CAST(SUM(p.runs_scored) AS FLOAT) / NULLIF(SUM(p.balls_faced), 0) * 100, 2) as strike_rate,
                SUM(p.fours) as fours,
                SUM(p.sixes) as sixes
             FROM students s
             JOIN student_match_performances p ON s.id = p.student_id
             WHERE s.academy_id = ?
             GROUP BY s.id
             ORDER BY total_runs DESC
             LIMIT ?`,
            [req.params.academyId, limit]
        );
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Academy Leaderboard (Top Bowlers)
router.get('/leaderboard/:academyId/bowling', async (req, res) => {
    try {
        const db = await getDB();
        const limit = req.query.limit || 10;
        const leaderboard = await db.all(
            `SELECT 
                s.id, s.first_name, s.last_name, s.profile_picture,
                COUNT(DISTINCT p.match_id) as matches,
                SUM(p.wickets_taken) as total_wickets,
                SUM(p.overs_bowled) as overs_bowled,
                ROUND(CAST(SUM(p.runs_conceded) AS FLOAT) / NULLIF(SUM(p.overs_bowled), 0), 2) as economy_rate,
                MAX(p.wickets_taken) as best_bowling
             FROM students s
             JOIN student_match_performances p ON s.id = p.student_id
             WHERE s.academy_id = ?
             GROUP BY s.id
             HAVING total_wickets > 0
             ORDER BY total_wickets DESC, economy_rate ASC
             LIMIT ?`,
            [req.params.academyId, limit]
        );
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Performance Record
router.put('/:id', async (req, res) => {
    const {
        runs_scored, balls_faced, fours, sixes,
        wickets_taken, overs_bowled, runs_conceded, catches, run_outs
    } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE student_match_performances 
             SET runs_scored = ?, balls_faced = ?, fours = ?, sixes = ?,
                 wickets_taken = ?, overs_bowled = ?, runs_conceded = ?, catches = ?, run_outs = ?
             WHERE id = ?`,
            [runs_scored, balls_faced, fours, sixes, wickets_taken, overs_bowled, runs_conceded, catches, run_outs, req.params.id]
        );
        res.json({ message: 'Performance updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
