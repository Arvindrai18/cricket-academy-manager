const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Tournament
router.post('/', async (req, res) => {
    const { academy_id, name, tournament_type, start_date, end_date, venue } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO tournaments (academy_id, name, tournament_type, start_date, end_date, venue)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [academy_id, name, tournament_type, start_date, end_date, venue]
        );
        res.status(201).json({ id: result.lastID, message: 'Tournament created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Tournaments for Academy
router.get('/:academyId', async (req, res) => {
    const { status } = req.query;

    try {
        const db = await getDB();

        let query = 'SELECT * FROM tournaments WHERE academy_id = ?';
        let params = [req.params.academyId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY start_date DESC';

        const tournaments = await db.all(query, params);
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Tournament Details with Teams
router.get('/detail/:tournamentId', async (req, res) => {
    try {
        const db = await getDB();

        const tournament = await db.get('SELECT * FROM tournaments WHERE id = ?', [req.params.tournamentId]);
        if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

        const teams = await db.all(
            'SELECT * FROM tournament_teams WHERE tournament_id = ? ORDER BY points DESC, net_run_rate DESC',
            [req.params.tournamentId]
        );

        const matches = await db.all(
            `SELECT tm.*, m.team_a_name, m.team_b_name, m.status, m.result
             FROM tournament_matches tm
             JOIN matches m ON tm.match_id = m.id
             WHERE tm.tournament_id = ?
             ORDER BY tm.match_number`,
            [req.params.tournamentId]
        );

        res.json({ ...tournament, teams, matches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Team to Tournament
router.post('/:tournamentId/teams', async (req, res) => {
    const { team_name, captain_name } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            'INSERT INTO tournament_teams (tournament_id, team_name, captain_name) VALUES (?, ?, ?)',
            [req.params.tournamentId, team_name, captain_name]
        );
        res.status(201).json({ id: result.lastID, message: 'Team added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Match to Tournament
router.post('/:tournamentId/matches', async (req, res) => {
    const { match_id, team_a_id, team_b_id, match_number, round_name } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            'INSERT INTO tournament_matches (tournament_id, match_id, team_a_id, team_b_id, match_number, round_name) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.tournamentId, match_id, team_a_id, team_b_id, match_number, round_name]
        );
        res.status(201).json({ id: result.lastID, message: 'Match added to tournament' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Tournament Status
router.patch('/:id/status', async (req, res) => {
    const { status, winner_team_id } = req.body;

    try {
        const db = await getDB();
        await db.run(
            'UPDATE tournaments SET status = ?, winner_team_id = ? WHERE id = ?',
            [status, winner_team_id, req.params.id]
        );
        res.json({ message: 'Tournament status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Points Table (after match result)
router.post('/update-points', async (req, res) => {
    const { tournament_id, team_id, won, runs_scored, runs_conceded, overs_faced } = req.body;

    try {
        const db = await getDB();

        // Update matches played
        await db.run(
            'UPDATE tournament_teams SET matches_played = matches_played + 1 WHERE id = ?',
            [team_id]
        );

        if (won) {
            await db.run(
                'UPDATE tournament_teams SET matches_won = matches_won + 1, points = points + 2 WHERE id = ?',
                [team_id]
            );
        } else {
            await db.run(
                'UPDATE tournament_teams SET matches_lost = matches_lost + 1 WHERE id = ?',
                [team_id]
            );
        }

        // Calculate and update net run rate (simplified)
        if (runs_scored && runs_conceded && overs_faced) {
            const runRate = runs_scored / overs_faced;
            const concededRate = runs_conceded / overs_faced;
            const nrr = runRate - concededRate;

            await db.run(
                'UPDATE tournament_teams SET net_run_rate = ((net_run_rate * (matches_played - 1)) + ?) / matches_played WHERE id = ?',
                [nrr, team_id]
            );
        }

        res.json({ message: 'Points table updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Points Table
router.get('/:tournamentId/points-table', async (req, res) => {
    try {
        const db = await getDB();
        const pointsTable = await db.all(
            `SELECT * FROM tournament_teams 
             WHERE tournament_id = ? 
             ORDER BY points DESC, net_run_rate DESC`,
            [req.params.tournamentId]
        );
        res.json(pointsTable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
