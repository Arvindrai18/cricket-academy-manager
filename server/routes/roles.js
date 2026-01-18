const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Assign Role to User
router.post('/assign', async (req, res) => {
    const { user_id, user_type, role_id } = req.body;

    try {
        const db = await getDB();
        await db.run(
            'INSERT OR IGNORE INTO user_roles (user_id, user_type, role_id) VALUES (?, ?, ?)',
            [user_id, user_type, role_id]
        );
        res.json({ message: 'Role assigned' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User's Roles
router.get('/user/:userType/:userId', async (req, res) => {
    try {
        const db = await getDB();
        const roles = await db.all(
            `SELECT r.* FROM roles r
             JOIN user_roles ur ON r.id = ur.role_id
             WHERE ur.user_id = ? AND ur.user_type = ?`,
            [req.params.userId, req.params.userType]
        );
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Roles
router.get('/', async (req, res) => {
    try {
        const db = await getDB();
        const roles = await db.all('SELECT * FROM roles ORDER BY name');
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Custom Role
router.post('/', async (req, res) => {
    const { name, description } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            'INSERT INTO roles (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ id: result.lastID, message: 'Role created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Role Permissions
router.get('/:roleId/permissions', async (req, res) => {
    try {
        const db = await getDB();
        const permissions = await db.all(
            `SELECT p.* FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = ?`,
            [req.params.roleId]
        );
        res.json(permissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Assign Permission to Role
router.post('/:roleId/permissions', async (req, res) => {
    const { permission_id } = req.body;

    try {
        const db = await getDB();
        await db.run(
            'INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [req.params.roleId, permission_id]
        );
        res.json({ message: 'Permission assigned to role' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove Role from User
router.delete('/assign/:userType/:userId/:roleId', async (req, res) => {
    try {
        const db = await getDB();
        await db.run(
            'DELETE FROM user_roles WHERE user_id = ? AND user_type = ? AND role_id = ?',
            [req.params.userId, req.params.userType, req.params.roleId]
        );
        res.json({ message: 'Role removed from user' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
