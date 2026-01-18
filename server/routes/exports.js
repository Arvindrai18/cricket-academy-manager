const express = require('express');
const { getDB } = require('../db');
const { exportStudentsToExcel, exportPaymentsToExcel, exportPerformanceToExcel } = require('../services/excel');
const router = express.Router();

// Export Students to Excel
router.get('/students/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const academy = await db.get('SELECT name FROM academies WHERE id = ?', [req.params.academyId]);
        const students = await db.all(
            `SELECT s.*, b.name as batch_name 
             FROM students s 
             LEFT JOIN batches b ON s.batch_id = b.id 
             WHERE s.academy_id = ?`,
            [req.params.academyId]
        );

        const filepath = await exportStudentsToExcel(students, academy.name);
        res.download(filepath, `students_export.xlsx`, (err) => {
            if (!err) {
                // Clean up file after download
                setTimeout(() => {
                    require('fs').unlinkSync(filepath);
                }, 5000);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Payments to Excel
router.get('/payments/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const academy = await db.get('SELECT name FROM academies WHERE id = ?', [req.params.academyId]);
        const payments = await db.all(
            `SELECT p.*, s.first_name, s.last_name 
             FROM fee_payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.academy_id = ?`,
            [req.params.academyId]
        );

        const filepath = await exportPaymentsToExcel(payments, academy.name);
        res.download(filepath, `payments_export.xlsx`, (err) => {
            if (!err) {
                setTimeout(() => {
                    require('fs').unlinkSync(filepath);
                }, 5000);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export Performance Leaderboard to Excel
router.get('/performance/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const academy = await db.get('SELECT name FROM academies WHERE id = ?', [req.params.academyId]);

        const performances = await db.all(
            `SELECT 
                s.first_name, s.last_name,
                COUNT(DISTINCT p.match_id) as matches,
                SUM(p.runs_scored) as total_runs,
                MAX(p.runs_scored) as highest_score,
                ROUND(CAST(SUM(p.runs_scored) AS FLOAT) / NULLIF(SUM(p.balls_faced), 0) * 100, 2) as strike_rate,
                SUM(p.wickets_taken) as total_wickets,
                ROUND(CAST(SUM(p.runs_conceded) AS FLOAT) / NULLIF(SUM(p.overs_bowled), 0), 2) as economy_rate,
                SUM(p.catches) as total_catches
             FROM students s
             LEFT JOIN student_match_performances p ON s.id = p.student_id
             WHERE s.academy_id = ?
             GROUP BY s.id`,
            [req.params.academyId]
        );

        const filepath = await exportPerformanceToExcel(performances, academy.name);
        res.download(filepath, `performance_export.xlsx`, (err) => {
            if (!err) {
                setTimeout(() => {
                    require('fs').unlinkSync(filepath);
                }, 5000);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
