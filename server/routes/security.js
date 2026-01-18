const express = require('express');
const { getDB } = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Create Audit Log Entry
router.post('/audit', authenticateToken, async (req, res) => {
    const { academy_id, user_id, user_type, action, resource, resource_id, details } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;

    try {
        const db = await getDB();
        await db.run(
            `INSERT INTO audit_logs (academy_id, user_id, user_type, action, resource, resource_id, details, ip_address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, user_id, user_type, action, resource, resource_id, details, ip_address]
        );
        res.status(201).json({ message: 'Audit log created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Audit Logs for Academy
router.get('/audit/:academyId', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const logs = await db.all(
            'SELECT * FROM audit_logs WHERE academy_id = ? ORDER BY created_at DESC LIMIT 100',
            [req.params.academyId]
        );
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// IP Whitelist Management
router.post('/whitelist', authenticateToken, async (req, res) => {
    const { academy_id, ip_address, label } = req.body;
    try {
        const db = await getDB();
        await db.run(
            'INSERT INTO ip_whitelist (academy_id, ip_address, label) VALUES (?, ?, ?)',
            [academy_id, ip_address, label]
        );
        res.status(201).json({ message: 'IP whitelisted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/whitelist/:academyId', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        const whitelist = await db.all('SELECT * FROM ip_whitelist WHERE academy_id = ?', [req.params.academyId]);
        res.json(whitelist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/whitelist/:id', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM ip_whitelist WHERE id = ?', [req.params.id]);
        res.json({ message: 'IP removed from whitelist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mock 2FA Toggle
router.patch('/2fa', authenticateToken, async (req, res) => {
    const { academy_id, enabled } = req.body;
    try {
        const db = await getDB();
        // In real world, would generate secret here
        const secret = enabled ? 'MOCK_SECRET_' + Math.random().toString(36).substring(7) : null;
        await db.run(
            'UPDATE academies SET is_two_factor_enabled = ?, two_factor_secret = ? WHERE id = ?',
            [enabled ? 1 : 0, secret, academy_id]
        );
        res.json({ message: `2FA ${enabled ? 'enabled' : 'disabled'}`, secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
