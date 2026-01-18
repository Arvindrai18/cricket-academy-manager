const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Create Fee Template
router.post('/templates', async (req, res) => {
    const { academy_id, batch_id, name, amount, frequency, due_day } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO fee_templates (academy_id, batch_id, name, amount, frequency, due_day)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [academy_id, batch_id, name, amount, frequency, due_day]
        );
        res.status(201).json({ id: result.lastID, message: 'Fee template created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Templates for Academy
router.get('/templates/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const templates = await db.all(
            `SELECT t.*, b.name as batch_name 
             FROM fee_templates t
             LEFT JOIN batches b ON t.batch_id = b.id
             WHERE t.academy_id = ? AND t.is_active = 1`,
            [req.params.academyId]
        );
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate Fees from Template for All Students in Batch
router.post('/generate-from-template/:templateId', async (req, res) => {
    const { month, year } = req.body; // Optional: for tracking which month/year

    try {
        const db = await getDB();

        // Get template details
        const template = await db.get('SELECT * FROM fee_templates WHERE id = ?', [req.params.templateId]);
        if (!template) return res.status(404).json({ error: 'Template not found' });

        // Get all students in the batch (or all if batch_id is null)
        let query = 'SELECT id FROM students WHERE academy_id = ?';
        let params = [template.academy_id];

        if (template.batch_id) {
            query += ' AND batch_id = ?';
            params.push(template.batch_id);
        }

        const students = await db.all(query, params);

        // Calculate due date
        const dueDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth() + 1) - 1, template.due_day);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        // Generate fees for each student
        await db.exec('BEGIN TRANSACTION');

        const stmt = await db.prepare(
            `INSERT INTO fee_payments (academy_id, student_id, amount, due_date, status, template_id)
             VALUES (?, ?, ?, ?, 'PENDING', ?)`
        );

        for (const student of students) {
            await stmt.run(template.academy_id, student.id, template.amount, dueDateStr, template.id);
        }

        await stmt.finalize();
        await db.exec('COMMIT');

        res.json({ message: `Generated ${students.length} fee records`, count: students.length });
    } catch (error) {
        await db.exec('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

// Apply Discount to Payment
router.post('/:paymentId/discount', async (req, res) => {
    const { discount_amount, reason } = req.body;

    try {
        const db = await getDB();
        await db.run(
            `UPDATE fee_payments 
             SET discount_amount = ?, amount = amount - ?
             WHERE id = ?`,
            [discount_amount, discount_amount, req.params.paymentId]
        );
        res.json({ message: 'Discount applied' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Pending/Overdue Fees
router.get('/pending/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const today = new Date().toISOString().split('T')[0];

        const pendingFees = await db.all(
            `SELECT p.*, s.first_name, s.last_name, s.parent_phone,
                    CASE 
                        WHEN p.due_date < ? THEN 'OVERDUE'
                        WHEN DATE(p.due_date, '-7 days') <= ? THEN 'DUE_SOON'
                        ELSE 'PENDING'
                    END as urgency
             FROM fee_payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.academy_id = ? AND p.status = 'PENDING'
             ORDER BY p.due_date ASC`,
            [today, today, req.params.academyId]
        );
        res.json(pendingFees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Installment Plan
router.post('/:paymentId/installments', async (req, res) => {
    const { num_installments } = req.body;

    try {
        const db = await getDB();

        // Get original payment
        const payment = await db.get('SELECT * FROM fee_payments WHERE id = ?', [req.params.paymentId]);
        if (!payment) return res.status(404).json({ error: 'Payment not found' });

        const installmentAmount = payment.amount / num_installments;

        await db.exec('BEGIN TRANSACTION');

        // Delete original payment
        await db.run('DELETE FROM fee_payments WHERE id = ?', [req.params.paymentId]);

        // Create installments
        const stmt = await db.prepare(
            `INSERT INTO fee_payments (academy_id, student_id, amount, due_date, status, template_id, installment_number, discount_amount)
             VALUES (?, ?, ?, ?, 'PENDING', ?, ?, ?)`
        );

        for (let i = 1; i <= num_installments; i++) {
            const dueDate = new Date(payment.due_date);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            const dueDateStr = dueDate.toISOString().split('T')[0];

            await stmt.run(
                payment.academy_id,
                payment.student_id,
                installmentAmount,
                dueDateStr,
                payment.template_id,
                i,
                payment.discount_amount / num_installments
            );
        }

        await stmt.finalize();
        await db.exec('COMMIT');

        res.json({ message: `Created ${num_installments} installments` });
    } catch (error) {
        await db.exec('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
});

// Deactivate Template
router.delete('/templates/:id', async (req, res) => {
    try {
        const db = await getDB();
        await db.run('UPDATE fee_templates SET is_active = 0 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Template deactivated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
