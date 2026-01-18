const cron = require('node-cron');
const { getDB } = require('../db');
const { sendFeeReminder } = require('../services/email');
const { createNotification } = require('../routes/notifications');

// Run every day at 9 AM to send fee reminders
function startFeeReminderScheduler() {
    cron.schedule('0 9 * * *', async () => {
        console.log('Running fee reminder scheduler...');

        try {
            const db = await getDB();
            const today = new Date().toISOString().split('T')[0];
            const sevenDaysLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Get all pending fees that are due within 7 days or overdue
            const pendingFees = await db.all(
                `SELECT p.*, s.first_name, s.last_name, s.parent_phone,
                        a.id as academy_id, a.name as academy_name,
                        CASE 
                            WHEN p.due_date < ? THEN 'OVERDUE'
                            WHEN p.due_date <= ? THEN 'DUE_SOON'
                            ELSE 'PENDING'
                        END as urgency
                 FROM fee_payments p
                 JOIN students s ON p.student_id = s.id
                 JOIN academies a ON p.academy_id = a.id
                 WHERE p.status = 'PENDING' 
                 AND (p.due_date < ? OR p.due_date <= ?)`,
                [today, sevenDaysLater, today, sevenDaysLater]
            );

            console.log(`Found ${pendingFees.length} pending fees to remind`);

            for (const fee of pendingFees) {
                const studentName = `${fee.first_name} ${fee.last_name}`;

                // Create in-app notification
                await createNotification(
                    fee.academy_id,
                    'ACADEMY',
                    'FEE_DUE',
                    `Fee Payment ${fee.urgency === 'OVERDUE' ? 'Overdue' : 'Due Soon'}`,
                    `${studentName} has a ${fee.urgency === 'OVERDUE' ? 'overdue' : 'upcoming'} fee of ₹${fee.amount} (Due: ${fee.due_date})`,
                    fee.urgency === 'OVERDUE' ? 'HIGH' : 'NORMAL',
                    { payment_id: fee.id, student_id: fee.student_id }
                );

                // TODO: Send email reminder if parent email is available
                // await sendFeeReminder(parentEmail, studentName, fee.amount, fee.due_date);

                // TODO: Send SMS reminder if configured
            }

            console.log('Fee reminders sent successfully');
        } catch (error) {
            console.error('Fee reminder scheduler failed:', error);
        }
    });

    console.log('✓ Fee reminder scheduler started (runs daily at 9 AM)');
}

// Run attendance alert scheduler every day at 10 PM
function startAttendanceAlertScheduler() {
    cron.schedule('0 22 * * *', async () => {
        console.log('Running attendance alert scheduler...');

        try {
            const db = await getDB();
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            // Get students who have been absent for 3+ consecutive days
            const absentStudents = await db.all(
                `SELECT s.id, s.first_name, s.last_name, s.academy_id, s.parent_phone,
                        COUNT(*) as absent_days
                 FROM students s
                 JOIN attendance a ON s.id = a.student_id
                 WHERE a.status = 'ABSENT' 
                 AND a.date >= ?
                 GROUP BY s.id
                 HAVING absent_days >= 3`,
                [threeDaysAgo]
            );

            console.log(`Found ${absentStudents.length} students with 3+ consecutive absences`);

            for (const student of absentStudents) {
                // Create in-app notification
                await createNotification(
                    student.academy_id,
                    'ACADEMY',
                    'ATTENDANCE_ALERT',
                    'Low Attendance Alert',
                    `${student.first_name} ${student.last_name} has been absent for ${student.absent_days} consecutive days`,
                    'HIGH',
                    { student_id: student.id }
                );

                // TODO: Notify parents as well
            }

            console.log('Attendance alerts sent successfully');
        } catch (error) {
            console.error('Attendance alert scheduler failed:', error);
        }
    });

    console.log('✓ Attendance alert scheduler started (runs daily at 10 PM)');
}

module.exports = {
    startFeeReminderScheduler,
    startAttendanceAlertScheduler
};
