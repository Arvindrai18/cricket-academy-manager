const express = require('express');
const { getDB } = require('../db');
const { generateReceipt } = require('../services/pdf');
const { sendReceiptEmail } = require('../services/email');
const router = express.Router();

// Record Payment (with receipt generation)
router.post('/', async (req, res) => {
    const { academy_id, student_id, amount, due_date, payment_date, payment_mode, status, send_email } = req.body;
    try {
        const db = await getDB();
        const result = await db.run(
            `INSERT INTO fee_payments (academy_id, student_id, amount, due_date, payment_date, payment_mode, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [academy_id, student_id, amount, due_date, payment_date, payment_mode, status || 'PENDING']
        );

        const paymentId = result.lastID;

        // If payment is completed, generate receipt
        if (status === 'PAID' && payment_date) {
            // Get payment details with student and academy info
            const payment = await db.get(
                `SELECT p.*, s.first_name, s.last_name, s.parent_phone, a.name as academy_name, a.phone as academy_phone
                 FROM fee_payments p
                 JOIN students s ON p.student_id = s.id
                 JOIN academies a ON p.academy_id = a.id
                 WHERE p.id = ?`,
                [paymentId]
            );

            // Generate PDF receipt
            const receiptPath = await generateReceipt(
                payment,
                { name: payment.academy_name, phone: payment.academy_phone },
                { first_name: payment.first_name, last_name: payment.last_name }
            );

            // Update payment with receipt URL
            await db.run(
                'UPDATE fee_payments SET receipt_url = ? WHERE id = ?',
                [receiptPath, paymentId]
            );

            // Send email if requested (requires parent email in students table)
            if (send_email && payment.parent_phone) {
                // In real scenario, you'd have parent email. For now using phone as placeholder
                // await sendReceiptEmail(parentEmail, `${payment.first_name} ${payment.last_name}`, amount, payment_date, receiptPath);
            }
        }

        res.status(201).json({ id: paymentId, message: 'Payment recorded' });
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
