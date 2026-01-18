const fs = require('fs');
const path = require('path');
const { getDB } = require('../db');

async function migratePhase2() {
    try {
        const db = await getDB();

        console.log('Running Phase 2 database migrations...');

        // Training Sessions
        await db.exec(`
            CREATE TABLE IF NOT EXISTS training_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                batch_id INTEGER,
                coach_id INTEGER,
                session_date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                venue TEXT,
                focus_area TEXT, -- BATTING, BOWLING, FIELDING, FITNESS, GENERAL
                session_notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id),
                FOREIGN KEY (batch_id) REFERENCES batches(id),
                FOREIGN KEY (coach_id) REFERENCES coaches(id)
            );
        `);
        console.log('✓ Created training_sessions table');

        // Drill Templates
        await db.exec(`
            CREATE TABLE IF NOT EXISTS drill_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                focus_area TEXT,
                duration_minutes INTEGER,
                difficulty_level TEXT, -- BEGINNER, INTERMEDIATE, ADVANCED
                equipment_needed TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created drill_templates table');

        // Session Drills (many-to-many)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS session_drills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                drill_template_id INTEGER,
                drill_name TEXT,
                duration_minutes INTEGER,
                notes TEXT,
                FOREIGN KEY (session_id) REFERENCES training_sessions(id),
                FOREIGN KEY (drill_template_id) REFERENCES drill_templates(id)
            );
        `);
        console.log('✓ Created session_drills table');

        // Equipment Inventory
        await db.exec(`
            CREATE TABLE IF NOT EXISTS equipment_inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                item_name TEXT NOT NULL,
                category TEXT, -- BAT, BALL, PAD, HELMET, GLOVES, OTHER
                quantity INTEGER DEFAULT 0,
                condition_status TEXT, -- EXCELLENT, GOOD, FAIR, POOR
                purchase_date DATE,
                purchase_price REAL,
                notes TEXT,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created equipment_inventory table');

        // Tournaments
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tournaments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                academy_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                tournament_type TEXT, -- KNOCKOUT, LEAGUE, ROUND_ROBIN
                start_date DATE NOT NULL,
                end_date DATE,
                venue TEXT,
                status TEXT DEFAULT 'UPCOMING', -- UPCOMING, ONGOING, COMPLETED
                winner_team_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (academy_id) REFERENCES academies(id)
            );
        `);
        console.log('✓ Created tournaments table');

        // Tournament Teams
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tournament_teams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                team_name TEXT NOT NULL,
                captain_name TEXT,
                matches_played INTEGER DEFAULT 0,
                matches_won INTEGER DEFAULT 0,
                matches_lost INTEGER DEFAULT 0,
                points INTEGER DEFAULT 0,
                net_run_rate REAL DEFAULT 0,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
            );
        `);
        console.log('✓ Created tournament_teams table');

        // Tournament Matches
        await db.exec(`
            CREATE TABLE IF NOT EXISTS tournament_matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                match_id INTEGER NOT NULL,
                team_a_id INTEGER NOT NULL,
                team_b_id INTEGER NOT NULL,
                match_number INTEGER,
                round_name TEXT, -- QUARTER_FINAL, SEMI_FINAL, FINAL, etc.
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
                FOREIGN KEY (match_id) REFERENCES matches(id),
                FOREIGN KEY (team_a_id) REFERENCES tournament_teams(id),
                FOREIGN KEY (team_b_id) REFERENCES tournament_teams(id)
            );
        `);
        console.log('✓ Created tournament_matches table');

        // Roles & Permissions
        await db.exec(`
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Created roles table');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                resource TEXT NOT NULL, -- students, payments, coaches, etc.
                action TEXT NOT NULL, -- create, read, update, delete
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✓ Created permissions table');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                role_id INTEGER NOT NULL,
                permission_id INTEGER NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id),
                FOREIGN KEY (permission_id) REFERENCES permissions(id),
                UNIQUE(role_id, permission_id)
            );
        `);
        console.log('✓ Created role_permissions table');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS user_roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                user_type TEXT NOT NULL, -- ACADEMY, COACH, PARENT
                role_id INTEGER NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id),
                UNIQUE(user_id, user_type, role_id)
            );
        `);
        console.log('✓ Created user_roles table');

        // Insert default roles
        await db.exec(`
            INSERT OR IGNORE INTO roles (id, name, description) VALUES
            (1, 'SUPER_ADMIN', 'Full access to all features'),
            (2, 'COACH', 'Access to students, attendance, and training sessions'),
            (3, 'ACCOUNTANT', 'Access to fees and payments only'),
            (4, 'PARENT', 'Read-only access to own children data');
        `);
        console.log('✓ Inserted default roles');

        console.log('\n✅ Phase 2 migrations completed successfully!');
    } catch (error) {
        console.error('❌ Phase 2 migration failed:', error);
        throw error;
    }
}

migratePhase2();
