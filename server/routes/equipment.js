const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Add Equipment
router.post('/', async (req, res) => {
    const { academy_id, item_name, category, quantity, condition_status, purchase_date, purchase_price, notes } = req.body;

    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO equipment_inventory (academy_id, item_name, category, quantity, condition_status, purchase_date, purchase_price, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, item_name, category, quantity, condition_status, purchase_date, purchase_price, notes]
        );
        res.status(201).json({ id: result.lastID, message: 'Equipment added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Equipment for Academy
router.get('/:academyId', async (req, res) => {
    const { category, condition_status } = req.query;

    try {
        const db = await getDB();

        let query = 'SELECT * FROM equipment_inventory WHERE academy_id = ?';
        let params = [req.params.academyId];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (condition_status) {
            query += ' AND condition_status = ?';
            params.push(condition_status);
        }

        query += ' ORDER BY category, item_name';

        const equipment = await db.all(query, params);
        res.json(equipment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Equipment
router.put('/:id', async (req, res) => {
    const { item_name, category, quantity, condition_status, purchase_date, purchase_price, notes } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE equipment_inventory 
             SET item_name = ?, category = ?, quantity = ?, condition_status = ?, purchase_date = ?, purchase_price = ?, notes = ?
             WHERE id = ?`,
            [item_name, category, quantity, condition_status, purchase_date, purchase_price, notes, req.params.id]
        );
        res.json({ message: 'Equipment updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Quantity (for usage tracking)
router.patch('/:id/quantity', async (req, res) => {
    const { change } = req.body; // positive or negative number

    try {
        const db = await getDB();
        await db.run(
            'UPDATE equipment_inventory SET quantity = quantity + ? WHERE id = ?',
            [change, req.params.id]
        );
        res.json({ message: 'Quantity updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Equipment
router.delete('/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('DELETE FROM equipment_inventory WHERE id = ?', [req.params.id]);
        res.json({ message: 'Equipment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Equipment Summary (by category)
router.get('/summary/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const summary = await db.all(
            `SELECT category, COUNT(*) as item_count, SUM(quantity) as total_quantity, SUM(purchase_price * quantity) as total_value
             FROM equipment_inventory
             WHERE academy_id = ?
             GROUP BY category`,
            [req.params.academyId]
        );
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
