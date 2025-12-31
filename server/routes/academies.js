const express = require('express');
const bcrypt = require('bcrypt');
const { getDB } = require('../db');
const router = express.Router();

// Register Academy
router.post('/register', async (req, res) => {
    const { name, owner_name, email, password, phone, subscription_plan } = req.body;
    try {
        const db = await getDB();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            `INSERT INTO academies (name, owner_name, email, password, phone, subscription_plan)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, owner_name, email, hashedPassword, phone, subscription_plan || 'FREE']
        );

        res.status(201).json({ id: result.lastID, message: 'Academy registered successfully' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') { // Handle unique email
            return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const db = await getDB();
        const academy = await db.get('SELECT * FROM academies WHERE email = ?', [email]);

        if (!academy) return res.status(404).json({ error: 'Academy not found' });

        const valid = await bcrypt.compare(password, academy.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign(
            { id: academy.id, name: academy.name, email: academy.email },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            academy: { id: academy.id, name: academy.name, email: academy.email }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
