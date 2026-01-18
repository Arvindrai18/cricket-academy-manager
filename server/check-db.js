const { getDB } = require('./db');

async function checkDB() {
    try {
        const db = await getDB();
        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Tables:', JSON.stringify(tables, null, 2));
    } catch (error) {
        console.error('Error checking DB:', error);
    }
}

checkDB();
