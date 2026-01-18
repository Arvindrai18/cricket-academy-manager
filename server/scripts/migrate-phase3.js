const { getDB } = require('../db');

async function migratePhase3() {
    try {
        const db = await getDB();

        console.log('Running Phase 3 database migrations...');

        // Announcements
        await db.exec(`
            CREATE TABLE IF NOT EXISTS announcements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                batch_id INTEGER, -- NULL means academy-wide
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                target_audience TEXT DEFAULT 'ALL', -- ALL, PARENTS, COACHES, STUDENTS
                priority TEXT DEFAULT 'NORMAL', -- NORMAL, IMPORTANT, URGENT
                is_published INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id),
                FOREIGN KEY (batch_id) REFERENCES batches(id)
            );
        `);
        console.log('✓ Created announcements table');

        // Media Assets
        await db.exec(`
            CREATE TABLE IF NOT EXISTS media_assets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                student_id INTEGER,
                match_id INTEGER,
                session_id INTEGER,
                asset_type TEXT NOT NULL, -- IMAGE, VIDEO, DOCUMENT
                url TEXT NOT NULL,
                description TEXT,
                tags TEXT, -- Comma separated tags
                uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id),
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (match_id) REFERENCES matches(id),
                FOREIGN KEY (session_id) REFERENCES training_sessions(id)
            );
        `);
        console.log('✓ Created media_assets table');

        // Skill Registry (Defining possible skills)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS skill_registry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                category TEXT NOT NULL, -- BATTING, BOWLING, FIELDING, FITNESS
                skill_name TEXT NOT NULL, -- e.g. Cover Drive, Yorker, Reflext Catch
                description TEXT,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created skill_registry table');

        // Student Skill Scores (Actual measurements)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS student_skill_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                coach_id INTEGER,
                score INTEGER NOT NULL, -- 1 to 10 scale
                assessment_date DATE DEFAULT CURRENT_DATE,
                notes TEXT,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (skill_id) REFERENCES skill_registry(id),
                FOREIGN KEY (coach_id) REFERENCES coaches(id)
            );
        `);
        console.log('✓ Created student_skill_scores table');

        // Academy Settings (Custom Branding & Config)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS academy_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER UNIQUE NOT NULL,
                logo_url TEXT,
                primary_color TEXT DEFAULT '#1e40af', -- Tailwind blue-800
                secondary_color TEXT DEFAULT '#fbbf24', -- Tailwind amber-400
                receipt_footer TEXT,
                sms_sender_id TEXT,
                email_signature TEXT,
                custom_domain TEXT,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created academy_settings table');

        // Add some default skills
        await db.exec(`
            INSERT OR IGNORE INTO skill_registry (academy_id, category, skill_name, description) VALUES
            (1, 'BATTING', 'Cover Drive', 'Ability to play the drive on the off side'),
            (1, 'BATTING', 'Forward Defense', 'Basic defensive technique'),
            (1, 'BOWLING', 'Line & Length', 'Consistency in delivery'),
            (1, 'BOWLING', 'Out-swinger', 'Ability to swing the ball away from right-hander'),
            (1, 'FIELDING', 'Ground Catching', 'Basic catching on the field'),
            (1, 'FITNESS', 'Beep Test', 'Cardiovascular endurance measurement');
        `);
        console.log('✓ Inserted default skills');

        console.log('\n✅ Phase 3 migrations completed successfully!');
    } catch (error) {
        console.error('❌ Phase 3 migration failed:', error);
        throw error;
    }
}

migratePhase3();
