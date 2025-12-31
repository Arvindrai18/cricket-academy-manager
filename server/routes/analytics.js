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

// Revenue Chart Data (Last 6 Months)
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
            LIMIT 6
        `, [academyId]);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
