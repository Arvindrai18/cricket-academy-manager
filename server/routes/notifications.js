const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Notification
async function createNotification(user_id, user_type, type, title, message, priority = 'NORMAL', metadata = null) {
    try {
        const db = await getDB();
        await db.run(
            `INSERT INTO notifications (user_id, user_type, type, title, message, priority, metadata)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, user_type, type, title, message, priority, JSON.stringify(metadata)]
        );
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
}

// Get Notifications for User
router.get('/:userType/:userId', async (req, res) => {
    try {
        const db = await getDB();
        const notifications = await db.all(
            `SELECT * FROM notifications 
             WHERE user_id = ? AND user_type = ?
             ORDER BY sent_at DESC
             LIMIT 50`,
            [req.params.userId, req.params.userType]
        );
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark Notification as Read
router.put('/:id/read', async (req, res) => {
    try {
        const db = await getDB();
        await db.run(
            'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark All as Read
router.put('/read-all/:userType/:userId', async (req, res) => {
    try {
        const db = await getDB();
        await db.run(
            'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND user_type = ? AND read_at IS NULL',
            [req.params.userId, req.params.userType]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get/Update Notification Preferences
router.get('/preferences/:userType/:userId', async (req, res) => {
    try {
        const db = await getDB();
        let prefs = await db.get(
            'SELECT * FROM notification_preferences WHERE user_id = ? AND user_type = ?',
            [req.params.userId, req.params.userType]
        );

        // Create default if doesn't exist
        if (!prefs) {
            await db.run(
                `INSERT INTO notification_preferences (user_id, user_type) VALUES (?, ?)`,
                [req.params.userId, req.params.userType]
            );
            prefs = await db.get(
                'SELECT * FROM notification_preferences WHERE user_id = ? AND user_type = ?',
                [req.params.userId, req.params.userType]
            );
        }

        res.json(prefs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/preferences/:userType/:userId', async (req, res) => {
    const { email_enabled, sms_enabled, push_enabled, fee_reminders, attendance_alerts, achievements, announcements } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `INSERT OR REPLACE INTO notification_preferences 
             (user_id, user_type, email_enabled, sms_enabled, push_enabled, fee_reminders, attendance_alerts, achievements, announcements)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.userId, req.params.userType, email_enabled, sms_enabled, push_enabled, fee_reminders, attendance_alerts, achievements, announcements]
        );
        res.json({ message: 'Preferences updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Notification
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports.createNotification = createNotification;
