const { getDB } = require('../db');

async function migrateMatchFormat() {
    try {
        const db = await getDB();
        console.log('Adding match_format to matches table...');

        await db.exec(`
            ALTER TABLE matches ADD COLUMN match_format TEXT DEFAULT 'T20';
        `).catch(() => console.log('  (match_format column already exists)'));

        await db.exec(`
            ALTER TABLE matches ADD COLUMN team_a_score INTEGER DEFAULT 0;
            ALTER TABLE matches ADD COLUMN team_a_wickets INTEGER DEFAULT 0;
            ALTER TABLE matches ADD COLUMN team_a_overs REAL DEFAULT 0;
            ALTER TABLE matches ADD COLUMN team_b_score INTEGER DEFAULT 0;
            ALTER TABLE matches ADD COLUMN team_b_wickets INTEGER DEFAULT 0;
            ALTER TABLE matches ADD COLUMN team_b_overs REAL DEFAULT 0;
        `).catch(() => console.log('  (score columns already exist)'));

        console.log('✓ Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateMatchFormat();
