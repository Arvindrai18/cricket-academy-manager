const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Dashboard Stats (KPIs)
router.get('/stats', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        const [students] = await db.all(`SELECT count(*) as count FROM students WHERE academy_id = ?`, [academyId]);
        const [batches] = await db.all(`SELECT count(*) as count FROM batches WHERE academy_id = ?`, [academyId]);
        const [matches] = await db.all(`SELECT count(*) as count FROM matches WHERE academy_id = ?`, [academyId]);

        const [revenue] = await db.all(`
            SELECT SUM(amount) as total 
            FROM fee_payments 
            WHERE academy_id = ? AND status = 'PAID'
        `, [academyId]);

        res.json({
            totalStudents: students.count,
            totalBatches: batches.count,
            totalMatches: matches.count,
            totalRevenue: revenue.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revenue Chart Data (Last 12 Months with trend)
router.get('/revenue-chart', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        // Group by Month (YYYY-MM)
        const data = await db.all(`
            SELECT strftime('%Y-%m', payment_date) as month, SUM(amount) as total
            FROM fee_payments
            WHERE academy_id = ? AND status = 'PAID'
            GROUP BY month
            ORDER BY month ASC
            LIMIT 12
        `, [academyId]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Student Retention Analysis
router.get('/retention', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        // Students enrolled in last 6 months
        const recentStudents = await db.all(`
            SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as enrolled
            FROM students
            WHERE academy_id = ?
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        `, [academyId]);

        // Active students (attended in last 30 days)
        const activeStudents = await db.get(`
            SELECT COUNT(DISTINCT student_id) as active_count
            FROM attendance
            WHERE student_id IN (SELECT id FROM students WHERE academy_id = ?)
            AND date >= DATE('now', '-30 days')
        `, [academyId]);

        // Total students
        const totalStudents = await db.get(
            'SELECT COUNT(*) as total FROM students WHERE academy_id = ?',
            [academyId]
        );

        const retentionRate = totalStudents.total > 0
            ? ((activeStudents.active_count / totalStudents.total) * 100).toFixed(2)
            : 0;

        res.json({
            enrollmentTrend: recentStudents,
            activeStudents: activeStudents.active_count,
            totalStudents: totalStudents.total,
            retentionRate: retentionRate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Attendance Trends
router.get('/attendance-trends', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        const trends = await db.all(`
            SELECT 
                DATE(date) as date,
                COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'ABSENT' THEN 1 END) as absent_count,
                COUNT(*) as total_count
            FROM attendance
            WHERE student_id IN (SELECT id FROM students WHERE academy_id = ?)
            AND date >= DATE('now', '-30 days')
            GROUP BY DATE(date)
            ORDER BY date DESC
        `, [academyId]);

        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance Dashboard Summary
router.get('/performance-dashboard', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        // Total matches played
        const matchesPlayed = await db.get(
            'SELECT COUNT(*) as count FROM matches WHERE academy_id = ?',
            [academyId]
        );

        // Top performers
        const topBatsmen = await db.all(`
            SELECT s.first_name, s.last_name, SUM(p.runs_scored) as total_runs
            FROM students s
            JOIN student_match_performances p ON s.id = p.student_id
            WHERE s.academy_id = ?
            GROUP BY s.id
            ORDER BY total_runs DESC
            LIMIT 5
        `, [academyId]);

        const topBowlers = await db.all(`
            SELECT s.first_name, s.last_name, SUM(p.wickets_taken) as total_wickets
            FROM students s
            JOIN student_match_performances p ON s.id = p.student_id
            WHERE s.academy_id = ?
            GROUP BY s.id
            ORDER BY total_wickets DESC
            LIMIT 5
        `, [academyId]);

        res.json({
            matchesPlayed: matchesPlayed.count,
            topBatsmen,
            topBowlers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fee Collection Rate
router.get('/fee-collection-rate', async (req, res) => {
    try {
        const db = await getDB();
        const academyId = req.user.id;

        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_fees,
                SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as paid_count,
                SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_count,
                SUM(CASE WHEN status = 'PAID' THEN amount ELSE 0 END) as collected_amount,
                SUM(amount) as total_amount
            FROM fee_payments
            WHERE academy_id = ?
        `, [academyId]);

        const collectionRate = stats.total_amount > 0
            ? ((stats.collected_amount / stats.total_amount) * 100).toFixed(2)
            : 0;

        res.json({
            ...stats,
            collectionRate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
