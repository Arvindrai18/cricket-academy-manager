const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'smtp.gmail.com'
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Send Receipt Email
async function sendReceiptEmail(toEmail, studentName, amount, paymentDate, receiptPath) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'academy@example.com',
        to: toEmail,
        subject: 'Fee Payment Receipt - Cricket Academy',
        html: `
            <h2>Payment Receipt</h2>
            <p>Dear Parent,</p>
            <p>Thank you for your payment. Here are the details:</p>
            <ul>
                <li><strong>Student:</strong> ${studentName}</li>
                <li><strong>Amount:</strong> ₹${amount}</li>
                <li><strong>Date:</strong> ${paymentDate}</li>
            </li>
            <p>Please find the receipt attached.</p>
            <p>Best regards,<br>Cricket Academy Management</p>
        `,
        attachments: receiptPath ? [{ path: receiptPath }] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Receipt email sent to:', toEmail);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

// Send Fee Reminder
async function sendFeeReminder(toEmail, studentName, amount, dueDate) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'academy@example.com',
        to: toEmail,
        subject: 'Fee Payment Reminder - Cricket Academy',
        html: `
            <h2>Fee Payment Reminder</h2>
            <p>Dear Parent,</p>
            <p>This is a reminder that the following fee is due:</p>
            <ul>
                <li><strong>Student:</strong> ${studentName}</li>
                <li><strong>Amount:</strong> ₹${amount}</li>
                <li><strong>Due Date:</strong> ${dueDate}</li>
            </ul>
            <p>Please make the payment at your earliest convenience.</p>
            <p>Best regards,<br>Cricket Academy Management</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Reminder email sent to:', toEmail);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

// Send Generic Notification Email
async function sendNotificationEmail(toEmail, subject, message) {
    const mailOptions = {
        from: process.env.EMAIL_USER || 'academy@example.com',
        to: toEmail,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif;">
                ${message}
                <br><br>
                <p>Best regards,<br>Cricket Academy Management</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Notification email sent to:', toEmail);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

module.exports = {
    sendReceiptEmail,
    sendFeeReminder,
    sendNotificationEmail
};
