const express = require('express');
const { getDB } = require('../db');
const router = express.Router();

// Record Payment
router.post('/', async (req, res) => {
    const { academy_id, student_id, amount, due_date, payment_date, payment_mode, status } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO fee_payments (academy_id, student_id, amount, due_date, payment_date, payment_mode, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, student_id, amount, due_date, payment_date, payment_mode, status || 'PENDING']
        );
        res.status(201).json({ id: result.lastID, message: 'Payment recorded' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Payments for Academy
router.get('/:academyId', async (req, res) => {
    try {
        const db = await getDB();
        const payments = await db.all(
            `SELECT p.*, s.first_name, s.last_name 
             FROM fee_payments p
             JOIN students s ON p.student_id = s.id
             WHERE p.academy_id = ?`,
            [req.params.academyId]
        );
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// Razorpay Config
const Razorpay = require('razorpay');
// TODO: Move credentials to .env
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

// Create Order
router.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;
    try {
        const options = {
            amount: amount * 100, // Amount in paise
            currency,
            receipt,
        };
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Razorpay Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment
router.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_db_id } = req.body;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder');

    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
        // Payment is successful, update DB
        try {
            const db = await getDB();
            await db.run(
                `UPDATE fee_payments SET status = 'PAID', payment_date = DATE('now'), payment_mode = 'ONLINE' WHERE id = ?`,
                [payment_db_id]
            );
            res.json({ status: 'success' });
        } catch (error) {
            res.status(500).json({ error: 'DB Update Failed' });
        }
    } else {
        res.status(400).json({ status: 'failure' });
    }
});
