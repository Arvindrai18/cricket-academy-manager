const fs = require('fs');
const path = require('path');
const { getDB } = require('../db');

async function migrateDB() {
    try {
        const db = await getDB();

        console.log('Running database migrations...');

        // Student Performance Tracking
        await db.exec(`
            CREATE TABLE IF NOT EXISTS student_match_performances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                match_id INTEGER NOT NULL,
                runs_scored INTEGER DEFAULT 0,
                balls_faced INTEGER DEFAULT 0,
                fours INTEGER DEFAULT 0,
                sixes INTEGER DEFAULT 0,
                wickets_taken INTEGER DEFAULT 0,
                overs_bowled REAL DEFAULT 0,
                runs_conceded INTEGER DEFAULT 0,
                catches INTEGER DEFAULT 0,
                run_outs INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (match_id) REFERENCES matches(id)
            );
        `);
        console.log('✓ Created student_match_performances table');

        // Fee Templates
        await db.exec(`
            CREATE TABLE IF NOT EXISTS fee_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                batch_id INTEGER,
                name TEXT NOT NULL,
                amount REAL NOT NULL,
                frequency TEXT NOT NULL, -- MONTHLY, QUARTERLY, YEARLY, ONE_TIME
                due_day INTEGER DEFAULT 1, -- Day of month
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id),
                FOREIGN KEY (batch_id) REFERENCES batches(id)
            );
        `);
        console.log('✓ Created fee_templates table');

        // Add columns to fee_payments
        await db.exec(`
            ALTER TABLE fee_payments ADD COLUMN discount_amount REAL DEFAULT 0;
        `).catch(() => console.log('  (discount_amount column already exists)'));

        await db.exec(`
            ALTER TABLE fee_payments ADD COLUMN installment_number INTEGER DEFAULT 1;
        `).catch(() => console.log('  (installment_number column already exists)'));

        await db.exec(`
            ALTER TABLE fee_payments ADD COLUMN receipt_url TEXT;
        `).catch(() => console.log('  (receipt_url column already exists)'));

        await db.exec(`
            ALTER TABLE fee_payments ADD COLUMN template_id INTEGER;
        `).catch(() => console.log('  (template_id column already exists)'));

        console.log('✓ Updated fee_payments table');

        // Coaches
        await db.exec(`
            CREATE TABLE IF NOT EXISTS coaches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                specialization TEXT, -- BATTING, BOWLING, FIELDING, ALL_ROUNDER
                certifications TEXT,
                experience_years INTEGER,
                salary REAL,
                joining_date DATE,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created coaches table');

        // Coach-Batch Assignments
        await db.exec(`
            CREATE TABLE IF NOT EXISTS coach_batch_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                coach_id INTEGER NOT NULL,
                batch_id INTEGER NOT NULL,
                assigned_date DATE DEFAULT CURRENT_DATE,
                is_active INTEGER DEFAULT 1,
                FOREIGN KEY (coach_id) REFERENCES coaches(id),
                FOREIGN KEY (batch_id) REFERENCES batches(id),
                UNIQUE(coach_id, batch_id)
            );
        `);
        console.log('✓ Created coach_batch_assignments table');

        // Notifications
        await db.exec(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                user_type TEXT NOT NULL, -- ACADEMY, PARENT, COACH
                type TEXT NOT NULL, -- FEE_DUE, ATTENDANCE_ALERT, ACHIEVEMENT, ANNOUNCEMENT
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                priority TEXT DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH
                sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                metadata TEXT -- JSON string for additional data
            );
        `);
        console.log('✓ Created notifications table');

        // Notification Preferences
        await db.exec(`
            CREATE TABLE IF NOT EXISTS notification_preferences (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                user_type TEXT NOT NULL,
                email_enabled INTEGER DEFAULT 1,
                sms_enabled INTEGER DEFAULT 0,
                push_enabled INTEGER DEFAULT 1,
                fee_reminders INTEGER DEFAULT 1,
                attendance_alerts INTEGER DEFAULT 1,
                achievements INTEGER DEFAULT 1,
                announcements INTEGER DEFAULT 1,
                UNIQUE(user_id, user_type)
            );
        `);
        console.log('✓ Created notification_preferences table');

        // Parents
        await db.exec(`
            CREATE TABLE IF NOT EXISTS parents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created parents table');

        // Parent-Student Link
        await db.exec(`
            CREATE TABLE IF NOT EXISTS parent_student_links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                parent_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                relationship TEXT, -- FATHER, MOTHER, GUARDIAN
                FOREIGN KEY (parent_id) REFERENCES parents(id),
                FOREIGN KEY (student_id) REFERENCES students(id),
                UNIQUE(parent_id, student_id)
            );
        `);
        console.log('✓ Created parent_student_links table');

        // Add profile picture to students
        await db.exec(`
            ALTER TABLE students ADD COLUMN profile_picture TEXT;
        `).catch(() => console.log('  (profile_picture column already exists)'));

        console.log('✓ Updated students table');

        console.log('\n✅ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

migrateDB();
