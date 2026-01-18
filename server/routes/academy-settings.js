const express = require('express');
const { getDB } = require('../db');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// Get Academy Settings
router.get('/:academyId', authenticateToken, async (req, res) => {
    try {
        const db = await getDB();
        let settings = await db.get('SELECT * FROM academy_settings WHERE academy_id = ?', [req.params.academyId]);

        if (!settings) {
            // Return default settings if none exist
            settings = {
                academy_id: req.params.academyId,
                primary_color: '#1e40af',
                secondary_color: '#fbbf24'
            };
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Academy Settings
router.post('/', authenticateToken, async (req, res) => {
    const { academy_id, logo_url, primary_color, secondary_color, receipt_footer, sms_sender_id, email_signature, custom_domain } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `INSERT INTO academy_settings (academy_id, logo_url, primary_color, secondary_color, receipt_footer, sms_sender_id, email_signature, custom_domain)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(academy_id) DO UPDATE SET
                logo_url = excluded.logo_url,
                primary_color = excluded.primary_color,
                secondary_color = excluded.secondary_color,
                receipt_footer = excluded.receipt_footer,
                sms_sender_id = excluded.sms_sender_id,
                email_signature = excluded.email_signature,
                custom_domain = excluded.custom_domain`,
            [academy_id, logo_url, primary_color, secondary_color, receipt_footer, sms_sender_id, email_signature, custom_domain]
        );

        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
