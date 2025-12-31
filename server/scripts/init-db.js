const fs = require('fs');
const path = require('path');
const { getDB } = require('../db');

const schemaPath = path.resolve(__dirname, '../../database/schema.sql');

async function initDB() {
    try {
        const db = await getDB();
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        console.log('Running schema...');
        await db.exec(schema);
        console.log('Database initialized successfully.');
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

initDB();
