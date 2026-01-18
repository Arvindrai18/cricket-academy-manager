const { getDB } = require('../db');

async function migratePhase4() {
    try {
        const db = await getDB();

        console.log('Running Phase 4 database migrations...');

        // Audit Logs
        await db.exec(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_type TEXT NOT NULL,
                action TEXT NOT NULL,
                resource TEXT NOT NULL,
                resource_id INTEGER,
                details TEXT, -- JSON string for before/after states
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created audit_logs table');

        // IP Whitelist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS ip_whitelist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                ip_address TEXT NOT NULL,
                label TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id),
                UNIQUE(academy_id, ip_address)
            );
        `);
        console.log('✓ Created ip_whitelist table');

        // Add 2FA support to academies table
        await db.exec(`
            ALTER TABLE academies ADD COLUMN two_factor_secret TEXT;
        `).catch(() => console.log('  (two_factor_secret column already exists)'));

        await db.exec(`
            ALTER TABLE academies ADD COLUMN is_two_factor_enabled INTEGER DEFAULT 0;
        `).catch(() => console.log('  (is_two_factor_enabled column already exists)'));

        // Performance Indexes
        await db.exec(`CREATE INDEX IF NOT EXISTS idx_students_academy ON students(academy_id);`);
        await db.exec(`CREATE INDEX IF NOT EXISTS idx_payments_student ON fee_payments(student_id);`);
        await db.exec(`CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);`);
        await db.exec(`CREATE INDEX IF NOT EXISTS idx_performance_student ON student_match_performances(student_id);`);
        console.log('✓ Created performance indexes');

        console.log('\n✅ Phase 4 migrations completed successfully!');
    } catch (error) {
        console.error('❌ Phase 4 migration failed:', error);
        throw error;
    }
}

migratePhase4();
